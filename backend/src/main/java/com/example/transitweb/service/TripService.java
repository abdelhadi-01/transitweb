package com.example.transitweb.service;

import com.example.transitweb.dto.TripRequest;
import com.example.transitweb.dto.TripResponse;
import com.example.transitweb.model.Role;
import com.example.transitweb.model.Trip;
import com.example.transitweb.model.TripStatus;
import com.example.transitweb.model.User;
import com.example.transitweb.repository.TripRepository;
import com.example.transitweb.repository.UserRepository;
import com.example.transitweb.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final NotificationService notificationService;

    public TripService(
            TripRepository tripRepository,
            UserRepository userRepository,
            JwtService jwtService,
            NotificationService notificationService
    ) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
    }

    private String extractRawToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization invalide");
        }
        return token.substring(7).trim();
    }

    private User extractUser(String token) {
        String rawToken = extractRawToken(token);
        String email;
        try {
            email = jwtService.extractEmail(rawToken);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalide ou expire", ex);
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouve"));
    }

    private TripResponse convertToResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setId(trip.getId());
        response.setDepart(trip.getDepart());
        response.setArrivee(trip.getArrivee());
        response.setDescription(trip.getDescription());
        response.setPoids(trip.getPoids());
        response.setStatut(trip.getStatut() != null ? trip.getStatut().toString() : null);
        response.setPrix(trip.getPrix());
        response.setClientNom(trip.getClient() != null ? trip.getClient().getNom() : null);
        response.setChauffeurNom(trip.getChauffeur() != null ? trip.getChauffeur().getNom() : null);
        response.setCreatedAt(trip.getCreatedAt());
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
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seuls les clients peuvent creer des trajets");
        }

        Trip trip = new Trip();
        trip.setDepart(request.getDepart());
        trip.setArrivee(request.getArrivee());
        trip.setDescription(request.getDescription());
        trip.setPoids(request.getPoids());
        trip.setClient(client);

        if (request.getPrix() != null && request.getPrix() > 0) {
            trip.setPrix(request.getPrix());
            System.out.println("Prix recu du frontend: " + request.getPrix());
        } else {
            double distance = request.getDistance() != null ? request.getDistance() : 0;
            double poids = request.getPoids() != null ? request.getPoids() : 0;
            double prixBase = 20.0;
            double prixParKm = 5.0;
            double prixParKg = 2.0;
            double prixCalcule = prixBase + (distance * prixParKm) + (poids * prixParKg);
            trip.setPrix(prixCalcule);
            System.out.println("Prix calcule en backend (fallback): " + prixCalcule);
        }

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

        Trip savedTrip = tripRepository.save(trip);
        String tripLabel = "#" + String.format("%06d", savedTrip.getId());

        notificationService.notifyUsers(
                List.of(client),
                "TRIP_CREATED",
                "Votre commande " + tripLabel + " a ete creee.",
                savedTrip.getId()
        );
        notificationService.notifyUsers(
                userRepository.findAllByRole(Role.ADMIN),
                "TRIP_CREATED",
                "Nouvelle commande " + tripLabel + " creee par " + client.getNom(),
                savedTrip.getId()
        );
        notificationService.notifyUsers(
                userRepository.findAllByRole(Role.CHAUFFEUR),
                "TRIP_CREATED",
                "Nouvelle commande disponible " + tripLabel,
                savedTrip.getId()
        );

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
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acces reserve aux chauffeurs");
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
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seuls les chauffeurs peuvent accepter des missions");
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trajet non trouve"));

        if (trip.getStatut() != TripStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce trajet n'est plus disponible");
        }

        trip.setChauffeur(chauffeur);
        trip.setStatut(TripStatus.ACCEPTED);
        Trip savedTrip = tripRepository.save(trip);
        String tripLabel = "#" + String.format("%06d", savedTrip.getId());

        notificationService.notifyUsers(
                List.of(trip.getClient()),
                "TRIP_ACCEPTED",
                "Votre commande " + tripLabel + " a ete confirmee.",
                savedTrip.getId()
        );
        notificationService.notifyUsers(
                List.of(chauffeur),
                "TRIP_ACCEPTED",
                "Vous avez confirme la commande " + tripLabel + ".",
                savedTrip.getId()
        );
        notificationService.notifyUsers(
                userRepository.findAllByRole(Role.ADMIN),
                "TRIP_ACCEPTED",
                "La commande " + tripLabel + " a ete confirmee.",
                savedTrip.getId()
        );

        return convertToResponse(savedTrip);
    }

    @Transactional
    public TripResponse startTrip(Long tripId, String token) {
        User chauffeur = extractUser(token);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trajet non trouve"));

        if (trip.getChauffeur() == null || !trip.getChauffeur().getId().equals(chauffeur.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'etes pas le chauffeur de ce trajet");
        }

        if (trip.getStatut() != TripStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le trajet doit etre accepte avant de demarrer");
        }

        trip.setStatut(TripStatus.IN_PROGRESS);
        trip.setStartedAt(LocalDateTime.now());
        return convertToResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse completeTrip(Long tripId, String token) {
        User chauffeur = extractUser(token);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trajet non trouve"));

        if (trip.getChauffeur() == null || !trip.getChauffeur().getId().equals(chauffeur.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'etes pas le chauffeur de ce trajet");
        }

        if (trip.getStatut() != TripStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le trajet doit etre en cours pour le terminer");
        }

        trip.setStatut(TripStatus.COMPLETED);
        trip.setCompletedAt(LocalDateTime.now());
        Trip savedTrip = tripRepository.save(trip);
        String tripLabel = "#" + String.format("%06d", savedTrip.getId());

        notificationService.notifyUsers(
                List.of(trip.getClient()),
                "TRIP_COMPLETED",
                "Votre commande " + tripLabel + " a ete effectuee.",
                savedTrip.getId()
        );
        notificationService.notifyUsers(
                List.of(chauffeur),
                "TRIP_COMPLETED",
                "La commande " + tripLabel + " a ete marquee comme effectuee.",
                savedTrip.getId()
        );
        notificationService.notifyUsers(
                userRepository.findAllByRole(Role.ADMIN),
                "TRIP_COMPLETED",
                "La commande " + tripLabel + " a ete effectuee.",
                savedTrip.getId()
        );

        return convertToResponse(savedTrip);
    }

    public List<TripResponse> getChauffeurTrips(String token) {
        User chauffeur = extractUser(token);
        return tripRepository.findByChauffeur(chauffeur)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}
