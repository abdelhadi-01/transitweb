package com.example.transitweb.repository;

import com.example.transitweb.model.User;
import com.example.transitweb.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findAllByRole(Role role);
    long countByRole(Role role);
    boolean existsByEmail(String email);
}
