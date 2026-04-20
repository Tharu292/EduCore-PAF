package com.smartcampus.backend.util;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    public String extractUserId(String token) {
        return "mock-clerk-id"; // replace with real parsing
    }

    public String extractEmail(String token) {
        return "user@email.com";
    }
}
