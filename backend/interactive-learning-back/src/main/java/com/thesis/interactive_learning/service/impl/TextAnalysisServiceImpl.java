package com.thesis.interactive_learning.service.impl;

import com.thesis.interactive_learning.service.TextAnalysisService;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TextAnalysisServiceImpl implements TextAnalysisService {

    private static final Pattern SENTENCE_PATTERN = Pattern.compile("(?<=[.!?])\\s+(?=[A-Z])");
    private static final Pattern DEFINITION_PATTERN = Pattern.compile("([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)[\\s]*(?:is|are|refers to|means|defined as)[\\s]*([^.!?]+)[.!?]");
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "when",
            "where", "how", "why", "which", "who", "whom", "this", "that", "these", "those",
            "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having",
            "do", "does", "did", "doing", "would", "should", "could", "ought", "i", "you",
            "he", "she", "it", "we", "they", "their", "your", "my", "his", "her", "its",
            "our", "of", "in", "to", "for", "with", "on", "at", "from", "by", "about",
            "against", "between", "into", "through", "during", "before", "after", "above",
            "below", "up", "down", "out", "off", "over", "under", "again", "further", "then",
            "once", "all", "any", "both", "each", "few", "more", "most", "other", "some",
            "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very"
    ));


    @Override
    public List<String> extractSentences(String text) {
        List<String> sentences = new ArrayList<>();
        String[] parts = SENTENCE_PATTERN.split(text);

        for (String part : parts) {
            part = part.trim();
            if (!part.isEmpty()) {
                sentences.add(part);
            }
        }

        return sentences;
    }


    @Override
    public Map<String, Double> extractKeyTerms(String text, int maxTerms) {
        Map<String, Integer> frequencies = calculateWordFrequency(text);
        Map<String, Double> keyTerms = new HashMap<>();

        int totalWords = frequencies.values().stream().mapToInt(Integer::intValue).sum();

        for (Map.Entry<String, Integer> entry : frequencies.entrySet()) {
            String word = entry.getKey();
            int frequency = entry.getValue();

            if (!STOP_WORDS.contains(word.toLowerCase()) && word.length() > 3) {
                double tf = (double) frequency / totalWords;
                keyTerms.put(word, tf);
            }
        }

        return keyTerms.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(maxTerms)
                .collect(LinkedHashMap::new,
                        (map, entry) -> map.put(entry.getKey(), entry.getValue()),
                        LinkedHashMap::putAll);
    }

    @Override
    public Map<String, String> extractDefinitions(String text) {
        Map<String, String> definitions = new HashMap<>();
        Matcher matcher = DEFINITION_PATTERN.matcher(text);

        while (matcher.find()) {
            String term = matcher.group(1).trim();
            String definition = matcher.group(2).trim();
            definitions.put(term, definition);
        }

        return definitions;
    }

    @Override
    public Map<String, Integer> calculateWordFrequency(String text) {
        Map<String, Integer> wordFrequency = new HashMap<>();

        // Remove punctuation and convert to lowercase
        text = text.replaceAll("[^a-zA-Z0-9\\s]", "").toLowerCase();

        String[] words = text.split("\\s+");
        for (String word : words) {
            if (!word.isEmpty()) {
                wordFrequency.put(word, wordFrequency.getOrDefault(word, 0) + 1);
            }
        }

        return wordFrequency;
    }
}
