package com.example.transitweb.controller;

import com.example.transitweb.dto.TripRequest;
import com.example.transitweb.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    // Constructeur explicite
    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody TripRequest request,
                                        @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(tripService.createTrip(request, token));
    }

    @GetMapping("/client")
    public ResponseEntity<?> getClientTrips(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(tripService.getClientTrips(token));
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableTrips(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(tripService.getAvailableTrips(token));
    }

    @PutMapping("/{tripId}/accept")
    public ResponseEntity<?> acceptTrip(@PathVariable Long tripId,
                                        @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(tripService.acceptTrip(tripId, token));
    }

    @PutMapping("/{tripId}/start")
    public ResponseEntity<?> startTrip(@PathVariable Long tripId,
                                       @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(tripService.startTrip(tripId, token));
    }

    @PutMapping("/{tripId}/complete")
    public ResponseEntity<?> completeTrip(@PathVariable Long tripId,
                                          @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(tripService.completeTrip(tripId, token));
    }

    @GetMapping("/chauffeur")
    public ResponseEntity<?> getChauffeurTrips(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(tripService.getChauffeurTrips(token));
    }
}