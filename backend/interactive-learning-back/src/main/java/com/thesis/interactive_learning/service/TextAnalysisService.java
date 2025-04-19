package com.thesis.interactive_learning.service;

import java.util.List;
import java.util.Map;

public interface TextAnalysisService {

//    Split text into sentences

    List<String> extractSentences(String text);

//      Extract key terms and concepts from text

    Map<String, Double> extractKeyTerms(String text, int maxTerms);

//      Extract potential definitions

    Map<String, String> extractDefinitions(String text);

//      Calculate word frequencies

    Map<String, Integer> calculateWordFrequency(String text);

}
