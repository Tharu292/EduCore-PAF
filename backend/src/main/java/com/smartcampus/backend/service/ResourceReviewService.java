package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceReview;
import com.smartcampus.backend.repository.ResourceReviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ResourceReviewService {

    private final ResourceReviewRepository reviewRepository;
    private final ResourceService resourceService;

    public ResourceReviewService(ResourceReviewRepository reviewRepository, ResourceService resourceService) {
        this.reviewRepository = reviewRepository;
        this.resourceService = resourceService;
    }

    public ResourceReview save(ResourceReview review) {
        Resource resource = resourceService.getById(review.getResourceId());

        ResourceReview target = reviewRepository
                .findByResourceIdAndStudentId(review.getResourceId(), review.getStudentId())
                .orElseGet(ResourceReview::new);

        target.setResourceId(review.getResourceId());
        target.setResourceName(resource.getName());
        target.setStudentId(review.getStudentId());
        target.setStudentName(review.getStudentName());
        target.setRating(review.getRating());
        target.setComment(review.getComment());
        target.setUpdatedAt(LocalDateTime.now());

        if (target.getCreatedAt() == null) {
            target.setCreatedAt(LocalDateTime.now());
        }

        return reviewRepository.save(target);
    }

    public List<ResourceReview> getByResource(String resourceId) {
        return reviewRepository.findByResourceIdOrderByUpdatedAtDesc(resourceId);
    }

    public Map<String, Object> getSummary(String resourceId) {
        List<ResourceReview> reviews = getByResource(resourceId);
        double average = reviews.stream()
                .mapToInt(ResourceReview::getRating)
                .average()
                .orElse(0);

        return Map.of(
                "resourceId", resourceId,
                "averageRating", Math.round(average * 10.0) / 10.0,
                "reviewCount", reviews.size()
        );
    }
}
