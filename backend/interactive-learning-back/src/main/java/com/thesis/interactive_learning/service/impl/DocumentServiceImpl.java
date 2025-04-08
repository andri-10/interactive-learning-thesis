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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        return documentRepository.findByStudyCollection(collectionId);
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
}
