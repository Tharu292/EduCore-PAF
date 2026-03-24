package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

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

}

