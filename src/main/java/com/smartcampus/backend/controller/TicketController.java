package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // CREATE ticket
    @PostMapping
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    // GET all tickets
    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    // GET ticket by ID
    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable String id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}/status")
    public Ticket updateStatus(
            @PathVariable String id,
            @RequestParam Ticket.Status status) {

        return ticketService.updateStatus(id, status);
    }

    @PostMapping("/{id}/comments")
    public Ticket addComment(
            @PathVariable String id,
            @RequestBody Comment comment) {

        return ticketService.addComment(id, comment);
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public Ticket updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestBody Comment comment) {

        return ticketService.updateComment(ticketId, commentId, comment);
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public Ticket deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam String user) {

        return ticketService.deleteComment(ticketId, commentId, user);
    }
    @PostMapping("/{id}/upload")
    public Ticket uploadImages(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam String user) throws IOException {

        return ticketService.uploadImages(id, files, user);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @RequestParam String technician,
            @RequestParam String admin
    ) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technician, admin));
    }

    @GetMapping("/technician/{name}")
    public ResponseEntity<List<Ticket>> getTicketsByTechnician(@PathVariable String name) {
        return ResponseEntity.ok(ticketService.getTicketsByTechnician(name));
    }
}
