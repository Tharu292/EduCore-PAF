package com.smartcampus.backend.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    private String user;
    private String message;
}
