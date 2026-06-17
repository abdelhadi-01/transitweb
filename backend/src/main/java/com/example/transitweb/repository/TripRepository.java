package com.example.transitweb.repository;

import com.example.transitweb.model.Trip;
import com.example.transitweb.model.TripStatus;
import com.example.transitweb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByClient(User client);
    List<Trip> findByChauffeur(User chauffeur);
    List<Trip> findByStatut(TripStatus statut);
    long countByStatut(TripStatus statut);
}