package com.smartcampus.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.smartcampus.backend.model.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.logging.Logger;

@Service
public class BookingNotificationService {

    private static final Logger LOGGER = Logger.getLogger(BookingNotificationService.class.getName());

    private final JavaMailSender mailSender;

    public BookingNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendApprovalEmail(Booking booking) {
        if (booking.getStudentEmail() == null || booking.getStudentEmail().isBlank()) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(booking.getStudentEmail());
            helper.setSubject("Smart Campus Booking Approved - QR Verification");
            helper.setText(buildApprovalText(booking));
            helper.addAttachment("booking-qr-" + booking.getId() + ".png", new ByteArrayResource(generateQr(booking)));
            mailSender.send(message);
        } catch (MailException | MessagingException ex) {
            LOGGER.warning("Booking approved, but approval email could not be sent: " + ex.getMessage());
        }
    }

    public void sendRejectionEmail(Booking booking) {
        if (booking.getStudentEmail() == null || booking.getStudentEmail().isBlank()) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(booking.getStudentEmail());
            message.setSubject("Smart Campus Booking Rejected");
            message.setText(buildRejectionText(booking));
            mailSender.send(message);
        } catch (MailException ex) {
            LOGGER.warning("Booking rejected, but rejection email could not be sent: " + ex.getMessage());
        }
    }

    private byte[] generateQr(Booking booking) {
        try {
            String payload = """
                    SMART CAMPUS BOOKING VERIFICATION
                    Booking ID: %s
                    Student: %s
                    Resource: %s
                    Date: %s
                    Time: %s - %s
                    Attendees: %s
                    Status: %s
                    """.formatted(
                    booking.getId(),
                    booking.getStudentName(),
                    booking.getResourceName(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getExpectedAttendees(),
                    booking.getStatus()
            );

            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(payload, BarcodeFormat.QR_CODE, 320, 320);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", output);
            return output.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Could not generate booking QR code", ex);
        }
    }

    private String buildApprovalText(Booking booking) {
        return """
                Dear %s,

                Your Smart Campus booking has been approved.

                Booking ID: %s
                Resource: %s
                Location: %s
                Date: %s
                Time: %s - %s
                Expected attendees: %s

                Please use the attached QR code as proof of verification when using the resource.

                Smart Campus
                """.formatted(
                booking.getStudentName(),
                booking.getId(),
                booking.getResourceName(),
                booking.getResourceLocation(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getExpectedAttendees()
        );
    }

    private String buildRejectionText(Booking booking) {
        return """
                Dear %s,

                Your Smart Campus booking request has been rejected.

                Booking ID: %s
                Resource: %s
                Date: %s
                Time: %s - %s

                Reason:
                %s

                Smart Campus
                """.formatted(
                booking.getStudentName(),
                booking.getId(),
                booking.getResourceName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getAdminReason() == null || booking.getAdminReason().isBlank()
                        ? "No reason provided."
                        : booking.getAdminReason()
        );
    }
}
