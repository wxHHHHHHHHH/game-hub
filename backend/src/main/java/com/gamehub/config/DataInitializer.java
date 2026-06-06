package com.gamehub.config;

import com.gamehub.entity.User;
import com.gamehub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createUserIfNotExists("admin",   passwordEncoder.encode("admin123"),   "Admin",    User.Role.ADMIN);
        createUserIfNotExists("player",  passwordEncoder.encode("player123"),  "老张",    User.Role.MEMBER);
        createUserIfNotExists("visitor", passwordEncoder.encode("visitor123"), "游客",    User.Role.VISITOR);
        System.out.println("Default users initialized.");
    }

    private void createUserIfNotExists(String username, String encodedPassword, String displayName, User.Role role) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(encodedPassword);
            user.setDisplayName(displayName);
            user.setRole(role);
            userRepository.save(user);
        }
    }
}
