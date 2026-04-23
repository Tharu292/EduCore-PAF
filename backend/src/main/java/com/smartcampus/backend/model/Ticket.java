package com.smartcampus.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String title;
    private String description;
    private String category;
    private String priority;
    private String location;           // Added - useful for campus resources
    private String preferredContact;   // Added

    private Status status = Status.OPEN;
    private String createdBy;
    private String assignedTo;

    private List<Comment> comments;
    private List<String> attachments;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }
}