package com.gamehub.repository;

import com.gamehub.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findAllByOrderByPinnedDescCreatedAtDesc();
}
