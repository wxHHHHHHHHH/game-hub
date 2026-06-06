package com.gamehub.controller;

import com.gamehub.entity.Comment;
import com.gamehub.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/videos/{videoId}/comments")
    public ResponseEntity<Comment> create(@PathVariable Long videoId,
                                          @RequestBody Comment comment,
                                          @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId != null) {
            comment.setAuthorId(userId);
        }
        return ResponseEntity.ok(commentService.create(videoId, comment));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        commentService.delete(id);
        return ResponseEntity.ok(Map.of("message", "评论已删除"));
    }
}
