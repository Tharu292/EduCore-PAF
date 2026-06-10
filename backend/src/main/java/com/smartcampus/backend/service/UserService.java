package com.smartcampus.backend.service;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getByClerkUserIdRequired(String clerkUserId) {
        return userRepository.findByClerkUserId(clerkUserId)
                .orElseThrow(() -> new RuntimeException("User not found with clerkId: " + clerkUserId));
    }

    public User updateRoles(String id, List<String> newRoles) {
        User user = getById(id);

        List<String> normalizedRoles = new ArrayList<>(
                newRoles.stream()
                        .map(String::toUpperCase)
                        .distinct()
                        .toList()
        );

        if (!normalizedRoles.contains("USER")) {
            normalizedRoles.add("USER");
        }

        user.setRoles(normalizedRoles);
        return userRepository.save(user);
    }

    public User addRole(String clerkUserId, String role) {
        User user = getByClerkUserIdRequired(clerkUserId);

        if (user.getRoles() == null) {
            user.setRoles(new ArrayList<>());
        }

        String upperRole = role.toUpperCase();
        if (!user.getRoles().contains(upperRole)) {
            user.getRoles().add(upperRole);
            if (!user.getRoles().contains("USER")) {
                user.getRoles().add("USER");
            }
            return userRepository.save(user);
        }

        return user;
    }

    public User removeRole(String clerkUserId, String role) {
        User user = getByClerkUserIdRequired(clerkUserId);

        if (user.getRoles() == null) {
            return user;
        }

        String upperRole = role.toUpperCase();
        if ("USER".equals(upperRole)) {
            throw new RuntimeException("Cannot remove base USER role");
        }

        user.getRoles().remove(upperRole);
        return userRepository.save(user);
    }

    public User promoteToTechnician(String clerkUserId) {
        return addRole(clerkUserId, "TECHNICIAN");
    }

    public User demoteFromTechnician(String clerkUserId) {
        return removeRole(clerkUserId, "TECHNICIAN");
    }

    public User promoteToAdmin(String clerkUserId) {
        return addRole(clerkUserId, "ADMIN");
    }
}