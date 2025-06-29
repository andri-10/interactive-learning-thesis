package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.model.UserProgress;
import com.thesis.interactive_learning.repository.QuizRepository;
import com.thesis.interactive_learning.repository.UserProgressRepository;
import com.thesis.interactive_learning.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProgressServiceImplTest {

    @Mock
    private UserProgressRepository userProgressRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private UserProgressServiceImpl userProgressService;

    private User testUser;
    private Quiz testQuiz;
    private UserProgress testProgress;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testQuiz = new Quiz();
        testQuiz.setId(1L);
        testQuiz.setTitle("Test Quiz");

        testProgress = new UserProgress();
        testProgress.setId(1L);
        testProgress.setUser(testUser);
        testProgress.setQuiz(testQuiz);
        testProgress.setCompletedAt(LocalDateTime.now());
        testProgress.setTotalQuestions(10);
        testProgress.setCorrectAnswers(8);
        testProgress.setScore(80);
        testProgress.setCompletionTimeSeconds(120L);
        testProgress.setAccuracyPercentage(80.0);
    }

    @Test
    void saveUserProgress_ShouldCalculateAccuracyAndSave() {
        // Given
        UserProgress newProgress = new UserProgress();
        newProgress.setTotalQuestions(5);
        newProgress.setCorrectAnswers(4);

        when(userProgressRepository.save(any(UserProgress.class))).thenAnswer(invocation -> {
            UserProgress saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        // When
        UserProgress result = userProgressService.saveUserProgress(newProgress);

        // Then
        assertNotNull(result);
        assertEquals(80.0, result.getAccuracyPercentage());
        verify(userProgressRepository, times(1)).save(newProgress);
    }

    @Test
    void saveUserProgress_WithZeroQuestions_ShouldNotCalculateAccuracy() {
        // Given
        UserProgress newProgress = new UserProgress();
        newProgress.setTotalQuestions(0);
        newProgress.setCorrectAnswers(0);

        when(userProgressRepository.save(any(UserProgress.class))).thenReturn(newProgress);

        // When
        UserProgress result = userProgressService.saveUserProgress(newProgress);

        // Then
        assertNotNull(result);
        assertNull(result.getAccuracyPercentage());
        verify(userProgressRepository, times(1)).save(newProgress);
    }

    @Test
    void getUserProgressById_WhenExists_ShouldReturnProgress() {
        // Given
        when(userProgressRepository.findById(1L)).thenReturn(Optional.of(testProgress));

        // When
        Optional<UserProgress> result = userProgressService.getUserProgressById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testProgress.getId(), result.get().getId());
        verify(userProgressRepository, times(1)).findById(1L);
    }

    @Test
    void getUserProgressById_WhenNotExists_ShouldReturnEmpty() {
        // Given
        when(userProgressRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When
        Optional<UserProgress> result = userProgressService.getUserProgressById(999L);

        // Then
        assertFalse(result.isPresent());
        verify(userProgressRepository, times(1)).findById(999L);
    }

    @Test
    void getAllUserProgress_ShouldReturnAllProgress() {
        // Given
        UserProgress progress2 = new UserProgress();
        progress2.setId(2L);

        List<UserProgress> progressList = Arrays.asList(testProgress, progress2);
        when(userProgressRepository.findAll()).thenReturn(progressList);

        // When
        List<UserProgress> result = userProgressService.getAllUserProgress();

        // Then
        assertEquals(2, result.size());
        assertEquals(testProgress.getId(), result.get(0).getId());
        assertEquals(progress2.getId(), result.get(1).getId());
        verify(userProgressRepository, times(1)).findAll();
    }

    @Test
    void getUserProgressByUserId_ShouldReturnUserProgress() {
        // Given
        when(userProgressRepository.findByUserId(1L)).thenReturn(Arrays.asList(testProgress));

        // When
        List<UserProgress> result = userProgressService.getUserProgressByUserId(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testProgress.getId(), result.get(0).getId());
        verify(userProgressRepository, times(1)).findByUserId(1L);
    }

    @Test
    void getUserProgressByQuizId_ShouldReturnQuizProgress() {
        // Given
        when(userProgressRepository.findByQuizId(1L)).thenReturn(Arrays.asList(testProgress));

        // When
        List<UserProgress> result = userProgressService.getUserProgressByQuizId(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testProgress.getId(), result.get(0).getId());
        verify(userProgressRepository, times(1)).findByQuizId(1L);
    }

    @Test
    void getUserProgressByUserIdAndQuizId_ShouldReturnSpecificProgress() {
        // Given
        when(userProgressRepository.findByUserIdAndQuizId(1L, 1L)).thenReturn(Arrays.asList(testProgress));

        // When
        List<UserProgress> result = userProgressService.getUserProgressByUserIdAndQuizId(1L, 1L);

        // Then
        assertEquals(1, result.size());
        assertEquals(testProgress.getId(), result.get(0).getId());
        verify(userProgressRepository, times(1)).findByUserIdAndQuizId(1L, 1L);
    }

    @Test
    void deleteUserProgress_ShouldCallRepositoryDelete() {
        // Given
        Long progressId = 1L;

        // When
        userProgressService.deleteUserProgress(progressId);

        // Then
        verify(userProgressRepository, times(1)).deleteById(progressId);
    }

    @Test
    void getUserDashboard_ShouldReturnComprehensiveDashboard() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userProgressRepository.findByUserId(1L)).thenReturn(Arrays.asList(testProgress));
        when(quizRepository.findByDocumentUserId(1L)).thenReturn(Arrays.asList(testQuiz));

        // When
        Map<String, Object> dashboard = userProgressService.getUserDashboard(1L);

        // Then
        assertNotNull(dashboard);
        assertEquals(1L, dashboard.get("userId"));
        assertEquals("testuser", dashboard.get("username"));
        assertEquals(1, dashboard.get("totalQuizzesTaken"));
        assertEquals(80.0, dashboard.get("averageAccuracy"));
        assertEquals(80.0, dashboard.get("bestAccuracy"));
        assertEquals(10, dashboard.get("totalQuestionsAnswered"));
        assertEquals(8, dashboard.get("totalCorrectAnswers"));
        assertEquals(120L, dashboard.get("averageCompletionTime"));
        assertEquals(1, dashboard.get("uniqueQuizzesCompleted"));
        assertEquals(1, dashboard.get("totalAvailableQuizzes"));

        verify(userRepository, times(1)).findById(1L);
        verify(userProgressRepository, times(1)).findByUserId(1L);
        verify(quizRepository, times(1)).findByDocumentUserId(1L);
    }

    @Test
    void getUserDashboard_WhenUserNotExists_ShouldThrowException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userProgressService.getUserDashboard(999L));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void getUserDashboard_WithNoProgress_ShouldReturnDefaultValues() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userProgressRepository.findByUserId(1L)).thenReturn(Arrays.asList());
        when(quizRepository.findByDocumentUserId(1L)).thenReturn(Arrays.asList());

        // When
        Map<String, Object> dashboard = userProgressService.getUserDashboard(1L);

        // Then
        assertEquals(0, dashboard.get("totalQuizzesTaken"));
        assertEquals(0.0, dashboard.get("averageAccuracy"));
        assertEquals(0.0, dashboard.get("bestAccuracy"));
        assertEquals(0, dashboard.get("totalQuestionsAnswered"));
        assertEquals(0, dashboard.get("totalCorrectAnswers"));
        assertEquals(0L, dashboard.get("averageCompletionTime"));
    }

    @Test
    void getUserStats_ShouldReturnDetailedStatistics() {
        // Given
        UserProgress progress2 = new UserProgress();
        progress2.setAccuracyPercentage(90.0);
        progress2.setCompletionTimeSeconds(100L);
        progress2.setQuiz(testQuiz);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userProgressRepository.findByUserId(1L)).thenReturn(Arrays.asList(testProgress, progress2));

        // When
        Map<String, Object> stats = userProgressService.getUserStats(1L);

        // Then
        assertNotNull(stats);
        assertEquals(true, stats.get("hasData"));
        assertEquals(2, stats.get("totalAttempts"));
        assertEquals(85.0, stats.get("averageAccuracy"));
        assertEquals(80.0, stats.get("minimumAccuracy"));
        assertEquals(90.0, stats.get("maximumAccuracy"));
        assertEquals(110L, stats.get("averageCompletionTime"));
        assertEquals(100L, stats.get("fastestCompletionTime"));
        assertEquals(120L, stats.get("slowestCompletionTime"));

        @SuppressWarnings("unchecked")
        Map<String, Object> quizPerformance = (Map<String, Object>) stats.get("quizPerformance");
        assertNotNull(quizPerformance);
        assertTrue(quizPerformance.containsKey("Test Quiz"));
    }

    @Test
    void getUserStats_WithNoProgress_ShouldReturnNoDataFlag() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userProgressRepository.findByUserId(1L)).thenReturn(Arrays.asList());

        // When
        Map<String, Object> stats = userProgressService.getUserStats(1L);

        // Then
        assertEquals(false, stats.get("hasData"));
        assertEquals("No quiz attempts yet", stats.get("message"));
    }

    @Test
    void getRecentProgressByUserId_ShouldReturnLimitedRecentProgress() {
        // Given
        UserProgress progress2 = new UserProgress();
        progress2.setId(2L);
        progress2.setCompletedAt(LocalDateTime.now().minusDays(1));

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userProgressRepository.findByUserIdOrderByCompletedAtDesc(1L))
                .thenReturn(Arrays.asList(testProgress, progress2));

        // When
        List<UserProgress> result = userProgressService.getRecentProgressByUserId(1L, 5);

        // Then
        assertEquals(2, result.size());
        assertEquals(testProgress.getId(), result.get(0).getId());
        assertEquals(progress2.getId(), result.get(1).getId());
        verify(userRepository, times(1)).findById(1L);
        verify(userProgressRepository, times(1)).findByUserIdOrderByCompletedAtDesc(1L);
    }

    @Test
    void getRecentProgressByUserId_WhenUserNotExists_ShouldThrowException() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userProgressService.getRecentProgressByUserId(999L, 5));
        assertEquals("User not found", exception.getMessage());
    }
}