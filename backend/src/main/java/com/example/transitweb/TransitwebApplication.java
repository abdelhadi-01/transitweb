package com.example.transitweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TransitwebApplication {
	public static void main(String[] args) {
		SpringApplication.run(TransitwebApplication.class, args);
		System.out.println("========================================");
		System.out.println("🚀 TransitWeb Backend démarré avec succès!");
		System.out.println("📡 API disponible sur: http://localhost:8080");
		System.out.println("========================================");
	}
}