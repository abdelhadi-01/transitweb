package com.example.transitweb.dto;

import java.time.LocalDateTime;

public class TripResponse {
    private Long id;
    private String depart;
    private String arrivee;
    private String description;
    private Double poids;
    private String statut;
    private Double prix;
    private String clientNom;
    private String chauffeurNom;
    private LocalDateTime createdAt;

    // Nouveaux champs pour les coordonnées
    private Double startLat;
    private Double startLng;
    private Double endLat;
    private Double endLng;
    private Double distance;

    // Getters
    public Long getId() { return id; }
    public String getDepart() { return depart; }
    public String getArrivee() { return arrivee; }
    public String getDescription() { return description; }
    public Double getPoids() { return poids; }
    public String getStatut() { return statut; }
    public Double getPrix() { return prix; }
    public String getClientNom() { return clientNom; }
    public String getChauffeurNom() { return chauffeurNom; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Nouveaux getters
    public Double getStartLat() { return startLat; }
    public Double getStartLng() { return startLng; }
    public Double getEndLat() { return endLat; }
    public Double getEndLng() { return endLng; }
    public Double getDistance() { return distance; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setDepart(String depart) { this.depart = depart; }
    public void setArrivee(String arrivee) { this.arrivee = arrivee; }
    public void setDescription(String description) { this.description = description; }
    public void setPoids(Double poids) { this.poids = poids; }
    public void setStatut(String statut) { this.statut = statut; }
    public void setPrix(Double prix) { this.prix = prix; }
    public void setClientNom(String clientNom) { this.clientNom = clientNom; }
    public void setChauffeurNom(String chauffeurNom) { this.chauffeurNom = chauffeurNom; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Nouveaux setters
    public void setStartLat(Double startLat) { this.startLat = startLat; }
    public void setStartLng(Double startLng) { this.startLng = startLng; }
    public void setEndLat(Double endLat) { this.endLat = endLat; }
    public void setEndLng(Double endLng) { this.endLng = endLng; }
    public void setDistance(Double distance) { this.distance = distance; }
}