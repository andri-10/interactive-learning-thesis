package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.model.*;
import com.thesis.interactive_learning.repository.*;
import com.thesis.interactive_learning.service.AIQuizService;
import com.thesis.interactive_learning.service.DocumentService;
import com.thesis.interactive_learning.service.TextAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionGenerationServiceImplTest {

    @Mock
    private DocumentService documentService;

    @Mock
    private TextAnalysisService textAnalysisService;

    @Mock
    private AIQuizService aiQuizService;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private StudyCollectionRepository studyCollectionRepository;

    @InjectMocks
    private QuestionGenerationServiceImpl questionGenerationService;

    private Document testDocument;
    private StudyCollection testCollection;
    private Quiz testQuiz;
    private Question testQuestion;
    private Map<String, Object> structuredText;

    @BeforeEach
    void setUp() {
        testDocument = new Document();
        testDocument.setId(1L);
        testDocument.setTitle("Test Document");

        testCollection = new StudyCollection();
        testCollection.setId(1L);
        testCollection.setName("Test Collection");

        testQuestion = new Question();
        testQuestion.setId(1L);
        testQuestion.setQuestionText("What is machine learning?");
        testQuestion.setQuestionType("MULTIPLE_CHOICE");
        testQuestion.setOptions(Arrays.asList("AI subset", "Programming", "Database", "Network"));
        testQuestion.setCorrectOptionIndex(0);
        testQuestion.setExplanation("Machine learning is a subset of AI");
        testQuestion.setDifficultyLevel(2);

        testQuiz = new Quiz();
        testQuiz.setId(1L);
        testQuiz.setTitle("Test Quiz");
        testQuiz.setDocument(testDocument);

        structuredText = new HashMap<>();
        structuredText.put("fullText", "Machine learning is a subset of artificial intelligence that focuses on algorithms.");
    }

    @Test
    void generateQuizFromDocument_WithAI_ShouldGenerateQuizSuccessfully() throws IOException {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));
        when(studyCollectionRepository.findById(1L)).thenReturn(Optional.of(testCollection));
        when(documentService.extractStructuredTextFromPdf(1L)).thenReturn(structuredText);
        when(aiQuizService.generateAIQuestions(anyString(), eq(5), eq("MULTIPLE_CHOICE"), eq(2), eq(true)))
                .thenReturn(Arrays.asList(testQuestion));
        when(quizRepository.save(any(Quiz.class))).thenReturn(testQuiz);
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        // When
        Quiz result = questionGenerationService.generateQuizFromDocument(
                1L, 5, "AI Quiz", "MULTIPLE_CHOICE", 2, 1L, true, true);

        // Then
        assertNotNull(result);
        verify(documentRepository, times(1)).findById(1L);
        verify(studyCollectionRepository, times(1)).findById(1L);
        verify(documentService, times(1)).extractStructuredTextFromPdf(1L);
        verify(aiQuizService, times(1)).generateAIQuestions(anyString(), eq(5), eq("MULTIPLE_CHOICE"), eq(2), eq(true));
        verify(quizRepository, times(1)).save(any(Quiz.class));
        verify(questionRepository, times(1)).save(any(Question.class));
    }

    @Test
    void generateQuizFromDocument_WithoutAI_ShouldUseBasicGeneration() throws IOException {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));
        when(documentService.extractStructuredTextFromPdf(1L)).thenReturn(structuredText);
        when(textAnalysisService.extractSentences(anyString())).thenReturn(Arrays.asList(
                "Machine learning is important.",
                "It helps solve complex problems.",
                "AI is the future of technology."
        ));
        when(textAnalysisService.extractKeyTerms(anyString(), anyInt())).thenReturn(Map.of(
                "machine", 0.1,
                "learning", 0.1,
                "artificial", 0.08,
                "intelligence", 0.08
        ));
        when(quizRepository.save(any(Quiz.class))).thenReturn(testQuiz);
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        // When
        Quiz result = questionGenerationService.generateQuizFromDocument(
                1L, 3, "Basic Quiz", "MULTIPLE_CHOICE", 2, null, true, false);

        // Then
        assertNotNull(result);
        verify(documentService, times(1)).extractStructuredTextFromPdf(1L);
        verify(textAnalysisService, times(1)).extractSentences(anyString());
        verify(textAnalysisService, times(1)).extractKeyTerms(anyString(), anyInt());
        verify(aiQuizService, never()).generateAIQuestions(anyString(), anyInt(), anyString(), anyInt(), anyBoolean());
    }

    @Test
    void generateQuizFromDocument_WhenDocumentNotFound_ShouldThrowException() {
        // Given
        when(documentRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> questionGenerationService.generateQuizFromDocument(
                        999L, 5, "Quiz", "MULTIPLE_CHOICE", 2, null, true, true));
        assertEquals("Document not found", exception.getMessage());
    }

    @Test
    void generateQuizFromDocument_WhenCollectionNotFound_ShouldThrowException() {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));
        when(studyCollectionRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> questionGenerationService.generateQuizFromDocument(
                        1L, 5, "Quiz", "MULTIPLE_CHOICE", 2, 999L, true, true));
        assertEquals("Collection not found", exception.getMessage());
    }

    @Test
    void generateQuestionsFromText_WithAI_ShouldReturnAIQuestions() {
        // Given
        String text = "Machine learning is a subset of artificial intelligence.";
        when(aiQuizService.generateAIQuestions(text, 3, "TRUE_FALSE", 1, false))
                .thenReturn(Arrays.asList(testQuestion));

        // When
        List<Question> result = questionGenerationService.generateQuestionsFromText(
                text, 3, "TRUE_FALSE", 1, false, true);

        // Then
        assertEquals(1, result.size());
        assertEquals(testQuestion.getId(), result.get(0).getId());
        verify(aiQuizService, times(1)).generateAIQuestions(text, 3, "TRUE_FALSE", 1, false);
    }

    @Test
    void generateQuestionsFromText_WhenAIFails_ShouldFallbackToBasic() {
        // Given
        String text = "Machine learning is important for modern applications.";
        when(aiQuizService.generateAIQuestions(anyString(), anyInt(), anyString(), anyInt(), anyBoolean()))
                .thenThrow(new RuntimeException("AI service error"));
        when(textAnalysisService.extractSentences(text)).thenReturn(Arrays.asList(
                "Machine learning is important for modern applications."
        ));
        when(textAnalysisService.extractKeyTerms(text, 30)).thenReturn(Map.of(
                "machine", 0.1,
                "learning", 0.1
        ));

        // When
        List<Question> result = questionGenerationService.generateQuestionsFromText(
                text, 2, "MULTIPLE_CHOICE", 2, true, true);

        // Then
        // Should fallback to basic generation
        verify(aiQuizService, times(1)).generateAIQuestions(anyString(), anyInt(), anyString(), anyInt(), anyBoolean());
        verify(textAnalysisService, times(1)).extractSentences(text);
        verify(textAnalysisService, times(1)).extractKeyTerms(text, 30);
    }

    @Test
    void generateQuestionsFromText_WithBasicGeneration_ShouldUseTextAnalysis() {
        // Given
        String text = "Artificial intelligence is transforming technology.";
        when(textAnalysisService.extractSentences(text)).thenReturn(Arrays.asList(
                "Artificial intelligence is transforming technology.",
                "Machine learning helps solve problems.",
                "Deep learning uses neural networks."
        ));
        when(textAnalysisService.extractKeyTerms(text, 30)).thenReturn(Map.of(
                "artificial", 0.15,
                "intelligence", 0.12,
                "machine", 0.10,
                "learning", 0.10
        ));

        // When
        List<Question> result = questionGenerationService.generateQuestionsFromText(
                text, 2, "TRUE_FALSE", 1, true, false);

        // Then
        assertNotNull(result);
        verify(textAnalysisService, times(1)).extractSentences(text);
        verify(textAnalysisService, times(1)).extractKeyTerms(text, 30);
        verify(aiQuizService, never()).generateAIQuestions(anyString(), anyInt(), anyString(), anyInt(), anyBoolean());
    }

    @Test
    void generateQuestionsFromText_WithMixedTypes_ShouldGenerateBothTypes() {
        // Given
        String text = "Technology is evolving rapidly in many sectors.";
        when(textAnalysisService.extractSentences(text)).thenReturn(Arrays.asList(
                "Technology is evolving rapidly.",
                "Innovation drives progress.",
                "Digital transformation is key."
        ));
        when(textAnalysisService.extractKeyTerms(text, 30)).thenReturn(Map.of(
                "technology", 0.15,
                "innovation", 0.12,
                "digital", 0.10
        ));
        when(textAnalysisService.extractDefinitions(text)).thenReturn(Map.of(
                "Technology", "Tools and systems used to solve problems"
        ));

        // When
        List<Question> result = questionGenerationService.generateQuestionsFromText(
                text, 5, "MIXED", 2, false, false);

        // Then
        assertNotNull(result);
        verify(textAnalysisService, times(1)).extractSentences(text);
        verify(textAnalysisService, times(1)).extractKeyTerms(text, 30);
        verify(textAnalysisService, times(1)).extractDefinitions(text);
    }

    @Test
    void generateQuizFromDocument_LegacyMethod_ShouldUseDefaults() throws IOException {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(testDocument));
        when(documentService.extractStructuredTextFromPdf(1L)).thenReturn(structuredText);
        when(textAnalysisService.extractSentences(anyString())).thenReturn(Arrays.asList(
                "Legacy method test sentence."
        ));
        when(textAnalysisService.extractKeyTerms(anyString(), anyInt())).thenReturn(Map.of(
                "legacy", 0.1,
                "method", 0.1
        ));
        when(quizRepository.save(any(Quiz.class))).thenReturn(testQuiz);

        // When
        Quiz result = questionGenerationService.generateQuizFromDocument(
                1L, 3, "Legacy Quiz", null, true);

        // Then
        assertNotNull(result);
        verify(documentService, times(1)).extractStructuredTextFromPdf(1L);
        // Should use basic generation (useAI = false by default in legacy method)
        verify(aiQuizService, never()).generateAIQuestions(anyString(), anyInt(), anyString(), anyInt(), anyBoolean());
    }

    @Test
    void generateQuestionsFromText_LegacyMethod_ShouldUseDefaults() {
        // Given
        String text = "Legacy text for testing.";
        when(textAnalysisService.extractSentences(text)).thenReturn(Arrays.asList(
                "Legacy text for testing."
        ));
        when(textAnalysisService.extractKeyTerms(text, 30)).thenReturn(Map.of(
                "legacy", 0.1,
                "text", 0.1
        ));

        // When
        List<Question> result = questionGenerationService.generateQuestionsFromText(text, 2, true);

        // Then
        assertNotNull(result);
        verify(textAnalysisService, times(1)).extractSentences(text);
        verify(textAnalysisService, times(1)).extractKeyTerms(text, 30);
        verify(aiQuizService, never()).generateAIQuestions(anyString(), anyInt(), anyString(), anyInt(), anyBoolean());
    }
}