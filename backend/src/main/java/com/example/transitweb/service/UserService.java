package com.example.transitweb.service;

import com.example.transitweb.dto.AuthResponse;
import com.example.transitweb.dto.LoginRequest;
import com.example.transitweb.dto.RegisterRequest;
import com.example.transitweb.model.Role;
import com.example.transitweb.model.User;
import com.example.transitweb.repository.UserRepository;
import com.example.transitweb.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    private String extractRawToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization invalide");
        }
        return token.substring(7).trim();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email deja utilise");
        }

        User user = new User();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setTelephone(request.getTelephone());
        user.setRole("CHAUFFEUR".equals(request.getRole()) ? Role.CHAUFFEUR : Role.CLIENT);

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouve"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mot de passe incorrect");
        }

        return buildAuthResponse(user);
    }

    public AuthResponse.UserDTO getCurrentUser(String token) {
        String rawToken = extractRawToken(token);
        String email;
        try {
            email = jwtService.extractEmail(rawToken);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalide ou expire", ex);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non trouve"));

        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO();
        userDTO.setId(user.getId());
        userDTO.setNom(user.getNom());
        userDTO.setEmail(user.getEmail());
        userDTO.setTelephone(user.getTelephone());
        userDTO.setRole(user.getRole().toString());
        return userDTO;
    }

    private AuthResponse buildAuthResponse(User user) {
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
}
