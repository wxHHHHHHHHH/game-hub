package com.gamehub.controller;

import com.gamehub.entity.Comment;
import com.gamehub.service.CommentService;
import com.gamehub.service.TokenBlacklistService;
import com.gamehub.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;
    private final TokenBlacklistService blacklistService;

    public CommentController(CommentService commentService, TokenBlacklistService blacklistService) {
        this.commentService = commentService;
        this.blacklistService = blacklistService;
    }

    @PostMapping("/videos/{videoId}/comments")
    public ResponseEntity<?> create(@PathVariable Long videoId,
                                    @RequestBody Comment comment,
                                    @RequestAttribute(value = "userId", required = false) Long userId,
                                    HttpServletRequest request) {
        String ip = ClientIpUtil.getClientIp(request);
        if (blacklistService.isRateLimited("comment:" + ip, 10, 60)) {
            return ResponseEntity.status(429).body(Map.of("error", "评论太频繁，请1分钟后再试"));
        }
        if (userId != null) comment.setAuthorId(userId);
        return ResponseEntity.ok(commentService.create(videoId, comment));
    }

    @PostMapping("/comments/{id}/reply")
    public ResponseEntity<?> reply(@PathVariable Long id,
                                   @RequestBody Comment reply,
                                   @RequestAttribute(value = "userId", required = false) Long userId,
                                   HttpServletRequest request) {
        String ip = ClientIpUtil.getClientIp(request);
        if (blacklistService.isRateLimited("comment:" + ip, 10, 60)) {
            return ResponseEntity.status(429).body(Map.of("error", "回复太频繁，请1分钟后再试"));
        }
        if (userId != null) reply.setAuthorId(userId);
        return ResponseEntity.ok(commentService.reply(id, reply));
    }

    @PostMapping("/comments/{id}/like")
    public ResponseEntity<?> likeComment(@PathVariable Long id) {
        Comment c = commentService.likeComment(id);
        return ResponseEntity.ok(Map.of("likes", c.getLikes()));
    }

    @GetMapping("/comments/{id}/replies")
    public ResponseEntity<?> getReplies(@PathVariable Long id,
                                        @RequestParam(defaultValue = "latest") String sort) {
        return ResponseEntity.ok(commentService.getReplies(id, sort));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        commentService.delete(id);
        return ResponseEntity.ok(Map.of("message", "评论已删除"));
    }
}
