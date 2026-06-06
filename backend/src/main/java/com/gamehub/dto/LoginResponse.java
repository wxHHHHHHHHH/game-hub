package com.gamehub.dto;

public class LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private String displayName;
    private String role;
    private String avatarColor;

    public LoginResponse(String token, Long userId, String username, String displayName, String role, String avatarColor) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.role = role;
        this.avatarColor = avatarColor;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getDisplayName() { return displayName; }
    public String getRole() { return role; }
    public String getAvatarColor() { return avatarColor; }
}
