package com.gamehub.service;

import com.gamehub.dto.LoginRequest;
import com.gamehub.dto.LoginResponse;
import com.gamehub.entity.User;
import com.gamehub.repository.UserRepository;
import com.gamehub.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public static final String[] AVATAR_COLORS = {
        "#ff00e5", "#4d96ff", "#6a6a8a", "#ff6b6b", "#ffd93d",
        "#6bcb77", "#ff6b9d", "#c44dff", "#00d2ff", "#ff9f43"
    };

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        String avatarColor = AVATAR_COLORS[Math.abs(user.getUsername().hashCode()) % AVATAR_COLORS.length];

        return new LoginResponse(
                token, user.getId(), user.getUsername(),
                user.getDisplayName(), user.getRole().name(), avatarColor);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // Admin operations
    public List<User> listAll() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(String username, String password, String displayName, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("用户名已存在: " + username);
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setDisplayName(displayName);
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        if ("admin".equals(user.getUsername())) {
            throw new RuntimeException("不能删除内置管理员账号");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public User updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        if ("admin".equals(user.getUsername())) {
            throw new RuntimeException("不能修改内置管理员角色");
        }
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        return userRepository.save(user);
    }

    public long count() { return userRepository.count(); }
    public User save(User user) { return userRepository.save(user); }
}
