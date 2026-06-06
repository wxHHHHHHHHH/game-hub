package com.gamehub.controller;

import com.gamehub.entity.Video;
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

    public VideoController(VideoService videoService, VideoRepository videoRepo) {
        this.videoService = videoService;
        this.videoRepo = videoRepo;
    }

    @GetMapping
    public ResponseEntity<List<Video>> list(@RequestParam(defaultValue = "latest") String sort,
                                            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(videoRepo.searchByKeyword(search.trim()));
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
    public ResponseEntity<Map<String, Object>> like(@PathVariable Long id) {
        Video v = videoService.like(id);
        return ResponseEntity.ok(Map.of("likes", v.getLikes(), "message", "点赞成功"));
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<Map<String, Object>> unlike(@PathVariable Long id) {
        Video v = videoService.unlike(id);
        return ResponseEntity.ok(Map.of("likes", v.getLikes(), "message", "取消点赞"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        videoService.delete(id);
        return ResponseEntity.ok(Map.of("message", "视频已删除"));
    }
}
