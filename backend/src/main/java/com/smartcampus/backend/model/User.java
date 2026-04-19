package com.smartcampus.backend.model;

import java.util.ArrayList;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Setter
@Getter
@Document("users")
public class User {
    @Id
    private String id;
    private String clerkUserId;
    private String email;
    private String name;
    private List<String> roles;

    public User() {}

    public User(String clerkUserId, String email, String name) {
        this.clerkUserId = clerkUserId;
        this.email = email;
        this.name = name;
        this.roles = new ArrayList<>(List.of("USER"));
    }

}
