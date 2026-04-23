package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket, Authentication auth) {
        return ticketService.createTicket(ticket, auth);
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable String id) {
        return ticketService.getTicketById(id);
    }

    @GetMapping("/user/{clerkUserId}")
    public ResponseEntity<List<Ticket>> getTicketsByUser(@PathVariable String clerkUserId) {
        return ResponseEntity.ok(ticketService.getTicketsByUser(clerkUserId));
    }

    @GetMapping("/technician/{clerkUserId}")
    public ResponseEntity<List<Ticket>> getTicketsByTechnician(@PathVariable String clerkUserId) {
        return ResponseEntity.ok(ticketService.getTicketsByTechnician(clerkUserId));
    }

    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable String id,
                               @RequestParam Ticket.Status status,
                               @RequestParam(required = false) String reason,
                               @RequestParam(required = false) String resolutionNotes,
                               Authentication auth) {
        return ticketService.updateStatus(id, status, reason, resolutionNotes, auth);
    }

    @PostMapping("/{id}/comments")
    public Ticket addComment(@PathVariable String id,
                             @RequestBody Comment comment,
                             Authentication auth) {
        return ticketService.addComment(id, comment, auth);
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public Ticket updateComment(@PathVariable String ticketId,
                                @PathVariable String commentId,
                                @RequestBody Comment comment,
                                Authentication auth) {
        return ticketService.updateComment(ticketId, commentId, comment, auth);
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public Ticket deleteComment(@PathVariable String ticketId,
                                @PathVariable String commentId,
                                Authentication auth) {
        return ticketService.deleteComment(ticketId, commentId, auth);
    }

    @PostMapping("/{id}/upload")
    public Ticket uploadImages(@PathVariable String id,
                               @RequestParam("files") List<MultipartFile> files,
                               Authentication auth) throws IOException {
        return ticketService.uploadImages(id, files, auth);
    }

    @DeleteMapping("/{id}/attachments/{filename}")
    public Ticket removeAttachment(@PathVariable String id,
                                   @PathVariable String filename,
                                   Authentication auth) {
        return ticketService.removeAttachment(id, filename, auth);
    }

    @PostMapping("/{id}/assign")
    public Ticket assignTechnician(@PathVariable String id,
                                   @RequestParam String technicianClerkId,
                                   Authentication auth) {
        return ticketService.assignTechnician(id, technicianClerkId, auth);
    }
}