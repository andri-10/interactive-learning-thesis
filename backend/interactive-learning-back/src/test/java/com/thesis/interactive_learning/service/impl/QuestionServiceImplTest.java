package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.Question;
import com.thesis.interactive_learning.model.Quiz;
import com.thesis.interactive_learning.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionServiceImplTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionServiceImpl questionService;

    private Question testQuestion;
    private Quiz testQuiz;

    @BeforeEach
    void setUp() {
        testQuiz = new Quiz();
        testQuiz.setId(1L);
        testQuiz.setTitle("Test Quiz");

        testQuestion = new Question();
        testQuestion.setId(1L);
        testQuestion.setQuestionText("What is 2+2?");
        testQuestion.setQuestionType("MULTIPLE_CHOICE");
        testQuestion.setOptions(Arrays.asList("3", "4", "5", "6"));
        testQuestion.setCorrectOptionIndex(1);
        testQuestion.setExplanation("2+2 equals 4");
        testQuestion.setDifficultyLevel(1);
        testQuestion.setQuiz(testQuiz);
    }

    @Test
    void saveQuestion_ShouldReturnSavedQuestion() {
        // Given
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        // When
        Question result = questionService.saveQuestion(testQuestion);

        // Then
        assertNotNull(result);
        assertEquals(testQuestion.getId(), result.getId());
        assertEquals(testQuestion.getQuestionText(), result.getQuestionText());
        assertEquals(testQuestion.getQuestionType(), result.getQuestionType());
        verify(questionRepository, times(1)).save(testQuestion);
    }

    @Test
    void getQuestionById_WhenExists_ShouldReturnQuestion() {
        // Given
        when(questionRepository.findById(1L)).thenReturn(Optional.of(testQuestion));

        // When
        Optional<Question> result = questionService.getQuestionById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testQuestion.getId(), result.get().getId());
        assertEquals(testQuestion.getQuestionText(), result.get().getQuestionText());
        verify(questionRepository, times(1)).findById(1L);
    }

    @Test
    void getQuestionById_WhenNotExists_ShouldReturnEmpty() {
        // Given
        when(questionRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When
        Optional<Question> result = questionService.getQuestionById(999L);

        // Then
        assertFalse(result.isPresent());
        verify(questionRepository, times(1)).findById(999L);
    }

    @Test
    void getAllQuestions_ShouldReturnAllQuestions() {
        // Given
        Question question2 = new Question();
        question2.setId(2L);
        question2.setQuestionText("What is 3+3?");

        List<Question> questions = Arrays.asList(testQuestion, question2);
        when(questionRepository.findAll()).thenReturn(questions);

        // When
        List<Question> result = questionService.getAllQuestions();

        // Then
        assertEquals(2, result.size());
        assertEquals(testQuestion.getId(), result.get(0).getId());
        assertEquals(question2.getId(), result.get(1).getId());
        verify(questionRepository, times(1)).findAll();
    }

    @Test
    void getQuestionsByQuizId_ShouldReturnQuizQuestions() {
        // Given
        Long quizId = 1L;
        when(questionRepository.findByQuizId(quizId)).thenReturn(Arrays.asList(testQuestion));

        // When
        List<Question> result = questionService.getQuestionsByQuizId(quizId);

        // Then
        assertEquals(1, result.size());
        assertEquals(testQuestion.getId(), result.get(0).getId());
        assertEquals(testQuestion.getQuiz().getId(), quizId);
        verify(questionRepository, times(1)).findByQuizId(quizId);
    }

    @Test
    void getQuestionsByQuizId_WhenNoQuestions_ShouldReturnEmptyList() {
        // Given
        Long quizId = 999L;
        when(questionRepository.findByQuizId(quizId)).thenReturn(Arrays.asList());

        // When
        List<Question> result = questionService.getQuestionsByQuizId(quizId);

        // Then
        assertTrue(result.isEmpty());
        verify(questionRepository, times(1)).findByQuizId(quizId);
    }

    @Test
    void deleteQuestion_ShouldCallRepositoryDelete() {
        // Given
        Long questionId = 1L;

        // When
        questionService.deleteQuestion(questionId);

        // Then
        verify(questionRepository, times(1)).deleteById(questionId);
    }

    @Test
    void saveQuestion_WithNullValues_ShouldHandleGracefully() {
        // Given
        Question questionWithNulls = new Question();
        questionWithNulls.setId(2L);
        questionWithNulls.setQuestionText("Test question");
        // Other fields are null

        when(questionRepository.save(any(Question.class))).thenReturn(questionWithNulls);

        // When
        Question result = questionService.saveQuestion(questionWithNulls);

        // Then
        assertNotNull(result);
        assertEquals(questionWithNulls.getId(), result.getId());
        assertEquals(questionWithNulls.getQuestionText(), result.getQuestionText());
        assertNull(result.getOptions());
        assertNull(result.getCorrectOptionIndex());
        verify(questionRepository, times(1)).save(questionWithNulls);
    }
}