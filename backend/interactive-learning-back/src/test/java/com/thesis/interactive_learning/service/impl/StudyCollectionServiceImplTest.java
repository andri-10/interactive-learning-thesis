package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.Document;
import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.model.StudyCollection;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.DocumentRepository;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.repository.StudyCollectionRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudyCollectionServiceImplTest {

    @Mock
    private StudyCollectionRepository studyCollectionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private StudyCollectionServiceImpl studyCollectionService;

    private User testUser;
    private StudyCollection testCollection;
    private Document testDocument;
    private Quiz testQuiz;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testCollection = new StudyCollection();
        testCollection.setId(1L);
        testCollection.setName("Test Collection");
        testCollection.setDescription("Test Description");
        testCollection.setUser(testUser);

        testDocument = new Document();
        testDocument.setId(1L);
        testDocument.setTitle("Test Document");
        testDocument.setFileSize(1024L);
        testDocument.setPageCount(5);

        testQuiz = new Quiz();
        testQuiz.setId(1L);
        testQuiz.setTitle("Test Quiz");
    }

    @Test
    void saveCollection_ShouldReturnSavedCollection() {
        // Given
        when(studyCollectionRepository.save(any(StudyCollection.class))).thenReturn(testCollection);
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));

        // When
        StudyCollection result = studyCollectionService.saveCollection(testCollection);

        // Then
        assertNotNull(result);
        assertEquals(testCollection.getId(), result.getId());
        assertEquals(testCollection.getName(), result.getName());
        verify(studyCollectionRepository, times(1)).save(testCollection);
        verify(studyCollectionRepository, times(1)).findById(1L);
    }

    @Test
    void saveCollection_WithNullUser_ShouldThrowException() {
        // Given
        testCollection.setUser(null);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> studyCollectionService.saveCollection(testCollection));
        assertEquals("Collection must have a user assigned", exception.getMessage());
    }

    @Test
    void saveCollectionForUser_ShouldSetUserAndSave() {
        // Given
        StudyCollection newCollection = new StudyCollection();
        newCollection.setName("New Collection");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(studyCollectionRepository.save(any(StudyCollection.class))).thenReturn(testCollection);
        when(studyCollectionRepository.findById(any())).thenReturn(Optional.of(testCollection));

        // When
        StudyCollection result = studyCollectionService.saveCollectionForUser(newCollection, 1L);

        // Then
        assertNotNull(result);
        verify(userRepository, times(1)).findById(1L);
        verify(studyCollectionRepository, times(1)).save(any(StudyCollection.class));
    }

    @Test
    void saveCollectionForUser_WhenUserNotExists_ShouldThrowException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> studyCollectionService.saveCollectionForUser(testCollection, 999L));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void getCollectionById_WhenExists_ShouldReturnCollection() {
        // Given
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));

        // When
        Optional<StudyCollection> result = studyCollectionService.getCollectionById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testCollection.getId(), result.get().getId());
        verify(studyCollectionRepository, times(1)).findById(1L);
    }

    @Test
    void getCollectionById_WhenNotExists_ShouldReturnEmpty() {
        // Given
        when(studyCollectionRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When
        Optional<StudyCollection> result = studyCollectionService.getCollectionById(999L);

        // Then
        assertFalse(result.isPresent());
        verify(studyCollectionRepository, times(1)).findById(999L);
    }

    @Test
    void getAllCollections_ShouldReturnAllCollections() {
        // Given
        StudyCollection collection2 = new StudyCollection();
        collection2.setId(2L);
        collection2.setName("Collection 2");
        collection2.setUser(testUser);

        List<StudyCollection> collections = Arrays.asList(testCollection, collection2);
        when(studyCollectionRepository.findAll()).thenReturn(collections);

        // When
        List<StudyCollection> result = studyCollectionService.getAllCollections();

        // Then
        assertEquals(2, result.size());
        assertEquals(testCollection.getId(), result.get(0).getId());
        assertEquals(collection2.getId(), result.get(1).getId());
        verify(studyCollectionRepository, times(1)).findAll();
    }

    @Test
    void getCollectionsByUserId_ShouldReturnUserCollections() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(studyCollectionRepository.findByUser(testUser)).thenReturn(Arrays.asList(testCollection));

        // When
        List<StudyCollection> result = studyCollectionService.getCollectionsByUserId(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testCollection.getId(), result.get(0).getId());
        verify(userRepository, times(1)).findById(1L);
        verify(studyCollectionRepository, times(1)).findByUser(testUser);
    }

    @Test
    void getCollectionsByUserId_WhenUserNotExists_ShouldThrowException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> studyCollectionService.getCollectionsByUserId(999L));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void deleteCollection_ShouldRemoveReferencesAndDelete() {
        // Given
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));
        when(documentRepository.findByStudyCollectionId(1L)).thenReturn(Arrays.asList(testDocument));
        when(quizRepository.findByStudyCollectionId(1L)).thenReturn(Arrays.asList(testQuiz));

        // When
        studyCollectionService.deleteCollection(1L);

        // Then
        verify(studyCollectionRepository, times(1)).findById(1L);
        verify(documentRepository, times(1)).findByStudyCollectionId(1L);
        verify(quizRepository, times(1)).findByStudyCollectionId(1L);
        verify(documentRepository, times(1)).save(testDocument);
        verify(quizRepository, times(1)).save(testQuiz);
        verify(studyCollectionRepository, times(1)).deleteById(1L);

        // Verify references were removed
        assertNull(testDocument.getStudyCollection());
        assertNull(testQuiz.getStudyCollection());
    }

    @Test
    void deleteCollection_WhenNotExists_ShouldThrowException() {
        // Given
        when(studyCollectionRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> studyCollectionService.deleteCollection(999L));
        assertEquals("Collection not found", exception.getMessage());
    }

    @Test
    void getCollectionStats_ShouldReturnComprehensiveStats() {
        // Given
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));
        when(documentRepository.findByStudyCollectionId(1L)).thenReturn(Arrays.asList(testDocument));
        when(quizRepository.findByStudyCollectionId(1L)).thenReturn(Arrays.asList(testQuiz));

        // When
        Map<String, Object> stats = studyCollectionService.getCollectionStats(1L);

        // Then
        assertNotNull(stats);
        assertEquals(1L, stats.get("collectionId"));
        assertEquals("Test Collection", stats.get("collectionName"));
        assertEquals(1, stats.get("documentCount"));
        assertEquals(1, stats.get("quizCount"));
        assertEquals(2, stats.get("totalItems"));
        assertEquals(1L, stats.get("userId"));
        assertEquals("testuser", stats.get("userName"));
        assertEquals(1024L, stats.get("totalFileSize"));
        assertEquals(5, stats.get("totalPages"));
        assertEquals(5.0, stats.get("averagePagesPerDocument"));

        verify(studyCollectionRepository, times(1)).findById(1L);
        verify(documentRepository, times(2)).findByStudyCollectionId(1L); // Called twice
        verify(quizRepository, times(1)).findByStudyCollectionId(1L);
    }

    @Test
    void getCollectionStats_WhenCollectionNotExists_ShouldThrowException() {
        // Given
        when(studyCollectionRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> studyCollectionService.getCollectionStats(999L));
        assertEquals("Collection not found", exception.getMessage());
    }

    @Test
    void getCollectionStats_WithNoDocuments_ShouldReturnZeroStats() {
        // Given
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));
        when(documentRepository.findByStudyCollectionId(1L)).thenReturn(Arrays.asList());
        when(quizRepository.findByStudyCollectionId(1L)).thenReturn(Arrays.asList());

        // When
        Map<String, Object> stats = studyCollectionService.getCollectionStats(1L);

        // Then
        assertEquals(0, stats.get("documentCount"));
        assertEquals(0, stats.get("quizCount"));
        assertEquals(0, stats.get("totalItems"));
        assertEquals(0L, stats.get("totalFileSize"));
        assertEquals(0, stats.get("totalPages"));
        assertEquals(0.0, stats.get("averagePagesPerDocument"));
    }
}