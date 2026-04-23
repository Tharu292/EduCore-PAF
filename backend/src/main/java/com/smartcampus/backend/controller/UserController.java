package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/api/users/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(currentUser);
    }

    @GetMapping("/api/users/by-clerk/{clerkUserId}")
    public ResponseEntity<Map<String, String>> getUserSummaryByClerkId(@PathVariable String clerkUserId) {
        User user = userService.getByClerkUserIdRequired(clerkUserId);
        return ResponseEntity.ok(Map.of(
                "clerkUserId", user.getClerkUserId(),
                "name", user.getName() != null ? user.getName() : "Unknown User",
                "email", user.getEmail() != null ? user.getEmail() : "unknown@email.com"
        ));
    }

    @GetMapping("/api/admin/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/api/admin/users/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/api/admin/users/{id}/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> updateRoles(@PathVariable String id,
                                            @RequestBody List<String> roles) {
        User updatedUser = userService.updateRoles(id, roles);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/api/admin/users/{clerkUserId}/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> addRole(@PathVariable String clerkUserId,
                                        @RequestBody String role) {
        User updated = userService.addRole(clerkUserId, role);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/users/{clerkUserId}/roles/{role}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> removeRole(@PathVariable String clerkUserId,
                                           @PathVariable String role) {
        User updated = userService.removeRole(clerkUserId, role);
        return ResponseEntity.ok(updated);
    }
}