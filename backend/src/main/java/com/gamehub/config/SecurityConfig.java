package com.gamehub.config;

import com.gamehub.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/videos", "/api/videos/*").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/news/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/banners/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/files/*").hasRole("ADMIN")
                // Admin news & banner management
                .requestMatchers("/api/news/**").hasRole("ADMIN")
                .requestMatchers("/api/banners/**").hasRole("ADMIN")
                // Authenticated users can like/unlike
                .requestMatchers(HttpMethod.POST, "/api/videos/*/like", "/api/videos/*/unlike").authenticated()
                // Admin only
                .requestMatchers(HttpMethod.DELETE, "/api/videos/*", "/api/comments/*").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Member+ can create videos
                .requestMatchers(HttpMethod.POST, "/api/videos").hasAnyRole("ADMIN", "MEMBER")
                .requestMatchers(HttpMethod.POST, "/api/upload/**").hasAnyRole("ADMIN", "MEMBER")
                .requestMatchers(HttpMethod.POST, "/api/videos/*/comments").hasAnyRole("ADMIN", "MEMBER", "VISITOR")
                // Everything else needs auth
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
