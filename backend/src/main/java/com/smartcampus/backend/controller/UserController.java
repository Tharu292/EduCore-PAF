package com.smartcampus.backend.controller;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class UserController {
    @Autowired
    private UserService service;

    @GetMapping("/users")
    public List<User> getUsers() {
        return service.getAllUsers();
    }

    @PutMapping("/role/{id}")
    public void updateRole(@PathVariable String id, @RequestBody java.util.List<String> roles) {
        service.updateRole(id, roles);
    }
}
