package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository repo;

    public void create(String userId, String message) {
        repo.save(new Notification(userId, message));
    }

    public List<Notification> getByUser(String userId) {
        return repo.findByUserId(userId);
    }

    public void markRead(String id) {
        Notification n = repo.findById(id).orElseThrow();
        n.setRead(true);
        repo.save(n);
    }
}
