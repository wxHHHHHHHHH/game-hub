package com.gamehub.controller;

import com.gamehub.dto.LoginRequest;
import com.gamehub.dto.LoginResponse;
import com.gamehub.service.TokenBlacklistService;
import com.gamehub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

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
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "未登录"));
        var user = userService.findById(userId);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "用户不存在"));
        return ResponseEntity.ok(Map.of(
            "userId", user.getId(), "username", user.getUsername(),
            "displayName", user.getDisplayName(), "role", user.getRole().name(),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        ));
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file,
                                          @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "文件为空"));
        if (file.getSize() > 50 * 1024 * 1024) return ResponseEntity.badRequest().body(Map.of("error", "头像最大50MB"));

        try {
            Path dir = Paths.get("E:/game-hub/uploads/avatars");
            String prodDir = "/var/gamehub/uploads/avatars";
            try { Files.createDirectories(dir); } catch (Exception e) {
                dir = Paths.get(prodDir); Files.createDirectories(dir);
            }
            String name = userId + "_" + UUID.randomUUID().toString().substring(0, 8) + ".jpg";

            BufferedImage original = ImageIO.read(file.getInputStream());
            if (original != null) {
                int size = Math.min(original.getWidth(), original.getHeight());
                int x = Math.max(0, (original.getWidth() - size) / 2);
                int y = Math.max(0, (original.getHeight() - size) / 2);
                size = Math.min(size, Math.min(original.getWidth() - x, original.getHeight() - y));
                BufferedImage crop = original.getSubimage(x, y, size, size);
                BufferedImage thumb = new BufferedImage(200, 200, BufferedImage.TYPE_INT_RGB);
                Graphics2D g = thumb.createGraphics();
                g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g.drawImage(crop, 0, 0, 200, 200, null);
                g.dispose();
                ImageIO.write(thumb, "jpg", dir.resolve(name).toFile());
            } else {
                file.transferTo(dir.resolve(name).toFile());
            }

            String url = "/uploads/avatars/" + name;
            var user = userService.findById(userId);
            if (user != null) { user.setAvatarUrl(url); userService.save(user); }
            return ResponseEntity.ok(Map.of("message", "头像上传成功", "avatarUrl", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "上传失败"));
        }
    }
}
