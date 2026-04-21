package com.smartcampus.backend.exception;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class  GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Map<String, String> handle(Exception e) {
        return Map.of(
                "error", e.getMessage()
        );
    }
}
