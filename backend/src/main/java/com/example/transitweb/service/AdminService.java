package com.example.transitweb.service;

import com.example.transitweb.model.Trip;
import com.example.transitweb.model.TripStatus;
import com.example.transitweb.model.User;
import com.example.transitweb.repository.TripRepository;
import com.example.transitweb.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        stats.put("activeChauffeurs", allUsers.stream().filter(u -> "CHAUFFEUR".equals(u.getRole().toString())).count());
        stats.put("activeClients", allUsers.stream().filter(u -> "CLIENT".equals(u.getRole().toString())).count());

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

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }
}