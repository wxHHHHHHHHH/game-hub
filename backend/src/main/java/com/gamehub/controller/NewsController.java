package com.gamehub.controller;

import com.gamehub.entity.News;
import com.gamehub.repository.NewsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsRepository newsRepo;
    public NewsController(NewsRepository newsRepo) { this.newsRepo = newsRepo; }

    @GetMapping
    public ResponseEntity<List<News>> list() {
        return ResponseEntity.ok(newsRepo.findAllByOrderByPinnedDescCreatedAtDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        return newsRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<News> create(@RequestBody News news) {
        return ResponseEntity.ok(newsRepo.save(news));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody News body) {
        News news = newsRepo.findById(id).orElse(null);
        if (news == null) return ResponseEntity.notFound().build();
        news.setTitle(body.getTitle());
        news.setSummary(body.getSummary());
        news.setContent(body.getContent());
        news.setCategory(body.getCategory());
        news.setPinned(body.isPinned());
        news.setImportant(body.isImportant());
        return ResponseEntity.ok(newsRepo.save(news));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        newsRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
