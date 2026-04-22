package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Student;
import com.smartcampus.backend.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class AuthService {

    private static final String ADMIN_EMAIL = "admin@smartcampus.lk";
    private static final String ADMIN_PASSWORD = "admin123";

    private final StudentRepository studentRepository;

    public AuthService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Map<String, Object> register(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already registered");
        }

        Student saved = studentRepository.save(student);
        return studentSession(saved);
    }

    public Map<String, Object> login(String email, String password) {
        if (ADMIN_EMAIL.equalsIgnoreCase(email) && ADMIN_PASSWORD.equals(password)) {
            return Map.of(
                    "id", "admin",
                    "name", "Admin",
                    "email", ADMIN_EMAIL,
                    "role", "ADMIN"
            );
        }

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!student.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return studentSession(student);
    }

    private Map<String, Object> studentSession(Student student) {
        return Map.of(
                "id", student.getId(),
                "name", student.getName(),
                "email", student.getEmail(),
                "role", "STUDENT"
        );
    }
}
