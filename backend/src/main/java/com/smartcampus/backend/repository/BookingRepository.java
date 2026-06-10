package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByStudentIdOrderByBookingDateDescStartTimeAsc(String studentId);
    List<Booking> findByStatusOrderByBookingDateAscStartTimeAsc(String status);
    List<Booking> findByResourceIdOrderByBookingDateAscStartTimeAsc(String resourceId);
    List<Booking> findByResourceIdAndBookingDateAndStatusIn(String resourceId, LocalDate bookingDate, Collection<String> statuses);
}
