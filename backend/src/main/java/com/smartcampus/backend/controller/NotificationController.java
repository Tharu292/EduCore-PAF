package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @GetMapping
    public Object get(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return service.getByUser(user.getClerkUserId());
    }

    @PutMapping("/{id}")
    public void read(@PathVariable String id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        service.markRead(id, user.getClerkUserId());
    }

    @PutMapping("/read-all")
    public void markAllRead(Authentication auth) {
        User user = (User) auth.getPrincipal();
        service.markAllReadForUser(user.getClerkUserId());
    }
}