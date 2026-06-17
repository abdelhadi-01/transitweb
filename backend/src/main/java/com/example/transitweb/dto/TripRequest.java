package com.example.transitweb.dto;

public class TripRequest {
    private String depart;
    private String arrivee;
    private String description;
    private Double poids;
    private Double startLat;
    private Double startLng;
    private Double endLat;
    private Double endLng;
    private Double distance;
    private Double prix;

    // Getters
    public String getDepart() { return depart; }
    public String getArrivee() { return arrivee; }
    public String getDescription() { return description; }
    public Double getPoids() { return poids; }
    public Double getStartLat() { return startLat; }
    public Double getStartLng() { return startLng; }
    public Double getEndLat() { return endLat; }
    public Double getEndLng() { return endLng; }
    public Double getDistance() { return distance; }
    public Double getPrix() { return prix; }

    // Setters
    public void setDepart(String depart) { this.depart = depart; }
    public void setArrivee(String arrivee) { this.arrivee = arrivee; }
    public void setDescription(String description) { this.description = description; }
    public void setPoids(Double poids) { this.poids = poids; }
    public void setStartLat(Double startLat) { this.startLat = startLat; }
    public void setStartLng(Double startLng) { this.startLng = startLng; }
    public void setEndLat(Double endLat) { this.endLat = endLat; }
    public void setEndLng(Double endLng) { this.endLng = endLng; }
    public void setDistance(Double distance) { this.distance = distance; }
    public void setPrix(Double prix) { this.prix = prix; }
}