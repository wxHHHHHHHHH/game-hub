package com.gamehub.repository;

import com.gamehub.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findAllByOrderByCreatedAtDesc();
    List<Video> findAllByOrderByLikesDesc();

    @Query("SELECT v FROM Video v WHERE LOWER(v.title) LIKE LOWER(CONCAT('%',:kw,'%')) OR LOWER(v.game) LIKE LOWER(CONCAT('%',:kw,'%')) ORDER BY v.createdAt DESC")
    List<Video> searchByKeyword(@Param("kw") String keyword);

    // play count ranking
    List<Video> findTop10ByOrderByPlayCountDesc();
}
