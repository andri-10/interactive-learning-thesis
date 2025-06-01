package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.service.AIQuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Value("${openai.api.key}")
    private String apiKey;

    @Autowired
    private AIQuizService aiQuizService;

    @GetMapping("/openai-config")
    public ResponseEntity<?> testOpenAIConfig() {
        try {
            // Check if API key is configured (don't expose the actual key!)
            boolean keyConfigured = apiKey != null && !apiKey.isEmpty() &&
                    !apiKey.equals("your-openai-api-key-here") &&
                    !apiKey.equals("default-key-for-development");

            return ResponseEntity.ok(Map.of(
                    "apiKeyConfigured", keyConfigured,
                    "keyPrefix", keyConfigured ? apiKey.substring(0, Math.min(7, apiKey.length())) + "..." : "Not configured",
                    "status", keyConfigured ? "Ready" : "Please configure OpenAI API key"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "apiKeyConfigured", false,
                    "error", e.getMessage(),
                    "status", "Configuration error"
            ));
        }
    }

    @GetMapping("/ai-generation")
    public ResponseEntity<?> testAIGeneration() {
        try {
            String testText = "Artificial intelligence is a branch of computer science that aims to create intelligent machines. Machine learning is a subset of AI that focuses on algorithms that can learn from data.";

            var questions = aiQuizService.generateAIQuestions(testText, 2, "MULTIPLE_CHOICE", 2, true);

            return ResponseEntity.ok(Map.of(
                    "status", "AI generation successful",
                    "questionsGenerated", questions.size(),
                    "sampleQuestion", questions.isEmpty() ? "None" : questions.get(0).getQuestionText()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "AI generation failed",
                    "error", e.getMessage(),
                    "suggestion", "Check your OpenAI API key and internet connection"
            ));
        }
    }
}