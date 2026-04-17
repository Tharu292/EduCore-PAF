package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {

    private final ResourceService service;

    public ResourceController(ResourceService service) {
        this.service = service;
    }

    @PostMapping
    public Resource create(@Valid @RequestBody Resource resource) {
        return service.create(resource);
    }

    @GetMapping
    public List<Resource> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Resource update(@PathVariable String id, @Valid @RequestBody Resource resource) {
        return service.update(id, resource);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    // SEARCH FILTER
    @GetMapping("/search")
    public List<Resource> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location
    ) {
        if (type != null) return service.getAll().stream().filter(r -> r.getType().equals(type)).toList();
        if (capacity != null) return service.getAll().stream().filter(r -> r.getCapacity() >= capacity).toList();
        if (location != null) return service.getAll().stream().filter(r -> r.getLocation().equals(location)).toList();

        return service.getAll();
    }
}