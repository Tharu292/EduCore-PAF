package com.smartcampus.backend.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "resource_reviews")
public class ResourceReview {

    @Id
    private String id;

    @NotBlank(message = "Resource is required")
    private String resourceId;

    private String resourceName;

    @NotBlank(message = "Student is required")
    private String studentId;

    private String studentName;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int rating;

    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
