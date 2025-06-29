package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.Document;
import com.thesis.interactive_learning.model.StudyCollection;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.repository.DocumentRepository;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.repository.StudyCollectionRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceImplTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudyCollectionRepository studyCollectionRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private DocumentServiceImpl documentService;

    @TempDir
    Path tempDir;

    private User testUser;
    private Document testDocument;
    private StudyCollection testCollection;

    @BeforeEach
    void setUp() {
        // Set up the upload directory to temp directory
        ReflectionTestUtils.setField(documentService, "uploadDir", tempDir.toString());

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testCollection = new StudyCollection();
        testCollection.setId(1L);
        testCollection.setName("Test Collection");
        testCollection.setUser(testUser);

        testDocument = new Document();
        testDocument.setId(1L);
        testDocument.setTitle("Test Document");
        testDocument.setDescription("Test Description");
        testDocument.setFileName("test.pdf");
        testDocument.setFilePath(tempDir.resolve("test.pdf").toString());
        testDocument.setUser(testUser);
        testDocument.setUploadDate(LocalDateTime.now());
        testDocument.setFileSize(1024L);
        testDocument.setPageCount(5);
    }

    @Test
    void saveDocument_ShouldReturnSavedDocument() {
        // Given
        when(documentRepository.save(any(Document.class))).thenReturn(testDocument);

        // When
        Document result = documentService.saveDocument(testDocument);

        // Then
        assertNotNull(result);
        assertEquals(testDocument.getId(), result.getId());
        assertEquals(testDocument.getTitle(), result.getTitle());
        verify(documentRepository, times(1)).save(testDocument);
    }

    @Test
    void getDocumentById_WhenExists_ShouldReturnDocument() {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));

        // When
        Optional<Document> result = documentService.getDocumentById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testDocument.getId(), result.get().getId());
        verify(documentRepository, times(1)).findById(1L);
    }

    @Test
    void getDocumentById_WhenNotExists_ShouldReturnEmpty() {
        // Given
        when(documentRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When
        Optional<Document> result = documentService.getDocumentById(999L);

        // Then
        assertFalse(result.isPresent());
        verify(documentRepository, times(1)).findById(999L);
    }

    @Test
    void getAllDocuments_ShouldReturnAllDocuments() {
        // Given
        Document doc2 = new Document();
        doc2.setId(2L);
        doc2.setTitle("Document 2");

        List<Document> documents = Arrays.asList(testDocument, doc2);
        when(documentRepository.findAll()).thenReturn(documents);

        // When
        List<Document> result = documentService.getAllDocuments();

        // Then
        assertEquals(2, result.size());
        assertEquals(testDocument.getId(), result.get(0).getId());
        assertEquals(doc2.getId(), result.get(1).getId());
        verify(documentRepository, times(1)).findAll();
    }

    @Test
    void getDocumentsByUserId_ShouldReturnUserDocuments() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(documentRepository.findByUser(testUser)).thenReturn(Arrays.asList(testDocument));

        // When
        List<Document> result = documentService.getDocumentsByUserId(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testDocument.getId(), result.get(0).getId());
        verify(userRepository, times(1)).findById(1L);
        verify(documentRepository, times(1)).findByUser(testUser);
    }

    @Test
    void getDocumentsByUserId_WhenUserNotExists_ShouldThrowException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> documentService.getDocumentsByUserId(999L));
        assertEquals("User Not Found", exception.getMessage());
    }

    @Test
    void getDocumentsByCollectionId_ShouldReturnCollectionDocuments() {
        // Given
        when(documentRepository.findByStudyCollectionId(1L)).thenReturn(Arrays.asList(testDocument));

        // When
        List<Document> result = documentService.getDocumentsByCollectionId(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testDocument.getId(), result.get(0).getId());
        verify(documentRepository, times(1)).findByStudyCollectionId(1L);
    }

    @Test
    void getDocumentsByCollectionIdAndUserId_WithValidCollection_ShouldReturnDocuments() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));
        when(documentRepository.findByUserAndStudyCollectionId(testUser, 1L))
                .thenReturn(Arrays.asList(testDocument));

        // When
        List<Document> result = documentService.getDocumentsByCollectionIdAndUserId(1L, 1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testDocument.getId(), result.get(0).getId());
    }

    @Test
    void getDocumentsByCollectionIdAndUserId_WithNullCollection_ShouldReturnDocumentsWithoutCollection() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(documentRepository.findByUserAndStudyCollectionIsNull(testUser))
                .thenReturn(Arrays.asList(testDocument));

        // When
        List<Document> result = documentService.getDocumentsByCollectionIdAndUserId(null, 1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testDocument.getId(), result.get(0).getId());
    }

    @Test
    void getDocumentsByCollectionIdAndUserId_WithUnauthorizedCollection_ShouldThrowException() {
        // Given
        User otherUser = new User();
        otherUser.setId(2L);
        testCollection.setUser(otherUser);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> documentService.getDocumentsByCollectionIdAndUserId(1L, 1L));
        assertEquals("Access denied: Collection does not belong to the user", exception.getMessage());
    }

    @Test
    void getAvailableDocumentsByUserId_ShouldReturnDocumentsWithoutCollection() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(documentRepository.findByUserAndStudyCollectionIsNull(testUser))
                .thenReturn(Arrays.asList(testDocument));

        // When
        List<Document> result = documentService.getAvailableDocumentsByUserId(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testDocument.getId(), result.get(0).getId());
    }

    @Test
    void deleteDocument_WhenExists_ShouldDeleteSuccessfully() {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));

        // When
        documentService.deleteDocument(1L);

        // Then
        verify(documentRepository, times(1)).findById(1L);
        verify(documentRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteDocument_WhenNotExists_ShouldThrowException() {
        // Given
        when(documentRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> documentService.deleteDocument(999L));
        assertTrue(exception.getMessage().contains("Document not found"));
    }

    @Test
    void updateDocumentCollection_WithValidCollection_ShouldUpdateSuccessfully() {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));
        when(documentRepository.save(any(Document.class))).thenReturn(testDocument);
        when(quizRepository.findByDocumentId(1L)).thenReturn(Arrays.asList());

        // When
        Document result = documentService.updateDocumentCollection(1L, 1L);

        // Then
        assertNotNull(result);
        verify(documentRepository, times(1)).save(any(Document.class));
        verify(quizRepository, times(1)).findByDocumentId(1L);
    }

    @Test
    void updateDocumentCollection_WithNullCollection_ShouldRemoveCollection() {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));
        when(documentRepository.save(any(Document.class))).thenReturn(testDocument);
        when(quizRepository.findByDocumentId(1L)).thenReturn(Arrays.asList());

        // When
        Document result = documentService.updateDocumentCollection(1L, null);

        // Then
        assertNotNull(result);
        verify(documentRepository, times(1)).save(any(Document.class));
    }

    @Test
    void updateDocumentCollection_WithUnauthorizedCollection_ShouldThrowException() {
        // Given
        User otherUser = new User();
        otherUser.setId(2L);
        testCollection.setUser(otherUser);

        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> documentService.updateDocumentCollection(1L, 1L));
        assertEquals("Access denied: Collection does not belong to the document owner",
                exception.getMessage());
    }

    @Test
    void removeDocumentFromCollection_ShouldRemoveCollectionReference() {
        // Given
        testDocument.setStudyCollection(testCollection);
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));
        when(documentRepository.save(any(Document.class))).thenReturn(testDocument);
        when(quizRepository.findByDocumentId(1L)).thenReturn(Arrays.asList());

        // When
        Document result = documentService.removeDocumentFromCollection(1L);

        // Then
        assertNotNull(result);
        verify(documentRepository, times(1)).save(any(Document.class));
        verify(quizRepository, times(1)).findByDocumentId(1L);
    }
}