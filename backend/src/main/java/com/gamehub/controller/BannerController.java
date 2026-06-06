package com.gamehub.controller;

import com.gamehub.entity.Banner;
import com.gamehub.repository.BannerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    private final BannerRepository bannerRepo;
    public BannerController(BannerRepository bannerRepo) { this.bannerRepo = bannerRepo; }

    @GetMapping
    public ResponseEntity<List<Banner>> list() {
        return ResponseEntity.ok(bannerRepo.findByActiveTrueOrderBySortOrderAsc());
    }

    @PostMapping
    public ResponseEntity<Banner> create(@RequestBody Banner banner) {
        return ResponseEntity.ok(bannerRepo.save(banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Banner body) {
        Banner b = bannerRepo.findById(id).orElse(null);
        if (b == null) return ResponseEntity.notFound().build();
        b.setTitle(body.getTitle());
        b.setImageUrl(body.getImageUrl());
        b.setLinkUrl(body.getLinkUrl());
        b.setSortOrder(body.getSortOrder());
        b.setActive(body.isActive());
        return ResponseEntity.ok(bannerRepo.save(b));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        bannerRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
