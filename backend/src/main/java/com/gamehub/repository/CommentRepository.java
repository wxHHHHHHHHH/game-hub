package com.gamehub.repository;

import com.gamehub.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByVideoIdOrderByCreatedAtDesc(Long videoId);
    void deleteByVideoId(Long videoId);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    List<Comment> findByParentIdOrderByLikesDesc(Long parentId);
    void deleteByParentId(Long parentId);
}
