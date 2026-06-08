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
                .requestMatchers(HttpMethod.GET, "/api/contact/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/photos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/videos/hot-plays").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/files/*").hasRole("ADMIN")
                // Admin news & banner management
                .requestMatchers("/api/news/**").hasRole("ADMIN")
                .requestMatchers("/api/banners/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/photos/**").hasAnyRole("ADMIN", "MEMBER")
                .requestMatchers(HttpMethod.DELETE, "/api/photos/*").hasRole("ADMIN")
                .requestMatchers("/api/contact").hasRole("ADMIN")
                // Authenticated users can like/unlike
                .requestMatchers(HttpMethod.GET, "/api/videos/*/liked").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/videos/*/like", "/api/videos/*/unlike").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/videos/hot-plays").permitAll()
                // Admin only
                .requestMatchers(HttpMethod.DELETE, "/api/videos/*", "/api/comments/*").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/contact/**").hasRole("ADMIN")
                // Member+ can create/edit videos
                .requestMatchers(HttpMethod.POST, "/api/videos").hasAnyRole("ADMIN", "MEMBER")
                .requestMatchers(HttpMethod.PUT, "/api/videos/*").hasAnyRole("ADMIN", "MEMBER")
                .requestMatchers(HttpMethod.POST, "/api/upload/**").hasAnyRole("ADMIN", "MEMBER")
                .requestMatchers(HttpMethod.GET, "/api/comments/*/replies").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/videos/*/comments").hasAnyRole("ADMIN", "MEMBER", "VISITOR")
                .requestMatchers(HttpMethod.POST, "/api/comments/*/reply").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/comments/*/like").authenticated()
                // Everything else needs auth
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
