package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
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
    private final BookingNotificationService bookingNotificationService;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            ResourceService resourceService,
            BookingNotificationService bookingNotificationService,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.resourceService = resourceService;
        this.bookingNotificationService = bookingNotificationService;
        this.notificationService = notificationService;
    }

    public Booking create(Booking booking, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        Resource resource = resourceService.getById(booking.getResourceId());

        if (!"ACTIVE".equalsIgnoreCase(resource.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource is not available for booking");
        }

        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        ensureStartTimeIsFuture(booking.getBookingDate(), booking.getStartTime());

        if (booking.getExpectedAttendees() > resource.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected attendees exceed resource capacity");
        }

        ensureCapacityAvailable(booking, resource, List.of("PENDING", "APPROVED"), null);

        booking.setStudentId(currentUser.getClerkUserId());
        booking.setStudentName(currentUser.getName());
        booking.setStudentEmail(currentUser.getEmail());

        booking.setResourceName(resource.getName());
        booking.setResourceType(resource.getType());
        booking.setResourceLocation(resource.getLocation());
        booking.setStatus("PENDING");
        booking.setAdminReason(null);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setReviewedAt(null);

        Booking saved = bookingRepository.save(booking);

        notificationService.create(
                currentUser.getClerkUserId(),
                "Your booking request for '" + resource.getName() + "' has been submitted and is pending review."
        );

        return saved;
    }

    public List<Booking> getAll(String status) {
        if (status != null && !status.isBlank()) {
            return bookingRepository.findByStatusOrderByBookingDateAscStartTimeAsc(status.toUpperCase());
        }
        return bookingRepository.findAll();
    }

    public List<Booking> getMine(Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        return bookingRepository.findByStudentIdOrderByBookingDateDescStartTimeAsc(currentUser.getClerkUserId());
    }

    public List<Booking> getByResource(String resourceId) {
        return bookingRepository.findByResourceIdOrderByBookingDateAscStartTimeAsc(resourceId);
    }

    public Booking approve(String id, String reason, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        requireAdmin(currentUser);

        Booking booking = getById(id);
        Resource resource = resourceService.getById(booking.getResourceId());

        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be approved");
        }

        ensureCapacityAvailable(booking, resource, List.of("APPROVED"), booking.getId());

        booking.setStatus("APPROVED");
        booking.setAdminReason(reason == null ? "" : reason);
        booking.setReviewedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        bookingNotificationService.sendApprovalEmail(saved);
        notificationService.create(
                booking.getStudentId(),
                "Your booking for '" + booking.getResourceName() + "' has been approved."
        );

        return saved;
    }

    public Booking reject(String id, String reason, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        requireAdmin(currentUser);

        Booking booking = getById(id);

        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be rejected");
        }

        booking.setStatus("REJECTED");
        booking.setAdminReason(reason == null ? "" : reason);
        booking.setReviewedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        bookingNotificationService.sendRejectionEmail(saved);
        notificationService.create(
                booking.getStudentId(),
                "Your booking for '" + booking.getResourceName() + "' has been rejected."
        );

        return saved;
    }

    public Booking cancel(String id, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        Booking booking = getById(id);

        if (!booking.getStudentId().equals(currentUser.getClerkUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }

        if (!"APPROVED".equalsIgnoreCase(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved bookings can be cancelled");
        }

        LocalDateTime bookingStart = LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
        if (LocalDateTime.now().isAfter(bookingStart.minusHours(1))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bookings must be cancelled at least 1 hour before the start time");
        }

        booking.setStatus("CANCELLED");
        booking.setReviewedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        notificationService.create(
                booking.getStudentId(),
                "Your booking for '" + booking.getResourceName() + "' has been cancelled."
        );

        return saved;
    }

    public Booking reschedule(String id,
                              LocalDate bookingDate,
                              LocalTime startTime,
                              LocalTime endTime,
                              int expectedAttendees,
                              Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        Booking booking = getById(id);

        if (!booking.getStudentId().equals(currentUser.getClerkUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only reschedule your own bookings");
        }

        if (!List.of("PENDING", "APPROVED").contains(booking.getStatus().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending or approved bookings can be rescheduled");
        }

        Resource resource = resourceService.getById(booking.getResourceId());

        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        ensureStartTimeIsFuture(bookingDate, startTime);

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

        Booking saved = bookingRepository.save(booking);

        notificationService.create(
                booking.getStudentId(),
                "Your booking for '" + booking.getResourceName() + "' was rescheduled and is pending admin review."
        );

        return saved;
    }

    private Booking getById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private void requireAdmin(User user) {
        if (user.getRoles() == null || !user.getRoles().contains("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can perform this action");
        }
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

    private void ensureStartTimeIsFuture(LocalDate bookingDate, LocalTime startTime) {
        if (!LocalDateTime.of(bookingDate, startTime).isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot book expired time slots");
        }
    }
}