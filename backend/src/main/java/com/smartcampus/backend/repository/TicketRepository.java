package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByAssignedTo(String technician);

    List<Ticket> findByCreatedBy(String createdBy);
}
//data structure for ticket repository