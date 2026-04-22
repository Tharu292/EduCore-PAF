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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.logging.Logger;

@Service
public class BookingNotificationService {

    private static final Logger LOGGER = Logger.getLogger(BookingNotificationService.class.getName());
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("hh:mm a");

    private final JavaMailSender mailSender;

    public BookingNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendApprovalEmail(Booking booking) {
        if (booking.getStudentEmail() == null || booking.getStudentEmail().isBlank()) {
            return;
        }

        try {
            byte[] qrCode = generateQr(booking);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(booking.getStudentEmail());
            helper.setSubject("Smart Campus Booking Approved | QR Verification");
            helper.setText(buildApprovalText(booking), buildApprovalHtml(booking));
            helper.addInline("bookingQr", new ByteArrayResource(qrCode), "image/png");
            helper.addAttachment("booking-qr-" + booking.getId() + ".png", new ByteArrayResource(qrCode));
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
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(booking.getStudentEmail());
            helper.setSubject("Smart Campus Booking Rejected | Review Update");
            helper.setText(buildRejectionText(booking), buildRejectionHtml(booking));
            mailSender.send(message);
        } catch (MailException | MessagingException ex) {
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
                formatDate(booking),
                formatStartTime(booking),
                formatEndTime(booking),
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
                formatDate(booking),
                formatStartTime(booking),
                formatEndTime(booking),
                rejectionReason(booking)
        );
    }

    private String buildApprovalHtml(Booking booking) {
        return emailShell(
                "Booking approved",
                "APPROVED",
                "#0f9f6e",
                """
                        <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.6;">
                            Hi %s, your Smart Campus booking has been approved. Show the QR code below when you arrive to verify your booking.
                        </p>
                        %s
                        <div style="margin:22px 0;padding:18px;border:1px solid #c7d2fe;border-radius:10px;background:#eef2ff;text-align:center;">
                            <p style="margin:0 0 12px;color:#312e81;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Verification QR</p>
                            <img src="cid:bookingQr" width="190" height="190" alt="Booking QR code" style="display:block;margin:0 auto 12px;border:8px solid #ffffff;border-radius:8px;">
                            <p style="margin:0;color:#475569;font-size:13px;line-height:1.5;">The same QR code is attached as a PNG file for easy saving.</p>
                        </div>
                        <div style="margin-top:20px;padding:14px 16px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:14px;line-height:1.5;">
                            Please arrive on time and keep this email ready as proof of verification.
                        </div>
                        """.formatted(escape(booking.getStudentName()), bookingSummaryTable(booking))
        );
    }

    private String buildRejectionHtml(Booking booking) {
        return emailShell(
                "Booking rejected",
                "REJECTED",
                "#dc2626",
                """
                        <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.6;">
                            Hi %s, your Smart Campus booking request was reviewed by the admin team and could not be approved.
                        </p>
                        %s
                        <div style="margin:22px 0;padding:16px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca;">
                            <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Admin reason</p>
                            <p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.6;">%s</p>
                        </div>
                        <div style="margin-top:20px;padding:14px 16px;border-radius:10px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:14px;line-height:1.5;">
                            You can choose another available slot from the resource booking page and submit a new request.
                        </div>
                        """.formatted(escape(booking.getStudentName()), bookingSummaryTable(booking), escape(rejectionReason(booking)))
        );
    }

    private String emailShell(String title, String status, String statusColor, String body) {
        return """
                <!doctype html>
                <html>
                <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 12px 34px rgba(15,23,42,.08);">
                                    <tr>
                                        <td style="padding:26px 28px;background:#0f172a;">
                                            <p style="margin:0 0 8px;color:#93c5fd;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Smart Campus</p>
                                            <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.2;">%s</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:26px 28px 30px;">
                                            <span style="display:inline-block;margin-bottom:18px;padding:7px 12px;border-radius:999px;background:%s;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:.06em;">%s</span>
                                            %s
                                            <p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.6;border-top:1px solid #e2e8f0;padding-top:16px;">
                                                This is an automated notification from the Smart Campus Facilities & Assets Booking System.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(escape(title), statusColor, escape(status), body);
    }

    private String bookingSummaryTable(Booking booking) {
        return """
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
                    %s
                    %s
                    %s
                    %s
                    %s
                    %s
                    %s
                </table>
                """.formatted(
                detailRow("Booking ID", booking.getId()),
                detailRow("Resource", booking.getResourceName()),
                detailRow("Location", booking.getResourceLocation()),
                detailRow("Date", formatDate(booking)),
                detailRow("Time", formatStartTime(booking) + " - " + formatEndTime(booking)),
                detailRow("Expected attendees", String.valueOf(booking.getExpectedAttendees())),
                detailRow("Purpose", booking.getPurpose())
        );
    }

    private String detailRow(String label, String value) {
        return """
                <tr>
                    <td style="width:42%%;padding:12px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;font-weight:700;">%s</td>
                    <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;">%s</td>
                </tr>
                """.formatted(escape(label), escape(value));
    }

    private String rejectionReason(Booking booking) {
        return booking.getAdminReason() == null || booking.getAdminReason().isBlank()
                ? "No reason provided."
                : booking.getAdminReason();
    }

    private String formatDate(Booking booking) {
        return booking.getBookingDate() == null ? "-" : booking.getBookingDate().format(DATE_FORMAT);
    }

    private String formatStartTime(Booking booking) {
        return booking.getStartTime() == null ? "-" : booking.getStartTime().format(TIME_FORMAT);
    }

    private String formatEndTime(Booking booking) {
        return booking.getEndTime() == null ? "-" : booking.getEndTime().format(TIME_FORMAT);
    }

    private String escape(String value) {
        if (value == null || value.isBlank()) {
            return "-";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
