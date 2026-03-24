package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static com.smartcampus.backend.model.Ticket.Status.*;


@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository){
        this.ticketRepository = ticketRepository;
    }

    public Ticket createTicket(Ticket ticket){
        ticket.setStatus(OPEN);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id).orElse(null);
    }

    public Ticket updateStatus(String id, Ticket.Status newStatus){

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Ticket.Status currentStatus = ticket.getStatus();

        //Validate transactions
        if(!isValidTransition(currentStatus, newStatus)){
            throw new RuntimeException("Invalid status transaction from " + currentStatus + "to" + newStatus);
        }

        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }
    private boolean isValidTransition(Ticket.Status current, Ticket.Status next) {

        switch (current) {
            case OPEN:
                return next == Ticket.Status.IN_PROGRESS || next == Ticket.Status.REJECTED;

            case IN_PROGRESS:
                return next == Ticket.Status.RESOLVED || next == Ticket.Status.CLOSED;

            case RESOLVED:
                return next == Ticket.Status.CLOSED;

            case CLOSED:
            case REJECTED:
                return false;

            default:
                return false;
        }
    }

    public Ticket addComment(String ticketId, Comment comment) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Ownership validation
        if (!comment.getUser().equals(ticket.getCreatedBy()) &&
                (ticket.getAssignedTo() == null || !comment.getUser().equals(ticket.getAssignedTo()))) {

            throw new RuntimeException("User not authorized to comment on this ticket");
        }

        comment.setId(UUID.randomUUID().toString());
        // Set timestamp
        comment.setCreatedAt(LocalDateTime.now());

        // Initialize list if null
        if (ticket.getComments() == null) {
            ticket.setComments(new java.util.ArrayList<>());
        }

        ticket.getComments().add(comment);

        return ticketRepository.save(ticket);
    }
    public Ticket updateComment(String ticketId, String commentId, Comment updatedComment) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        for (Comment comment : ticket.getComments()) {

            if (comment.getId().equals(commentId)) {

                // Ownership check
                if (!comment.getUser().equals(updatedComment.getUser())) {
                    throw new RuntimeException("You can only edit your own comment");
                }

                comment.setMessage(updatedComment.getMessage());
                return ticketRepository.save(ticket);
            }
        }

        throw new RuntimeException("Comment not found");
    }

    public Ticket deleteComment(String ticketId, String commentId, String user) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Comment targetComment = null;

        for (Comment comment : ticket.getComments()) {
            if (comment.getId().equals(commentId)) {
                targetComment = comment;
                break;
            }
        }

        if (targetComment == null) {
            throw new RuntimeException("Comment not found");
        }

        // Ownership check
        if (!targetComment.getUser().equals(user)) {
            throw new RuntimeException("You can only delete your own comment");
        }

        ticket.getComments().remove(targetComment);

        return ticketRepository.save(ticket);
    }

}

