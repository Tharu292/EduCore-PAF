package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

        ensureCapacityAvailable(booking, resource, List.of("PENDING", "APPROVED"), null);

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
        Resource resource = resourceService.getById(booking.getResourceId());
        ensureCapacityAvailable(booking, resource, List.of("APPROVED"), booking.getId());
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

    public Booking reschedule(String id, LocalDate bookingDate, LocalTime startTime, LocalTime endTime, int expectedAttendees) {
        Booking booking = getById(id);

        if (!List.of("PENDING", "APPROVED").contains(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending or booked reservations can be rescheduled");
        }

        Resource resource = resourceService.getById(booking.getResourceId());

        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        if (expectedAttendees > resource.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected attendees exceed resource capacity");
        }

        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setExpectedAttendees(expectedAttendees);

        ensureCapacityAvailable(booking, resource, List.of("PENDING", "APPROVED"), booking.getId());

        booking.setStatus("PENDING");
        booking.setAdminReason("Reschedule requested");
        booking.setReviewedAt(null);

        return bookingRepository.save(booking);
    }

    private Booking getById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private void ensureCapacityAvailable(Booking booking, Resource resource, List<String> statuses, String ignoredBookingId) {
        List<Booking> existing = bookingRepository.findByResourceIdAndBookingDateAndStatusIn(
                booking.getResourceId(),
                booking.getBookingDate(),
                statuses
        );

        int usedSeats = existing.stream()
                .filter(current -> ignoredBookingId == null || !ignoredBookingId.equals(current.getId()))
                .filter(current -> booking.getStartTime().isBefore(current.getEndTime())
                        && booking.getEndTime().isAfter(current.getStartTime()))
                .mapToInt(Booking::getExpectedAttendees)
                .sum();

        if (usedSeats + booking.getExpectedAttendees() > resource.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Not enough seats left in this time slot");
        }
    }
}
