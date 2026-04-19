package com.smartcampus.backend.service;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository repo;

    public User getById(String id) {
        return repo.findById(id).orElseThrow();
    }

    public void updateRole(String id, java.util.List<String> roles) {
        User u = getById(id);
        u.setRoles(roles);
        repo.save(u);
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }
}
