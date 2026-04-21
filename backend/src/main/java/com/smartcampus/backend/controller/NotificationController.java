package com.smartcampus.backend.controller;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
public class NotificationController {
    @Autowired
    private NotificationService service;

    @PostMapping("/test")
    public String createTestNotification() {
        service.create("Test notification", "userId");
        return "Created";
    }

    @GetMapping
    public Object get(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return service.getByUser(user.getId());
    }

    @PutMapping("/{id}")
    public void read(@PathVariable String id) {
        service.markRead(id);
    }
}
