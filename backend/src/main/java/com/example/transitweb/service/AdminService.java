package com.example.transitweb.service;

import com.example.transitweb.dto.AdminUserResponse;
import com.example.transitweb.dto.TripResponse;
import com.example.transitweb.model.Trip;
import com.example.transitweb.model.TripStatus;
import com.example.transitweb.model.User;
import com.example.transitweb.model.Role;
import com.example.transitweb.repository.TripRepository;
import com.example.transitweb.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    public AdminService(UserRepository userRepository, TripRepository tripRepository) {
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
    }

    public Map<String, Object> getDashboardStats() {
        List<User> allUsers = userRepository.findAll();
        List<Trip> allTrips = tripRepository.findAll();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", allUsers.size());
        stats.put("totalTrips", allTrips.size());
        stats.put("pendingTrips", allTrips.stream().filter(t -> t.getStatut() == TripStatus.PENDING).count());
        stats.put("inProgressTrips", allTrips.stream().filter(t -> t.getStatut() == TripStatus.ACCEPTED || t.getStatut() == TripStatus.IN_PROGRESS).count());
        stats.put("completedTrips", allTrips.stream().filter(t -> t.getStatut() == TripStatus.COMPLETED).count());

        double totalRevenue = allTrips.stream()
                .filter(t -> t.getStatut() == TripStatus.COMPLETED)
                .mapToDouble(Trip::getPrix)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        stats.put("activeChauffeurs", allUsers.stream().filter(u -> u.getRole() == Role.CHAUFFEUR).count());
        stats.put("activeClients", allUsers.stream().filter(u -> u.getRole() == Role.CLIENT).count());

        // Stats du jour
        LocalDateTime today = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        stats.put("todayTrips", allTrips.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(today))
                .count());
        stats.put("todayRevenue", allTrips.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(today) && t.getStatut() == TripStatus.COMPLETED)
                .mapToDouble(Trip::getPrix)
                .sum());
        stats.put("newUsers", allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(today))
                .count());

        return stats;
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
    }

    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setNom(user.getNom());
        response.setEmail(user.getEmail());
        response.setTelephone(user.getTelephone());
        response.setRole(user.getRole() != null ? user.getRole().toString() : null);
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    private TripResponse toTripResponse(Trip trip) {
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
}
