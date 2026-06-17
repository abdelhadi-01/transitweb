package com.example.transitweb.dto;

public class AuthResponse {
    private String token;
    private UserDTO user;

    public static class UserDTO {
        private Long id;
        private String nom;
        private String email;
        private String telephone;
        private String role;

        // Getters
        public Long getId() { return id; }
        public String getNom() { return nom; }
        public String getEmail() { return email; }
        public String getTelephone() { return telephone; }
        public String getRole() { return role; }

        // Setters
        public void setId(Long id) { this.id = id; }
        public void setNom(String nom) { this.nom = nom; }
        public void setEmail(String email) { this.email = email; }
        public void setTelephone(String telephone) { this.telephone = telephone; }
        public void setRole(String role) { this.role = role; }
    }

    // Getters
    public String getToken() { return token; }
    public UserDTO getUser() { return user; }

    // Setters
    public void setToken(String token) { this.token = token; }
    public void setUser(UserDTO user) { this.user = user; }
}