package com.thesis.interactive_learning.controllers;

import com.thesis.interactive_learning.model.AuditLog;
import com.thesis.interactive_learning.model.User;
import com.thesis.interactive_learning.security.JwtTokenUtil;
import com.thesis.interactive_learning.service.AuditLogService;
import com.thesis.interactive_learning.service.UserService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) {
        try {

            User user = userService.getUserByUsername(authRequest.getUsername()).orElse(null);

            if (user == null) {
                auditLogService.logLoginAttempt(
                        AuditLog.LogAction.LOGIN_FAILED,
                        authRequest.getUsername(),
                        "Login attempt with non-existent username: " + authRequest.getUsername()
                );
                return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
            }

            // Check if user account is disabled
            if (!user.isEnabled()) {
                auditLogService.logLoginAttempt(
                        AuditLog.LogAction.LOGIN_FAILED,
                        authRequest.getUsername(),
                        "Login attempt for disabled account: " + authRequest.getUsername()
                );
                return new ResponseEntity<>("Account is disabled", HttpStatus.FORBIDDEN);
            }


            if (user.isAccountLocked()) {
                auditLogService.logLoginAttempt(
                        AuditLog.LogAction.LOGIN_FAILED,
                        authRequest.getUsername(),
                        "Login attempt for locked account: " + authRequest.getUsername()
                );
                return new ResponseEntity<>("Account is temporarily locked due to failed login attempts", HttpStatus.LOCKED);
            }


            if (auditLogService.checkSuspiciousActivity(getClientIp(), authRequest.getUsername())) {
                auditLogService.logSecurityEvent(
                        AuditLog.LogAction.LOGIN_FAILED,
                        "Suspicious login activity detected for: " + authRequest.getUsername()
                );
                return new ResponseEntity<>("Too many failed attempts. Please try again later.", HttpStatus.TOO_MANY_REQUESTS);
            }


            try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
                );
            } catch (BadCredentialsException e) {
                // Increment failed login attempts
                user.incrementFailedLoginAttempts();
                userService.saveUser(user);

                auditLogService.logLoginAttempt(
                        AuditLog.LogAction.LOGIN_FAILED,
                        authRequest.getUsername(),
                        "Invalid password for user: " + authRequest.getUsername() +
                                " (Attempt " + user.getFailedLoginAttempts() + ")"
                );

                return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
            }

            // Successful login
            user.updateLastLogin();
            userService.saveUser(user);

            auditLogService.log(
                    AuditLog.LogLevel.INFO,
                    AuditLog.LogAction.LOGIN_SUCCESS,
                    "Successful login for user: " + user.getUsername(),
                    user.getId(),
                    user.getUsername()
            );

            // Generate JWT token
            final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
            final String jwt = jwtTokenUtil.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(jwt));

        } catch (Exception e) {
            auditLogService.logError("Login error for user: " + authRequest.getUsername() + " - " + e.getMessage());
            return new ResponseEntity<>("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            if (userService.existsByUsername(user.getUsername())) {
                auditLogService.log(
                        AuditLog.LogLevel.WARN,
                        AuditLog.LogAction.USER_CREATED,
                        "Registration attempt with existing username: " + user.getUsername()
                );
                return new ResponseEntity<>("Username is already taken", HttpStatus.BAD_REQUEST);
            }

            if (userService.existsByEmail(user.getEmail())) {
                auditLogService.log(
                        AuditLog.LogLevel.WARN,
                        AuditLog.LogAction.USER_CREATED,
                        "Registration attempt with existing email: " + user.getEmail()
                );
                return new ResponseEntity<>("Email is already in use", HttpStatus.BAD_REQUEST);
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userService.saveUser(user);

            auditLogService.log(
                    AuditLog.LogLevel.INFO,
                    AuditLog.LogAction.USER_CREATED,
                    "New user registered: " + savedUser.getUsername(),
                    savedUser.getId(),
                    savedUser.getUsername()
            );

            final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            final String jwt = jwtTokenUtil.generateToken(userDetails);

            return new ResponseEntity<>(new AuthResponse(jwt), HttpStatus.CREATED);

        } catch (Exception e) {
            auditLogService.logError("Registration error for user: " + user.getUsername() + " - " + e.getMessage());
            return new ResponseEntity<>("Registration failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String getClientIp() {
        return "unknown";
    }
}

@Setter
@Getter
class AuthRequest {
    private String username;
    private String password;

}


record AuthResponse(String token) {

}