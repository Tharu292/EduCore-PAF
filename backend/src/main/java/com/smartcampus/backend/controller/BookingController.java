package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking create(@Valid @RequestBody Booking booking) {
        return bookingService.create(booking);
    }

    @GetMapping
    public List<Booking> getAll(@RequestParam(required = false) String status) {
        return bookingService.getAll(status);
    }

    @GetMapping("/student/{studentId}")
    public List<Booking> getByStudent(@PathVariable String studentId) {
        return bookingService.getByStudent(studentId);
    }

    @GetMapping("/resource/{resourceId}")
    public List<Booking> getByResource(@PathVariable String resourceId) {
        return bookingService.getByResource(resourceId);
    }

    @PutMapping("/{id}/approve")
    public Booking approve(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        return bookingService.approve(id, body == null ? "" : body.getOrDefault("reason", ""));
    }

    @PutMapping("/{id}/reject")
    public Booking reject(@PathVariable String id, @RequestBody Map<String, String> body) {
        return bookingService.reject(id, body.getOrDefault("reason", ""));
    }

    @PutMapping("/{id}/cancel")
    public Booking cancel(@PathVariable String id) {
        return bookingService.cancel(id);
    }

    @PutMapping("/{id}/reschedule")
    public Booking reschedule(@PathVariable String id, @RequestBody RescheduleRequest request) {
        return bookingService.reschedule(
                id,
                request.bookingDate(),
                request.startTime(),
                request.endTime(),
                request.expectedAttendees()
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
