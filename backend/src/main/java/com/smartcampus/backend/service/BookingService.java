package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;

    public BookingService(BookingRepository bookingRepository, ResourceService resourceService) {
        this.bookingRepository = bookingRepository;
        this.resourceService = resourceService;
    }

    public Booking create(Booking booking) {
        Resource resource = resourceService.getById(booking.getResourceId());

        if (!"ACTIVE".equals(resource.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource is not available for booking");
        }

        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        if (booking.getExpectedAttendees() > resource.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected attendees exceed resource capacity");
        }

        ensureNoConflict(booking);

        booking.setResourceName(resource.getName());
        booking.setResourceType(resource.getType());
        booking.setResourceLocation(resource.getLocation());
        booking.setStatus("PENDING");
        booking.setAdminReason(null);
        booking.setCreatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public List<Booking> getAll(String status) {
        if (status != null && !status.isBlank()) {
            return bookingRepository.findByStatusOrderByBookingDateAscStartTimeAsc(status);
        }
        return bookingRepository.findAll();
    }

    public List<Booking> getByStudent(String studentId) {
        return bookingRepository.findByStudentIdOrderByBookingDateDescStartTimeAsc(studentId);
    }

    public List<Booking> getByResource(String resourceId) {
        return bookingRepository.findByResourceIdOrderByBookingDateAscStartTimeAsc(resourceId);
    }

    public Booking approve(String id, String reason) {
        Booking booking = getById(id);
        ensureNoConflictForApproval(booking);
        booking.setStatus("APPROVED");
        booking.setAdminReason(reason);
        booking.setReviewedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking reject(String id, String reason) {
        Booking booking = getById(id);
        booking.setStatus("REJECTED");
        booking.setAdminReason(reason);
        booking.setReviewedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking cancel(String id) {
        Booking booking = getById(id);
        if (!"APPROVED".equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved bookings can be cancelled");
        }
        booking.setStatus("CANCELLED");
        booking.setReviewedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    private Booking getById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private void ensureNoConflict(Booking booking) {
        List<Booking> existing = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                booking.getResourceId(),
                booking.getBookingDate(),
                List.of("PENDING", "APPROVED")
        );

        boolean overlaps = existing.stream().anyMatch(current ->
                booking.getStartTime().isBefore(current.getEndTime())
                        && booking.getEndTime().isAfter(current.getStartTime())
        );

        if (overlaps) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This resource already has a booking in that time range");
        }
    }

    private void ensureNoConflictForApproval(Booking booking) {
        List<Booking> existing = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                booking.getResourceId(),
                booking.getBookingDate(),
                List.of("APPROVED")
        );

        boolean overlaps = existing.stream().anyMatch(current ->
                !current.getId().equals(booking.getId())
                        && booking.getStartTime().isBefore(current.getEndTime())
                        && booking.getEndTime().isAfter(current.getStartTime())
        );

        if (overlaps) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Another approved booking already uses this time range");
        }
    }
}
