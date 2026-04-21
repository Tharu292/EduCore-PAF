package com.smartcampus.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document("notifications")
public class Notification {
    @Id
    private String id;
    private String userId;
    private String message;
    private boolean read;

    public Notification() {}

    public Notification(String userId, String message) {
        this.userId = userId;
        this.message = message;
        this.read = false;
    }

}
