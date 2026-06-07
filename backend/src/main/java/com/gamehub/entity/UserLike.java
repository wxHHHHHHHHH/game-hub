package com.gamehub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_likes", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "video_id"}))
public class UserLike {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "video_id", nullable = false)
    private Long videoId;

    public UserLike() {}
    public UserLike(Long userId, Long videoId) { this.userId = userId; this.videoId = videoId; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getVideoId() { return videoId; }
    public void setVideoId(Long videoId) { this.videoId = videoId; }
}
