package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    private final ResourceRepository repo;

    public ResourceService(ResourceRepository repo) {
        this.repo = repo;
    }

    public Resource create(Resource resource) {
        return repo.save(resource);
    }

    public List<Resource> getAll() {
        return repo.findAll();
    }

    public Resource getById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource update(String id, Resource newData) {
        Resource r = getById(id);

        r.setName(newData.getName());
        r.setType(newData.getType());
        r.setCapacity(newData.getCapacity());
        r.setLocation(newData.getLocation());
        r.setStatus(newData.getStatus());
        r.setAvailability(newData.getAvailability());

        return repo.save(r);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
}