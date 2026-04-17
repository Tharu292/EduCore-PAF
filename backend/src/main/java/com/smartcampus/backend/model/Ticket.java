package com.smartcampus.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
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
    private  String category;
    private  String priority;

    private Status status;

    private String createdBy;
    private String assignedTo;

    private List <Comment> comments;
    private List <String> attachments;

    public enum Status{
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED,
        REJECTED,
    }

}
