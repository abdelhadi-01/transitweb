package com.example.transitweb.service;

import com.example.transitweb.dto.AuthResponse;
import com.example.transitweb.dto.LoginRequest;
import com.example.transitweb.dto.RegisterRequest;
import com.example.transitweb.model.User;
import com.example.transitweb.model.Role;
import com.example.transitweb.repository.UserRepository;
import com.example.transitweb.security.JwtService;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        System.out.println("📝 Inscription: " + request.getEmail());

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = new User();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Mot de passe en clair
        user.setTelephone(request.getTelephone());

        if (request.getRole() != null && request.getRole().equals("CHAUFFEUR")) {
            user.setRole(Role.CHAUFFEUR);
        } else {
            user.setRole(Role.CLIENT);
        }

        userRepository.save(user);
        System.out.println("✅ Utilisateur créé: " + user.getEmail());

        String token = jwtService.generateToken(user.getEmail());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO();
        userDTO.setId(user.getId());
        userDTO.setNom(user.getNom());
        userDTO.setEmail(user.getEmail());
        userDTO.setTelephone(user.getTelephone());
        userDTO.setRole(user.getRole().toString());
        response.setUser(userDTO);

        return response;
    }

    public AuthResponse login(LoginRequest request) {
        System.out.println("🔐 Tentative de connexion: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("❌ Utilisateur non trouvé: " + request.getEmail());
                    return new RuntimeException("Utilisateur non trouvé");
                });

        System.out.println("✅ Utilisateur trouvé: " + user.getEmail());
        System.out.println("🔑 Mot de passe stocké: " + user.getPassword());
        System.out.println("🔑 Mot de passe fourni: " + request.getPassword());

        // Comparaison en clair
        if (!user.getPassword().equals(request.getPassword())) {
            System.out.println("❌ Mot de passe incorrect");
            throw new RuntimeException("Mot de passe incorrect");
        }

        System.out.println("✅ Connexion réussie pour: " + user.getEmail());

        String token = jwtService.generateToken(user.getEmail());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO();
        userDTO.setId(user.getId());
        userDTO.setNom(user.getNom());
        userDTO.setEmail(user.getEmail());
        userDTO.setTelephone(user.getTelephone());
        userDTO.setRole(user.getRole().toString());
        response.setUser(userDTO);

        return response;
    }

    public User getCurrentUser(String token) {
        String email = jwtService.extractEmail(token.substring(7));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }
}