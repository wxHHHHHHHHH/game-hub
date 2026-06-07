package com.gamehub.controller;

import com.gamehub.dto.LoginRequest;
import com.gamehub.dto.LoginResponse;
import com.gamehub.service.TokenBlacklistService;
import com.gamehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final TokenBlacklistService blacklistService;

    public AuthController(UserService userService, TokenBlacklistService blacklistService) {
        this.userService = userService;
        this.blacklistService = blacklistService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest req) {
        // Rate limit: 10 attempts per minute per IP
        String ip = req.getRemoteAddr();
        if (blacklistService.isRateLimited("login:" + ip, 10, 60)) {
            return ResponseEntity.status(429).body(Map.of("error", "登录过于频繁，请1分钟后再试"));
        }

        try {
            LoginResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            blacklistService.blacklist(token);
        }
        return ResponseEntity.ok(Map.of("message", "已退出登录"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        }
        var user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "用户不存在"));
        }
        return ResponseEntity.ok(Map.of(
            "userId", user.getId(),
            "username", user.getUsername(),
            "displayName", user.getDisplayName(),
            "role", user.getRole().name()
        ));
    }
}
