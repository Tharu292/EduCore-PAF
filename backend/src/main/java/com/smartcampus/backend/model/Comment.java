package com.smartcampus.backend.model;

import lombok.*;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    private String id;
    private String user;
    private String message;
    private LocalDateTime createdAt;
}
