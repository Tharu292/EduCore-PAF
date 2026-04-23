package com.smartcampus.backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @NotBlank(message = "Resource is required")
    private String resourceId;

    private String resourceName;
    private String resourceType;
    private String resourceLocation;

    @NotBlank(message = "Student is required")
    private String studentId;

    private String studentName;
    private String studentEmail;

    @NotNull(message = "Date is required")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @Min(value = 1, message = "Expected attendees must be at least 1")
    private int expectedAttendees;

    private String status = "PENDING";
    private String adminReason;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
