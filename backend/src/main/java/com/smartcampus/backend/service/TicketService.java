package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Ticket createTicket(Ticket ticket, Authentication auth) {
        User currentUser = (User) auth.getPrincipal();
        LocalDateTime now = LocalDateTime.now();

        ticket.setCreatedBy(currentUser.getClerkUserId());
        ticket.setAssignedTo(null);
        ticket.setStatus(Ticket.Status.OPEN);
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);

        ticket.setAssignedAt(null);
        ticket.setResolvedAt(null);
        ticket.setClosedAt(null);
        ticket.setRejectedAt(null);
        ticket.setFirstResponseAt(null);

        ticket.setRejectionReason(null);
        ticket.setResolutionNotes(null);

        if (ticket.getComments() == null) ticket.setComments(new ArrayList<>());
        if (ticket.getAttachments() == null) ticket.setAttachments(new ArrayList<>());

        ticket.setDueAt(calculateDueAt(ticket.getPriority(), now));

        Ticket savedTicket = ticketRepository.save(ticket);

        userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains("ADMIN"))
                .forEach(admin -> notificationService.create(
                        admin.getClerkUserId(),
                        "New ticket created: " + savedTicket.getTitle()
                ));

        return savedTicket;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<Ticket> getTicketsByUser(String clerkUserId) {
        return ticketRepository.findByCreatedBy(clerkUserId);
    }

    public List<Ticket> getTicketsByTechnician(String clerkUserId) {
        return ticketRepository.findByAssignedTo(clerkUserId);
    }

    public Ticket updateStatus(String id, Ticket.Status newStatus, Authentication auth) {
        return updateStatus(id, newStatus, null, null, auth);
    }

    public Ticket updateStatus(String id,
                               Ticket.Status newStatus,
                               String reason,
                               String resolutionNotes,
                               Authentication auth) {
        Ticket ticket = getTicketById(id);
        User currentUser = (User) auth.getPrincipal();
        LocalDateTime now = LocalDateTime.now();

        boolean isAdmin = currentUser.getRoles().contains("ADMIN");
        boolean isAssignedTechnician = ticket.getAssignedTo() != null &&
                currentUser.getClerkUserId().equals(ticket.getAssignedTo());
        boolean isCreator = currentUser.getClerkUserId().equals(ticket.getCreatedBy());

        if (!canUpdateStatus(ticket.getStatus(), newStatus, isAdmin, isAssignedTechnician, isCreator)) {
            throw new RuntimeException("You are not allowed to change this ticket from "
                    + ticket.getStatus() + " to " + newStatus);
        }

        Ticket.Status oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(now);

        switch (newStatus) {
            case IN_PROGRESS -> {
                if (ticket.getFirstResponseAt() == null) {
                    ticket.setFirstResponseAt(now);
                }
            }
            case RESOLVED -> {
                ticket.setResolvedAt(now);
                if (resolutionNotes != null && !resolutionNotes.isBlank()) {
                    ticket.setResolutionNotes(resolutionNotes);
                }
            }
            case CLOSED -> ticket.setClosedAt(now);
            case REJECTED -> {
                if (!isAdmin) {
                    throw new RuntimeException("Only ADMIN can reject a ticket");
                }
                if (reason == null || reason.isBlank()) {
                    throw new RuntimeException("Rejection reason is required");
                }
                ticket.setRejectedAt(now);
                ticket.setRejectionReason(reason);
            }
            default -> {
            }
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.create(
                ticket.getCreatedBy(),
                "Your ticket '" + ticket.getTitle() + "' status changed from " + oldStatus + " to " + newStatus
        );

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().equals(ticket.getCreatedBy())) {
            notificationService.create(
                    ticket.getAssignedTo(),
                    "Ticket '" + ticket.getTitle() + "' status changed to " + newStatus
            );
        }

        return saved;
    }

    public Ticket addComment(String ticketId, Comment comment, Authentication auth) {
        Ticket ticket = getTicketById(ticketId);
        User currentUser = (User) auth.getPrincipal();

        boolean isAdmin = currentUser.getRoles().contains("ADMIN");
        boolean isAssigned = ticket.getAssignedTo() != null &&
                currentUser.getClerkUserId().equals(ticket.getAssignedTo());
        boolean isCreator = currentUser.getClerkUserId().equals(ticket.getCreatedBy());

        if (!isAdmin && !isAssigned && !isCreator) {
            throw new RuntimeException("You are not allowed to comment on this ticket");
        }

        comment.setId(UUID.randomUUID().toString());
        comment.setUser(currentUser.getClerkUserId());
        comment.setCreatedAt(LocalDateTime.now());

        if (ticket.getComments() == null) {
            ticket.setComments(new ArrayList<>());
        }

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        if (!ticket.getCreatedBy().equals(currentUser.getClerkUserId())) {
            notificationService.create(ticket.getCreatedBy(),
                    "New comment on your ticket: " + ticket.getTitle());
        }

        if (ticket.getAssignedTo() != null &&
                !ticket.getAssignedTo().equals(currentUser.getClerkUserId())) {
            notificationService.create(ticket.getAssignedTo(),
                    "New comment on assigned ticket: " + ticket.getTitle());
        }

        return saved;
    }

    public Ticket updateComment(String ticketId, String commentId, Comment updatedComment, Authentication auth) {
        Ticket ticket = getTicketById(ticketId);
        User currentUser = (User) auth.getPrincipal();
        boolean isAdmin = currentUser.getRoles().contains("ADMIN");

        if (ticket.getComments() == null || ticket.getComments().isEmpty()) {
            throw new RuntimeException("No comments found");
        }

        Comment target = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!isAdmin && !target.getUser().equals(currentUser.getClerkUserId())) {
            throw new RuntimeException("You can only edit your own comments");
        }

        target.setMessage(updatedComment.getMessage());
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public Ticket deleteComment(String ticketId, String commentId, Authentication auth) {
        Ticket ticket = getTicketById(ticketId);
        User currentUser = (User) auth.getPrincipal();
        boolean isAdmin = currentUser.getRoles().contains("ADMIN");

        if (ticket.getComments() == null || ticket.getComments().isEmpty()) {
            throw new RuntimeException("No comments found");
        }

        Comment target = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!isAdmin && !target.getUser().equals(currentUser.getClerkUserId())) {
            throw new RuntimeException("You can only delete your own comments");
        }

        ticket.getComments().remove(target);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public Ticket uploadImages(String ticketId, List<MultipartFile> files, Authentication auth) throws IOException {
        Ticket ticket = getTicketById(ticketId);
        User currentUser = (User) auth.getPrincipal();

        boolean isAdmin = currentUser.getRoles().contains("ADMIN");
        boolean isCreator = currentUser.getClerkUserId().equals(ticket.getCreatedBy());
        boolean isAssigned = ticket.getAssignedTo() != null &&
                currentUser.getClerkUserId().equals(ticket.getAssignedTo());

        if (!isAdmin && !isCreator && !isAssigned) {
            throw new RuntimeException("Not authorized to upload images to this ticket");
        }

        if (ticket.getAttachments() == null) {
            ticket.setAttachments(new ArrayList<>());
        }

        if (ticket.getAttachments().size() + files.size() > 3) {
            throw new RuntimeException("Maximum 3 images allowed per ticket");
        }

        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/jpeg")
                    && !contentType.equals("image/png")
                    && !contentType.equals("image/jpg")
                    && !contentType.equals("image/webp"))) {
                throw new RuntimeException("Only image files are allowed");
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File destination = new File(uploadDir + fileName);
            file.transferTo(destination);
            ticket.getAttachments().add(fileName);
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket removeAttachment(String ticketId, String filename, Authentication auth) {
        Ticket ticket = getTicketById(ticketId);
        User currentUser = (User) auth.getPrincipal();

        boolean isAdmin = currentUser.getRoles().contains("ADMIN");
        boolean isCreator = currentUser.getClerkUserId().equals(ticket.getCreatedBy());
        boolean isAssigned = ticket.getAssignedTo() != null &&
                currentUser.getClerkUserId().equals(ticket.getAssignedTo());

        if (!isAdmin && !isCreator && !isAssigned) {
            throw new RuntimeException("Not authorized to remove attachment");
        }

        if (ticket.getAttachments() == null || !ticket.getAttachments().contains(filename)) {
            throw new RuntimeException("Attachment not found");
        }

        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File fileToDelete = new File(uploadDir + filename);
        if (fileToDelete.exists()) {
            fileToDelete.delete();
        }

        ticket.getAttachments().remove(filename);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(String ticketId, String technicianClerkId, Authentication auth) {
        User admin = (User) auth.getPrincipal();

        if (!admin.getRoles().contains("ADMIN")) {
            throw new RuntimeException("Only ADMIN can assign technicians");
        }

        User technician = userRepository.findByClerkUserId(technicianClerkId)
                .orElseThrow(() -> new RuntimeException("Technician user not found"));

        if (technician.getRoles() == null || !technician.getRoles().contains("TECHNICIAN")) {
            throw new RuntimeException("Selected user is not a technician");
        }

        Ticket ticket = getTicketById(ticketId);

        if (ticket.getStatus() == Ticket.Status.CLOSED || ticket.getStatus() == Ticket.Status.REJECTED) {
            throw new RuntimeException("Cannot assign technician to a closed or rejected ticket");
        }

        LocalDateTime now = LocalDateTime.now();

        ticket.setAssignedTo(technicianClerkId);
        ticket.setAssignedAt(now);

        if (ticket.getStatus() == Ticket.Status.OPEN) {
            ticket.setStatus(Ticket.Status.IN_PROGRESS);
            if (ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(now);
            }
        }

        ticket.setUpdatedAt(now);

        Ticket saved = ticketRepository.save(ticket);

        notificationService.create(
                technicianClerkId,
                "You have been assigned ticket: " + ticket.getTitle()
        );

        notificationService.create(
                ticket.getCreatedBy(),
                "A technician has been assigned to your ticket: " + ticket.getTitle()
        );

        return saved;
    }

    private boolean canUpdateStatus(Ticket.Status current,
                                    Ticket.Status next,
                                    boolean isAdmin,
                                    boolean isAssignedTechnician,
                                    boolean isCreator) {

        if (current == Ticket.Status.CLOSED || current == Ticket.Status.REJECTED) {
            return false;
        }

        if (isAdmin) {
            return switch (current) {
                case OPEN -> next == Ticket.Status.IN_PROGRESS || next == Ticket.Status.REJECTED;
                case IN_PROGRESS -> next == Ticket.Status.RESOLVED || next == Ticket.Status.REJECTED;
                case RESOLVED -> next == Ticket.Status.CLOSED;
                default -> false;
            };
        }

        if (isAssignedTechnician) {
            return switch (current) {
                case OPEN -> next == Ticket.Status.IN_PROGRESS;
                case IN_PROGRESS -> next == Ticket.Status.RESOLVED;
                default -> false;
            };
        }

        if (isCreator) {
            return current == Ticket.Status.RESOLVED && next == Ticket.Status.CLOSED;
        }

        return false;
    }

    private LocalDateTime calculateDueAt(String priority, LocalDateTime now) {
        if (priority == null) {
            return now.plusDays(3);
        }

        return switch (priority.toUpperCase()) {
            case "HIGH" -> now.plusHours(24);
            case "MEDIUM" -> now.plusDays(3);
            case "LOW" -> now.plusDays(7);
            default -> now.plusDays(3);
        };
    }
}