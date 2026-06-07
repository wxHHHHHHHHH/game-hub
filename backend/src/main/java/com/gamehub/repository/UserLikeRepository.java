package com.gamehub.repository;

import com.gamehub.entity.UserLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface UserLikeRepository extends JpaRepository<UserLike, Long> {
    boolean existsByUserIdAndVideoId(Long userId, Long videoId);
    void deleteByUserIdAndVideoId(Long userId, Long videoId);
}
