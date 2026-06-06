package com.gamehub.controller;

import com.gamehub.entity.Photo;
import com.gamehub.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoRepository photoRepo;

    @Value("${gamehub.upload-dir:E:/game-hub/uploads}")
    private String uploadDir;

    public PhotoController(PhotoRepository photoRepo) { this.photoRepo = photoRepo; }

    @GetMapping
    public ResponseEntity<List<Photo>> list() {
        return ResponseEntity.ok(photoRepo.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<Photo> create(@RequestBody Photo photo) {
        return ResponseEntity.ok(photoRepo.save(photo));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam(value = "caption", defaultValue = "") String caption,
                                    @RequestParam(value = "album", defaultValue = "默认相册") String album) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "文件为空"));
        if (file.getSize() > 50 * 1024 * 1024) return ResponseEntity.badRequest().body(Map.of("error", "图片最大50MB"));

        try {
            Path dir = Paths.get(uploadDir, "photos");
            Files.createDirectories(dir);
            String ext = file.getOriginalFilename() != null
                ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.')) : ".jpg";
            String name = UUID.randomUUID().toString() + ext;
            file.transferTo(dir.resolve(name).toFile());

            Photo p = new Photo();
            p.setImageUrl("/uploads/photos/" + name);
            p.setCaption(caption);
            p.setAlbum(album);
            photoRepo.save(p);

            return ResponseEntity.ok(p);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "上传失败"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Photo p = photoRepo.findById(id).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();
        if (p.getImageUrl() != null && p.getImageUrl().startsWith("/uploads/photos/")) {
            try { Files.deleteIfExists(Paths.get(uploadDir, "photos", p.getImageUrl().substring("/uploads/photos/".length()))); } catch (IOException ignored) {}
        }
        photoRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "已删除"));
    }
}
