package com.thesis.interactive_learning.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final MicrobitWebSocketHandler microbitWebSocketHandler;

    public WebSocketConfig(MicrobitWebSocketHandler microbitWebSocketHandler) {
        this.microbitWebSocketHandler = microbitWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(microbitWebSocketHandler, "/ws/microbit")
                .setAllowedOrigins("http://localhost:3000") // Allow React dev server
                .withSockJS(); // Fallback for browsers that don't support WebSocket
    }

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(8192);
        container.setMaxBinaryMessageBufferSize(8192);
        return container;
    }
}