package com.gamehub.service;

import com.gamehub.entity.Comment;
import com.gamehub.entity.Video;
import com.gamehub.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final VideoService videoService;

    public CommentService(CommentRepository commentRepository, VideoService videoService) {
        this.commentRepository = commentRepository;
        this.videoService = videoService;
    }

    public Comment create(Long videoId, Comment comment) {
        Video video = videoService.getById(videoId);
        comment.setVideo(video);
        return commentRepository.save(comment);
    }

    @Transactional
    public void delete(Long id) {
        commentRepository.deleteById(id);
    }
}
