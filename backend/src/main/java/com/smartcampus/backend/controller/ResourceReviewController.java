package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.ResourceReview;
import com.smartcampus.backend.service.ResourceReviewService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceReviewController {

    private final ResourceReviewService reviewService;

    public ResourceReviewController(ResourceReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResourceReview save(@Valid @RequestBody ResourceReview review) {
        return reviewService.save(review);
    }

    @GetMapping("/resource/{resourceId}")
    public List<ResourceReview> getByResource(@PathVariable String resourceId) {
        return reviewService.getByResource(resourceId);
    }

    @GetMapping("/resource/{resourceId}/summary")
    public Map<String, Object> getSummary(@PathVariable String resourceId) {
        return reviewService.getSummary(resourceId);
    }
}
