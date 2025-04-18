package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.Document;
import com.thesis.interactive_learning.model.StudyCollection;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.DocumentRepository;
import com.thesis.interactive_learning.repository.StudyCollectionRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import com.thesis.interactive_learning.service.DocumentService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final StudyCollectionRepository studyCollectionRepository;


    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    public DocumentServiceImpl(DocumentRepository documentRepository, UserRepository userRepository, StudyCollectionRepository studyCollectionRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.studyCollectionRepository = studyCollectionRepository;
    }

    @Override
    public Document saveDocument(Document document) {
        return documentRepository.save(document);
    }

    @Override
    public Document uploadDocument(MultipartFile file, String title, String description, Long userId, Long collectionId) throws IOException {

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Not Found"));

        StudyCollection collection = null;
        if (collectionId != null) {
            collection = studyCollectionRepository.findById(collectionId)
                    .orElseThrow(() -> new RuntimeException("Collection not found"));
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(filename);

        file.transferTo(filePath.toFile());

        int pageCount = 0;
        try (PDDocument pdDocument = PDDocument.load(filePath.toFile())) {
            pageCount = pdDocument.getNumberOfPages();
        }

        Document document = new Document();
        document.setTitle(title);
        document.setDescription(description);
        document.setFileName(filename);
        document.setFilePath(filePath.toString());
        document.setUploadDate(LocalDateTime.now());
        document.setFileSize(file.getSize());
        document.setPageCount(pageCount);
        document.setUser(user);
        document.setStudyCollection(collection);

        return documentRepository.save(document);
    }

    @Override
    public Optional<Document> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public List<Document> getDocumentsByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Not Found"));

        return documentRepository.findByUser(user);
    }

    @Override
    public List<Document> getDocumentsByCollectionId(Long collectionId) {
        return documentRepository.findByStudyCollectionId(collectionId);
    }

    @Override
    public void deleteDocument(Long id) {
    Optional<Document> documentOpt = documentRepository.findById(id);
    if (documentOpt.isPresent()) {
        Document document = documentOpt.get();
        try{
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        }catch(IOException e){
            throw new RuntimeException("File not found", e);
        }
    }
    }

    @Override
    public String extractTextFromPdf(Long documentId) throws IOException {
        Document document = documentRepository.findById(documentId).orElseThrow(() -> new RuntimeException("Document Not Found"));
        File file = new File(document.getFilePath());
        if(!file.exists()){
            throw new RuntimeException("File not found");
        }

        try(PDDocument pdDocument = PDDocument.load(file)) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            return pdfStripper.getText(pdDocument);
        }
    }

    @Override
    public Map<String, Object> extractStructuredTextFromPdf(Long documentId) throws IOException {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        File file = new File(document.getFilePath());
        if (!file.exists()) {
            throw new RuntimeException("File not found on disk");
        }

        Map<String, Object> result = new HashMap<>();
        List<String> paragraphs = new ArrayList<>();

        try (PDDocument pdDocument = PDDocument.load(file)) {
            int totalPages = pdDocument.getNumberOfPages();
            result.put("pageCount", totalPages);

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);

            String fullText = stripper.getText(pdDocument);
            result.put("fullText", fullText);

            String[] lines = fullText.split("\n");
            StringBuilder currentParagraph = new StringBuilder();

            for (String line : lines) {
                if (line.trim().isEmpty() && currentParagraph.length() > 0) {
                    paragraphs.add(currentParagraph.toString().trim());
                    currentParagraph = new StringBuilder();
                } else if (!line.trim().isEmpty()) {
                    if (!currentParagraph.isEmpty()) {
                        currentParagraph.append(" ");
                    }
                    currentParagraph.append(line.trim());
                }
            }

            if (!currentParagraph.isEmpty()) {
                paragraphs.add(currentParagraph.toString().trim());
            }

            Map<Integer, String> pageTexts = new HashMap<>();
            for (int i = 1; i <= totalPages; i++) {
                stripper.setStartPage(i);
                stripper.setEndPage(i);
                pageTexts.put(i, stripper.getText(pdDocument));
            }
            result.put("pageTexts", pageTexts);

            List<String> possibleHeadings = new ArrayList<>();
            for (String paragraph : paragraphs) {
                if (paragraph.length() < 100 && (paragraph.endsWith(":") ||
                        paragraph.toUpperCase().equals(paragraph) ||
                        Character.isDigit(paragraph.charAt(0)))) {
                    possibleHeadings.add(paragraph);
                }
            }
            result.put("possibleHeadings", possibleHeadings);
        }

        result.put("paragraphs", paragraphs);
        return result;
    }

    public Map<String, Object> extractDocumentMetadata(Long documentId) throws IOException {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        File file = new File(document.getFilePath());
        Map<String, Object> metadata = new HashMap<>();

        try (PDDocument pdDocument = PDDocument.load(file)) {
            metadata.put("pageCount", pdDocument.getNumberOfPages());
            metadata.put("title", document.getTitle());

            if (pdDocument.getDocumentInformation() != null) {
                metadata.put("author", pdDocument.getDocumentInformation().getAuthor());
                metadata.put("subject", pdDocument.getDocumentInformation().getSubject());
                metadata.put("keywords", pdDocument.getDocumentInformation().getKeywords());
                metadata.put("creator", pdDocument.getDocumentInformation().getCreator());
                metadata.put("producer", pdDocument.getDocumentInformation().getProducer());
                metadata.put("creationDate", pdDocument.getDocumentInformation().getCreationDate());
            }
        }

        return metadata;
    }

}
