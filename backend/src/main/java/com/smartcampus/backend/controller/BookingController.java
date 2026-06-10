package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking create(@Valid @RequestBody Booking booking, Authentication auth) {
        return bookingService.create(booking, auth);
    }

    @GetMapping
    public List<Booking> getAll(@RequestParam(required = false) String status) {
        return bookingService.getAll(status);
    }

    @GetMapping("/me")
    public List<Booking> getMine(Authentication auth) {
        return bookingService.getMine(auth);
    }

    @GetMapping("/resource/{resourceId}")
    public List<Booking> getByResource(@PathVariable String resourceId) {
        return bookingService.getByResource(resourceId);
    }

    @PutMapping("/{id}/approve")
    public Booking approve(@PathVariable String id,
                           @RequestBody(required = false) Map<String, String> body,
                           Authentication auth) {
        return bookingService.approve(id, body == null ? "" : body.getOrDefault("reason", ""), auth);
    }

    @PutMapping("/{id}/reject")
    public Booking reject(@PathVariable String id,
                          @RequestBody Map<String, String> body,
                          Authentication auth) {
        return bookingService.reject(id, body.getOrDefault("reason", ""), auth);
    }

    @PutMapping("/{id}/cancel")
    public Booking cancel(@PathVariable String id, Authentication auth) {
        return bookingService.cancel(id, auth);
    }

    @PutMapping("/{id}/reschedule")
    public Booking reschedule(@PathVariable String id,
                              @RequestBody RescheduleRequest request,
                              Authentication auth) {
        return bookingService.reschedule(
                id,
                request.bookingDate(),
                request.startTime(),
                request.endTime(),
                request.expectedAttendees(),
                auth
        );
    }

    public record RescheduleRequest(
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime,
            int expectedAttendees
    ) {
    }
}