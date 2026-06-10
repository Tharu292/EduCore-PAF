package com.smartcampus.backend.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Map;

@Component
public class JwtUtil {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Map<String, Object> getPayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }

            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
            return objectMapper.readValue(payloadJson, Map.class);
        } catch (Exception e) {
            System.err.println("Failed to parse JWT payload: " + e.getMessage());
            return null;
        }
    }

    public String extractUserId(String token) {
        Map<String, Object> payload = getPayload(token);
        if (payload == null) return null;

        Object sub = payload.get("sub");
        return sub != null ? sub.toString() : null;
    }

    public String extractEmail(String token) {
        Map<String, Object> payload = getPayload(token);
        if (payload == null) return null;

        Object email = payload.get("email");
        if (email != null) return email.toString();

        Object emailAddress = payload.get("email_address");
        if (emailAddress != null) return emailAddress.toString();

        return null;
    }

    public String extractName(String token) {
        Map<String, Object> payload = getPayload(token);
        if (payload == null) return null;

        Object name = payload.get("name");
        if (name != null && !name.toString().isBlank()) {
            return name.toString();
        }

        String firstName = payload.get("given_name") != null ? payload.get("given_name").toString() : "";
        String lastName = payload.get("family_name") != null ? payload.get("family_name").toString() : "";

        String fullName = (firstName + " " + lastName).trim();
        return fullName.isBlank() ? null : fullName;
    }
}