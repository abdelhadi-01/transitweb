package com.example.transitweb.controller;

import com.example.transitweb.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyNotifications(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(notificationService.getMyNotifications(token));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(notificationService.getUnreadCount(token));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long notificationId,
                                        @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, token));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String token) {
        notificationService.markAllAsRead(token);
        return ResponseEntity.ok().build();
    }
}
