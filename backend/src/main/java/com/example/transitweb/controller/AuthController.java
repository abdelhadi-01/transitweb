package com.example.transitweb.controller;

import com.example.transitweb.dto.LoginRequest;
import com.example.transitweb.dto.RegisterRequest;
import com.example.transitweb.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("🔐 Login request reçu pour: " + request.getEmail());
        try {
            return ResponseEntity.ok(userService.login(request));
        } catch (Exception e) {
            System.err.println("❌ Erreur login: " + e.getMessage());
            throw e;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        System.out.println("📡 Get current user avec token: " + token);
        return ResponseEntity.ok(userService.getCurrentUser(token));
    }

    // Endpoint de test
    // Ajoutez cet endpoint pour tester
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        System.out.println("✅ Test endpoint appelé");
        return ResponseEntity.ok("API fonctionne !");
    }
}