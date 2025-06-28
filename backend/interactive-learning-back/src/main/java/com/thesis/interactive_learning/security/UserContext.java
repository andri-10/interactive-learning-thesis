package com.thesis.interactive_learning.security;

import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class UserContext {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get the current authenticated user from the security context
     * @return Current authenticated user
     * @throws RuntimeException if user is not authenticated or not found
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails)) {
            throw new RuntimeException("Invalid authentication principal");
        }

        UserDetails userDetails = (UserDetails) principal;
        String username = userDetails.getUsername();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    /**
     * Get the current authenticated user ID
     * @return Current user ID
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Get the current authenticated username
     * @return Current username
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }

        return principal.toString();
    }

    /**
     * Check if current user owns a resource
     * @param resourceUserId The user ID that owns the resource
     * @return true if current user owns the resource
     */
    public boolean isCurrentUserOwner(Long resourceUserId) {
        if (resourceUserId == null) {
            return false;
        }
        return getCurrentUserId().equals(resourceUserId);
    }

    /**
     * Validate that current user owns a resource, throw exception if not
     * @param resourceUserId The user ID that owns the resource
     * @throws RuntimeException if user doesn't own the resource
     */
    public void validateCurrentUserOwnership(Long resourceUserId) {
        if (!isCurrentUserOwner(resourceUserId)) {
            throw new RuntimeException("Access denied: You don't have permission to access this resource");
        }
    }

    /**
     * Check if user is authenticated
     * @return true if user is authenticated
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() &&
                !(authentication.getPrincipal() instanceof String &&
                        "anonymousUser".equals(authentication.getPrincipal()));
    }

    /**
     * Validate that current user owns a document
     * @param document The document to check ownership
     * @throws RuntimeException if user doesn't own the document
     */
    public void validateDocumentOwnership(com.thesis.interactive_learning.model.Document document) {
        if (document == null) {
            throw new RuntimeException("Document not found");
        }
        validateCurrentUserOwnership(document.getUser().getId());
    }

    /**
     * Validate that current user owns a collection
     * @param collection The collection to check ownership
     * @throws RuntimeException if user doesn't own the collection
     */
    public void validateCollectionOwnership(com.thesis.interactive_learning.model.StudyCollection collection) {
        if (collection == null) {
            throw new RuntimeException("Collection not found");
        }
        validateCurrentUserOwnership(collection.getUser().getId());
    }
}