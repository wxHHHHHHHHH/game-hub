package com.gamehub.controller;

import com.gamehub.entity.User;
import com.gamehub.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userService.listAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(Map.of(
            "userCount", userService.count()
        ));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String password = body.get("password");
            String displayName = body.get("displayName");
            String role = body.get("role");

            if (username == null || username.isBlank()) throw new RuntimeException("用户名不能为空");
            if (password == null || password.isBlank()) throw new RuntimeException("密码不能为空");
            if (displayName == null || displayName.isBlank()) throw new RuntimeException("显示名不能为空");
            if (role == null || role.isBlank()) throw new RuntimeException("角色不能为空");

            User user = userService.createUser(username.trim(), password, displayName.trim(), role.toUpperCase());
            return ResponseEntity.ok(Map.of(
                "message", "用户创建成功",
                "userId", user.getId(),
                "username", user.getUsername(),
                "displayName", user.getDisplayName(),
                "role", user.getRole().name()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String role = body.get("role");
            if (role == null || role.isBlank()) throw new RuntimeException("角色不能为空");
            User user = userService.updateUserRole(id, role.toUpperCase());
            return ResponseEntity.ok(Map.of(
                "message", "角色更新成功",
                "userId", user.getId(),
                "role", user.getRole().name()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "用户已删除"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
