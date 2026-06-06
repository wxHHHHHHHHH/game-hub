package com.gamehub.controller;

import com.gamehub.entity.Video;
import com.gamehub.service.VideoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    public ResponseEntity<List<Video>> list(@RequestParam(defaultValue = "latest") String sort) {
        return ResponseEntity.ok(videoService.getAll(sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Video> detail(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Video> create(@RequestBody Video video,
                                        @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId != null) {
            video.setUploaderId(userId);
        }
        return ResponseEntity.ok(videoService.create(video));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> like(@PathVariable Long id) {
        Video video = videoService.like(id);
        return ResponseEntity.ok(Map.of("likes", video.getLikes(), "message", "点赞成功"));
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<Map<String, Object>> unlike(@PathVariable Long id) {
        Video video = videoService.unlike(id);
        return ResponseEntity.ok(Map.of("likes", video.getLikes(), "message", "取消点赞"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        videoService.delete(id);
        return ResponseEntity.ok(Map.of("message", "视频已删除"));
    }
}
