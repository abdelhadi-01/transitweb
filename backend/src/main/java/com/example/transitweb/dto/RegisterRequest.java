package com.example.transitweb.dto;

public class RegisterRequest {
    private String nom;
    private String email;
    private String password;
    private String telephone;
    private String role;

    // Getters
    public String getNom() { return nom; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getTelephone() { return telephone; }
    public String getRole() { return role; }

    // Setters
    public void setNom(String nom) { this.nom = nom; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public void setRole(String role) { this.role = role; }
}