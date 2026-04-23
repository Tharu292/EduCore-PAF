package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification create(String clerkUserId, String message) {
        Notification notification = new Notification(clerkUserId, message);
        return notificationRepository.save(notification);
    }

    public List<Notification> getByUser(String clerkUserId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(clerkUserId);
    }

    public void markRead(String id, String clerkUserId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(clerkUserId)) {
            throw new RuntimeException("You are not allowed to modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllReadForUser(String clerkUserId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(clerkUserId);
        for (Notification n : notifications) {
            n.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }
}