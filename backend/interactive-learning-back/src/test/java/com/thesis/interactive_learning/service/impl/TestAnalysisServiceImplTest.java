package com.thesis.interactive_learning.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class TextAnalysisServiceImplTest {

    @InjectMocks
    private TextAnalysisServiceImpl textAnalysisService;

    private String sampleText;

    @BeforeEach
    void setUp() {
        sampleText = "Machine learning is a subset of artificial intelligence. " +
                "It involves algorithms that can learn from data. " +
                "Deep learning is a type of machine learning that uses neural networks. " +
                "Natural language processing is another important field in AI.";
    }

    @Test
    void extractSentences_ShouldSplitTextIntoSentences() {
        // When
        List<String> sentences = textAnalysisService.extractSentences(sampleText);

        // Then
        assertEquals(4, sentences.size());
        assertTrue(sentences.get(0).contains("Machine learning is a subset"));
        assertTrue(sentences.get(1).contains("It involves algorithms"));
        assertTrue(sentences.get(2).contains("Deep learning is a type"));
        assertTrue(sentences.get(3).contains("Natural language processing"));
    }

    @Test
    void extractSentences_WithEmptyText_ShouldReturnEmptyList() {
        // When
        List<String> sentences = textAnalysisService.extractSentences("");

        // Then
        assertTrue(sentences.isEmpty());
    }

    @Test
    void extractSentences_WithNullText_ShouldReturnEmptyList() {
        // When
        List<String> sentences = textAnalysisService.extractSentences(null);

        // Then
        assertTrue(sentences.isEmpty());
    }

    @Test
    void extractSentences_WithSingleSentence_ShouldReturnOneSentence() {
        // Given
        String singleSentence = "This is a single sentence without ending punctuation";

        // When
        List<String> sentences = textAnalysisService.extractSentences(singleSentence);

        // Then
        assertEquals(1, sentences.size());
        assertEquals(singleSentence, sentences.get(0));
    }

    @Test
    void extractKeyTerms_ShouldReturnMostFrequentTerms() {
        // When
        Map<String, Double> keyTerms = textAnalysisService.extractKeyTerms(sampleText, 5);

        // Then
        assertNotNull(keyTerms);
        assertTrue(keyTerms.size() <= 5);

        // Check that stop words are excluded
        assertFalse(keyTerms.containsKey("is"));
        assertFalse(keyTerms.containsKey("a"));
        assertFalse(keyTerms.containsKey("of"));

        // Check that meaningful terms are included
        boolean hasLearning = keyTerms.containsKey("learning") || keyTerms.containsKey("Learning");
        boolean hasMachine = keyTerms.containsKey("machine") || keyTerms.containsKey("Machine");
        assertTrue(hasLearning || hasMachine, "Should contain key terms like 'learning' or 'machine'");
    }

    @Test
    void extractKeyTerms_WithEmptyText_ShouldReturnEmptyMap() {
        // When
        Map<String, Double> keyTerms = textAnalysisService.extractKeyTerms("", 5);

        // Then
        assertTrue(keyTerms.isEmpty());
    }

    @Test
    void extractKeyTerms_WithMaxTermsZero_ShouldReturnEmptyMap() {
        // When
        Map<String, Double> keyTerms = textAnalysisService.extractKeyTerms(sampleText, 0);

        // Then
        assertTrue(keyTerms.isEmpty());
    }

    @Test
    void extractDefinitions_ShouldFindDefinitionPatterns() {
        // Given
        String textWithDefinitions = "Machine learning is a method of data analysis. " +
                "Artificial intelligence refers to computer systems that can perform tasks. " +
                "Neural networks are computing systems inspired by biological neural networks.";

        // When
        Map<String, String> definitions = textAnalysisService.extractDefinitions(textWithDefinitions);

        // Then
        assertNotNull(definitions);
        assertTrue(definitions.size() >= 1);

        // Check for expected definitions
        boolean foundMLDefinition = definitions.values().stream()
                .anyMatch(def -> def.contains("method of data analysis"));
        boolean foundAIDefinition = definitions.values().stream()
                .anyMatch(def -> def.contains("computer systems"));
        boolean foundNNDefinition = definitions.values().stream()
                .anyMatch(def -> def.contains("computing systems"));

        assertTrue(foundMLDefinition || foundAIDefinition || foundNNDefinition,
                "Should find at least one definition pattern");
    }

    @Test
    void extractDefinitions_WithNoDefinitions_ShouldReturnEmptyMap() {
        // Given
        String textWithoutDefinitions = "The weather today looks nice. " +
                "I went to the store yesterday. " +
                "Tomorrow will be a busy day.";

        // When
        Map<String, String> definitions = textAnalysisService.extractDefinitions(textWithoutDefinitions);

        // Then
        assertTrue(definitions.isEmpty());
    }

    @Test
    void calculateWordFrequency_ShouldCountWordsCorrectly() {
        // Given
        String simpleText = "the cat sat on the mat the cat was happy";

        // When
        Map<String, Integer> frequency = textAnalysisService.calculateWordFrequency(simpleText);

        // Then
        assertNotNull(frequency);
        assertEquals(3, frequency.get("the").intValue());
        assertEquals(2, frequency.get("cat").intValue());
        assertEquals(1, frequency.get("sat").intValue());
        assertEquals(1, frequency.get("on").intValue());
        assertEquals(1, frequency.get("mat").intValue());
        assertEquals(1, frequency.get("was").intValue());
        assertEquals(1, frequency.get("happy").intValue());
    }

    @Test
    void calculateWordFrequency_ShouldHandlePunctuationAndCase() {
        // Given
        String textWithPunctuation = "Hello, World! Hello world. HELLO world?";

        // When
        Map<String, Integer> frequency = textAnalysisService.calculateWordFrequency(textWithPunctuation);

        // Then
        assertEquals(4, frequency.get("hello").intValue());
        assertEquals(3, frequency.get("world").intValue());
        assertFalse(frequency.containsKey("Hello")); // Should be lowercase
        assertFalse(frequency.containsKey("World!")); // Should be without punctuation
    }

    @Test
    void calculateWordFrequency_WithEmptyText_ShouldReturnEmptyMap() {
        // When
        Map<String, Integer> frequency = textAnalysisService.calculateWordFrequency("");

        // Then
        assertTrue(frequency.isEmpty());
    }

    @Test
    void calculateWordFrequency_WithOnlyPunctuation_ShouldReturnEmptyMap() {
        // When
        Map<String, Integer> frequency = textAnalysisService.calculateWordFrequency("!@#$%^&*()");

        // Then
        assertTrue(frequency.isEmpty());
    }

    @Test
    void extractKeyTerms_ShouldExcludeShortWords() {
        // Given
        String textWithShortWords = "AI is an emerging technology that can help us solve problems";

        // When
        Map<String, Double> keyTerms = textAnalysisService.extractKeyTerms(textWithShortWords, 10);

        // Then
        // Should exclude words with 3 or fewer characters
        assertFalse(keyTerms.containsKey("AI"));
        assertFalse(keyTerms.containsKey("is"));
        assertFalse(keyTerms.containsKey("an"));
        assertFalse(keyTerms.containsKey("us"));

        // Should include longer meaningful words
        boolean hasLongerWords = keyTerms.keySet().stream()
                .anyMatch(word -> word.length() > 3);
        assertTrue(hasLongerWords, "Should contain words longer than 3 characters");
    }

    @Test
    void extractSentences_WithDifferentPunctuation_ShouldSplitCorrectly() {
        // Given
        String textWithVariedPunctuation = "What is AI? It's amazing! " +
                "Machine learning works well. " +
                "Deep learning is powerful!";

        // When
        List<String> sentences = textAnalysisService.extractSentences(textWithVariedPunctuation);

        // Then
        assertEquals(4, sentences.size());
        assertTrue(sentences.get(0).contains("What is AI"));
        assertTrue(sentences.get(1).contains("It's amazing"));
        assertTrue(sentences.get(2).contains("Machine learning"));
        assertTrue(sentences.get(3).contains("Deep learning"));
    }
}