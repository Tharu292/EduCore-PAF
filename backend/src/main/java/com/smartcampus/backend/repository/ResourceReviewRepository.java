package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.ResourceReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceReviewRepository extends MongoRepository<ResourceReview, String> {
    List<ResourceReview> findByResourceIdOrderByUpdatedAtDesc(String resourceId);
    Optional<ResourceReview> findByResourceIdAndStudentId(String resourceId, String studentId);
}
