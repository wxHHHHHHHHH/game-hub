package com.gamehub.service;

import com.gamehub.entity.Comment;
import com.gamehub.entity.User;
import com.gamehub.entity.Video;
import com.gamehub.repository.CommentRepository;
import com.gamehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        setAvatar(comment);
        return commentRepository.save(comment);
    }

    public Comment reply(Long parentId, Comment reply) {
        Comment parent = commentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("父评论不存在"));
        reply.setVideo(parent.getVideo());
        reply.setParentId(parentId);
        setAvatar(reply);
        return commentRepository.save(reply);
    }

    public List<Comment> getReplies(Long parentId, String sort) {
        if ("hot".equals(sort)) {
            return commentRepository.findByParentIdOrderByLikesDesc(parentId);
        }
        return commentRepository.findByParentIdOrderByCreatedAtAsc(parentId);
    }

    @Transactional
    public Comment likeComment(Long id) {
        Comment c = commentRepository.findById(id).orElseThrow(() -> new RuntimeException("评论不存在"));
        c.setLikes(c.getLikes() + 1);
        return commentRepository.save(c);
    }

    @Transactional
    public void delete(Long id) {
        // Also delete replies
        commentRepository.deleteByParentId(id);
        commentRepository.deleteById(id);
    }

    private void setAvatar(Comment comment) {
        if (comment.getAuthorId() != null) {
            User user = userRepository.findById(comment.getAuthorId()).orElse(null);
            if (user != null && user.getAvatarUrl() != null) {
                comment.setAuthorAvatarUrl(user.getAvatarUrl());
            }
        }
    }
}
