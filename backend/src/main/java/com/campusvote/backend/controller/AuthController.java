package com.campusvote.backend.controller;

import com.campusvote.backend.entity.User;
import com.campusvote.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        try {

            // Validate name
            if (request.getName() == null ||
                    request.getName().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Name is required.");
            }

            // Validate email
            if (request.getEmail() == null ||
                    request.getEmail().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Email is required.");
            }

            // Validate password
            if (request.getPassword() == null ||
                    request.getPassword().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Password is required.");
            }

            if (request.getPassword().length() < 6) {

                return ResponseEntity.badRequest()
                        .body("Password must contain at least 6 characters.");
            }

            String email = request.getEmail()
                    .trim()
                    .toLowerCase();

            // Check duplicate email
            Optional<User> existingUser =
                    userRepository.findByEmail(email);

            if (existingUser.isPresent()) {

                return ResponseEntity.badRequest()
                        .body("An account with this email already exists.");
            }

            // Create new user
            User user = new User();

            user.setName(request.getName().trim());
            user.setEmail(email);

            // Store password using BCrypt
            user.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );

            // IMPORTANT:
            // Public registration can ONLY create STUDENT accounts.
            // Users cannot register themselves as ADMIN.
            user.setRole("STUDENT");

            User savedUser = userRepository.save(user);

            return ResponseEntity.ok(
                    createUserResponse(savedUser)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body("Unable to register user.");
        }
    }


    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        try {

            // Validate email
            if (request.getEmail() == null ||
                    request.getEmail().trim().isEmpty()) {

                return ResponseEntity.status(401)
                        .body("Invalid email or password.");
            }

            // Validate password
            if (request.getPassword() == null ||
                    request.getPassword().isEmpty()) {

                return ResponseEntity.status(401)
                        .body("Invalid email or password.");
            }

            String email = request.getEmail()
                    .trim()
                    .toLowerCase();

            Optional<User> optionalUser =
                    userRepository.findByEmail(email);

            // User does not exist
            if (optionalUser.isEmpty()) {

                return ResponseEntity.status(401)
                        .body("Invalid email or password.");
            }

            User user = optionalUser.get();

            String storedPassword = user.getPassword();

            if (storedPassword == null ||
                    storedPassword.isEmpty()) {

                return ResponseEntity.status(401)
                        .body("Invalid email or password.");
            }

            boolean passwordMatches;

            /*
             * Existing users may have been created before BCrypt
             * was added to the project.
             *
             * BCrypt passwords normally start with:
             * $2a$, $2b$ or $2y$
             */
            if (isBCryptPassword(storedPassword)) {

                passwordMatches =
                        passwordEncoder.matches(
                                request.getPassword(),
                                storedPassword
                        );

            } else {

                /*
                 * Backward compatibility for old test accounts.
                 *
                 * If the old password matches, immediately replace
                 * it with a BCrypt password.
                 */
                passwordMatches =
                        request.getPassword()
                                .equals(storedPassword);

                if (passwordMatches) {

                    user.setPassword(
                            passwordEncoder.encode(
                                    request.getPassword()
                            )
                    );

                    userRepository.save(user);
                }
            }

            // Wrong password
            if (!passwordMatches) {

                return ResponseEntity.status(401)
                        .body("Invalid email or password.");
            }

            /*
             * IMPORTANT:
             * Do NOT return the complete User entity.
             * Otherwise the password field could be exposed.
             */
            return ResponseEntity.ok(
                    createUserResponse(user)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body("Unable to process login.");
        }
    }


    // =========================
    // CHECK BCrypt PASSWORD
    // =========================
    private boolean isBCryptPassword(String password) {

        return password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$");
    }


    // =========================
    // SAFE USER RESPONSE
    // =========================
    private Map<String, Object> createUserResponse(User user) {

        Map<String, Object> response =
                new HashMap<>();

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return response;
    }


    // =========================
    // REGISTER REQUEST
    // =========================
    public static class RegisterRequest {

        private String name;
        private String email;
        private String password;
        private String role;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }


    // =========================
    // LOGIN REQUEST
    // =========================
    public static class LoginRequest {

        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}