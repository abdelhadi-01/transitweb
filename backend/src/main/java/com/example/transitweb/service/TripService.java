package com.example.transitweb.service;

import com.example.transitweb.dto.TripRequest;
import com.example.transitweb.dto.TripResponse;
import com.example.transitweb.model.Trip;
import com.example.transitweb.model.TripStatus;
import com.example.transitweb.model.User;
import com.example.transitweb.model.Role;
import com.example.transitweb.repository.TripRepository;
import com.example.transitweb.repository.UserRepository;
import com.example.transitweb.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TripService(TripRepository tripRepository, UserRepository userRepository, JwtService jwtService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    private User extractUser(String token) {
        String email = jwtService.extractEmail(token.substring(7));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    private TripResponse convertToResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setId(trip.getId());
        response.setDepart(trip.getDepart());
        response.setArrivee(trip.getArrivee());
        response.setDescription(trip.getDescription());
        response.setPoids(trip.getPoids());
        response.setStatut(trip.getStatut().toString());
        response.setPrix(trip.getPrix());
        response.setClientNom(trip.getClient().getNom());
        response.setChauffeurNom(trip.getChauffeur() != null ? trip.getChauffeur().getNom() : null);
        response.setCreatedAt(trip.getCreatedAt());

        // Ajouter les coordonnées si elles existent
        response.setStartLat(trip.getStartLat());
        response.setStartLng(trip.getStartLng());
        response.setEndLat(trip.getEndLat());
        response.setEndLng(trip.getEndLng());
        response.setDistance(trip.getDistance());

        return response;
    }

    public TripResponse createTrip(TripRequest request, String token) {
        User client = extractUser(token);

        if (client.getRole() != Role.CLIENT) {
            throw new RuntimeException("Seuls les clients peuvent créer des trajets");
        }

        Trip trip = new Trip();
        trip.setDepart(request.getDepart());
        trip.setArrivee(request.getArrivee());
        trip.setDescription(request.getDescription());
        trip.setPoids(request.getPoids());
        trip.setClient(client);

        // Utiliser le prix envoyé ou calculer un prix par défaut
        if (request.getPrix() != null && request.getPrix() > 0) {
            trip.setPrix(request.getPrix());
        } else {
            trip.setPrix(10.0 + (request.getPoids() * 1.0));
        }

        // ⚠️ AJOUTER CES LIGNES - Stocker les coordonnées
        if (request.getStartLat() != null) {
            trip.setStartLat(request.getStartLat());
        }
        if (request.getStartLng() != null) {
            trip.setStartLng(request.getStartLng());
        }
        if (request.getEndLat() != null) {
            trip.setEndLat(request.getEndLat());
        }
        if (request.getEndLng() != null) {
            trip.setEndLng(request.getEndLng());
        }
        if (request.getDistance() != null) {
            trip.setDistance(request.getDistance());
        }

        // Log pour déboguer
        System.out.println("📍 Coordonnées reçues:");
        System.out.println("   Départ: " + request.getStartLat() + ", " + request.getStartLng());
        System.out.println("   Arrivée: " + request.getEndLat() + ", " + request.getEndLng());
        System.out.println("   Distance: " + request.getDistance());

        Trip savedTrip = tripRepository.save(trip);
        System.out.println("✅ Trajet créé avec succès: " + savedTrip.getId());
        System.out.println("   Départ: " + savedTrip.getDepart());
        System.out.println("   Arrivée: " + savedTrip.getArrivee());
        System.out.println("   Distance: " + savedTrip.getDistance() + " km");

        return convertToResponse(savedTrip);
    }

    public List<TripResponse> getClientTrips(String token) {
        User client = extractUser(token);
        return tripRepository.findByClient(client)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TripResponse> getAvailableTrips(String token) {
        User chauffeur = extractUser(token);
        if (chauffeur.getRole() != Role.CHAUFFEUR) {
            throw new RuntimeException("Accès réservé aux chauffeurs");
        }

        return tripRepository.findByStatut(TripStatus.PENDING)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TripResponse acceptTrip(Long tripId, String token) {
        User chauffeur = extractUser(token);
        if (chauffeur.getRole() != Role.CHAUFFEUR) {
            throw new RuntimeException("Seuls les chauffeurs peuvent accepter des missions");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (trip.getStatut() != TripStatus.PENDING) {
            throw new RuntimeException("Ce trajet n'est plus disponible");
        }

        trip.setChauffeur(chauffeur);
        trip.setStatut(TripStatus.ACCEPTED);

        return convertToResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse startTrip(Long tripId, String token) {
        User chauffeur = extractUser(token);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (!trip.getChauffeur().getId().equals(chauffeur.getId())) {
            throw new RuntimeException("Vous n'êtes pas le chauffeur de ce trajet");
        }

        if (trip.getStatut() != TripStatus.ACCEPTED) {
            throw new RuntimeException("Le trajet doit être accepté avant de démarrer");
        }

        trip.setStatut(TripStatus.IN_PROGRESS);
        trip.setStartedAt(LocalDateTime.now());

        return convertToResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse completeTrip(Long tripId, String token) {
        User chauffeur = extractUser(token);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (!trip.getChauffeur().getId().equals(chauffeur.getId())) {
            throw new RuntimeException("Vous n'êtes pas le chauffeur de ce trajet");
        }

        if (trip.getStatut() != TripStatus.IN_PROGRESS) {
            throw new RuntimeException("Le trajet doit être en cours pour le terminer");
        }

        trip.setStatut(TripStatus.COMPLETED);
        trip.setCompletedAt(LocalDateTime.now());

        return convertToResponse(tripRepository.save(trip));
    }

    public List<TripResponse> getChauffeurTrips(String token) {
        User chauffeur = extractUser(token);
        return tripRepository.findByChauffeur(chauffeur)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}