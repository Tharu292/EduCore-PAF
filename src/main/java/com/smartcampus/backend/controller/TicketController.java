package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.service.TicketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
