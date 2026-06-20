package com.example.transitweb.service;

import com.example.transitweb.dto.NotificationResponse;
import com.example.transitweb.model.Notification;
import com.example.transitweb.model.Role;
import com.example.transitweb.model.User;
import com.example.transitweb.repository.NotificationRepository;
import com.example.transitweb.repository.UserRepository;
import com.example.transitweb.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
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

    public List<NotificationResponse> getMyNotifications(String token) {
        User user = extractUser(token);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String token) {
        User user = extractUser(token);
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String token) {
        User user = extractUser(token);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acces refuse");
        }

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(String token) {
        User user = extractUser(token);
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void notifyUsers(List<User> users, String type, String message, Long tripId) {
        Set<Long> seen = new LinkedHashSet<>();
        List<Notification> notifications = new ArrayList<>();

        for (User user : users) {
            if (user == null || user.getId() == null || !seen.add(user.getId())) {
                continue;
            }

            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setMessage(message);
            notification.setTripId(tripId);
            notifications.add(notification);
        }

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }

    @Transactional
    public void notifyRole(Role role, String type, String message, Long tripId) {
        notifyUsers(userRepository.findAllByRole(role), type, message, tripId);
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setTripId(notification.getTripId());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
