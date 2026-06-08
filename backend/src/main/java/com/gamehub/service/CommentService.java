package com.gamehub.service;

import com.gamehub.entity.Comment;
import com.gamehub.entity.User;
import com.gamehub.entity.Video;
import com.gamehub.repository.CommentRepository;
import com.gamehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final VideoService videoService;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, VideoService videoService, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.videoService = videoService;
        this.userRepository = userRepository;
    }

    public Comment create(Long videoId, Comment comment) {
        Video video = videoService.getById(videoId);
        comment.setVideo(video);
        // Set author avatar from user profile
        if (comment.getAuthorId() != null) {
            User user = userRepository.findById(comment.getAuthorId()).orElse(null);
            if (user != null && user.getAvatarUrl() != null) {
                comment.setAuthorAvatarUrl(user.getAvatarUrl());
            }
        }
        return commentRepository.save(comment);
    }

    @Transactional
    public void delete(Long id) {
        commentRepository.deleteById(id);
    }
}
