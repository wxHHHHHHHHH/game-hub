package com.gamehub.controller;

import com.gamehub.entity.UserLike;
import com.gamehub.entity.Video;
import com.gamehub.repository.UserLikeRepository;
import com.gamehub.repository.VideoRepository;
import com.gamehub.service.VideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoService videoService;
    private final VideoRepository videoRepo;
    private final UserLikeRepository userLikeRepo;

    public VideoController(VideoService videoService, VideoRepository videoRepo, UserLikeRepository userLikeRepo) {
        this.videoService = videoService;
        this.videoRepo = videoRepo;
        this.userLikeRepo = userLikeRepo;
    }

    @GetMapping
    public ResponseEntity<List<Video>> list(@RequestParam(defaultValue = "latest") String sort,
                                            @RequestParam(required = false) String search,
                                            @RequestParam(required = false) String type) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(videoRepo.searchByKeyword(search.trim()));
        }
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(videoRepo.findByVideoTypeOrderByCreatedAtDesc(type));
        }
        return ResponseEntity.ok(videoService.getAll(sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Video> detail(@PathVariable Long id) {
        Video v = videoService.getById(id);
        v.setPlayCount(v.getPlayCount() + 1);
        videoRepo.save(v);
        return ResponseEntity.ok(v);
    }

    @GetMapping("/hot-plays")
    public ResponseEntity<List<Video>> hotPlays() {
        return ResponseEntity.ok(videoRepo.findTop10ByOrderByPlayCountDesc());
    }

    @PostMapping
    public ResponseEntity<Video> create(@RequestBody Video video,
                                        @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId != null) video.setUploaderId(userId);
        return ResponseEntity.ok(videoService.create(video));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Video body) {
        Video v = videoService.getById(id);
        v.setTitle(body.getTitle());
        v.setDescription(body.getDescription());
        v.setThumbnailUrl(body.getThumbnailUrl());
        v.setGame(body.getGame());
        return ResponseEntity.ok(videoRepo.save(v));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> like(@PathVariable Long id,
                                                     @RequestAttribute(value = "userId") Long userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
        if (userLikeRepo.existsByUserIdAndVideoId(userId, id)) {
            return ResponseEntity.ok(Map.of("likes", videoService.getById(id).getLikes(), "message", "已经点赞过"));
        }
        userLikeRepo.save(new UserLike(userId, id));
        Video v = videoService.like(id);
        return ResponseEntity.ok(Map.of("likes", v.getLikes(), "message", "点赞成功"));
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<Map<String, Object>> unlike(@PathVariable Long id,
                                                       @RequestAttribute(value = "userId") Long userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
        videoService.unlikeWithUser(userId, id);
        return ResponseEntity.ok(Map.of("likes", videoService.getById(id).getLikes(), "message", "取消点赞"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        videoService.delete(id);
        return ResponseEntity.ok(Map.of("message", "视频已删除"));
    }

    // Check if current user liked a video
    @GetMapping("/{id}/liked")
    public ResponseEntity<Map<String, Boolean>> isLiked(@PathVariable Long id,
                                                         @RequestAttribute(value = "userId", required = false) Long userId) {
        boolean liked = userId != null && userLikeRepo.existsByUserIdAndVideoId(userId, id);
        return ResponseEntity.ok(Map.of("liked", liked));
    }
}
