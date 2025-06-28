package com.thesis.interactive_learning.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestURI = request.getRequestURI();
        final String authorizationHeader = request.getHeader("Authorization");

        // Debug logging
        System.out.println("=== JWT FILTER DEBUG ===");
        System.out.println("Request URI: " + requestURI);
        System.out.println("Authorization header present: " + (authorizationHeader != null));
        System.out.println("Authorization header: " + authorizationHeader);

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            System.out.println("JWT token extracted: " + jwt.substring(0, Math.min(20, jwt.length())) + "...");
            try {
                username = jwtTokenUtil.extractUsername(jwt);
                System.out.println("Username extracted: " + username);
            } catch (Exception e) {
                System.out.println("Error extracting username from token: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("No valid Authorization header found");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("Loading user details for username: " + username);
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                System.out.println("User details loaded: " + userDetails.getUsername());

                if (jwtTokenUtil.validateToken(jwt, userDetails)) {
                    System.out.println("Token validation successful");
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication set in SecurityContext");
                } else {
                    System.out.println("Token validation failed");
                }
            } catch (Exception e) {
                System.out.println("Error loading user details: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            if (username == null) {
                System.out.println("Username is null");
            }
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                System.out.println("Authentication already exists");
            }
        }

        System.out.println("=== END JWT FILTER DEBUG ===");
        chain.doFilter(request, response);
    }
}