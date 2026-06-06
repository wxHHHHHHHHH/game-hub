package com.gamehub.controller;

import com.gamehub.entity.FileEntity;
import com.gamehub.repository.FileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);

    private final FileRepository fileRepository;

    @Value("${gamehub.upload-dir:E:/game-hub/uploads}")
    private String uploadDir;

    public FileController(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    @GetMapping("/files")
    public ResponseEntity<List<Map<String, Object>>> listFiles() {
        List<FileEntity> files = fileRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (FileEntity f : files) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", f.getId());
            m.put("fileName", f.getFileName());
            m.put("originalName", f.getOriginalName());
            m.put("fileSize", f.getFileSize());
            m.put("storedName", f.getStoredName());
            m.put("createdAt", f.getCreatedAt());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/upload/file")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
                                        @RequestParam("label") String label) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "文件为空"));
        }
        if (file.getSize() > 100 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "文件过大，最大100MB"));
        }

        try {
            Path fileDir = Paths.get(uploadDir, "files");
            Files.createDirectories(fileDir);

            String originalName = file.getOriginalFilename();
            String storedName = UUID.randomUUID().toString() + "_" + originalName;
            file.transferTo(fileDir.resolve(storedName).toFile());

            FileEntity entity = new FileEntity();
            entity.setFileName(label);
            entity.setOriginalName(originalName);
            entity.setFileSize(file.getSize());
            entity.setStoredName(storedName);
            entity = fileRepository.save(entity);

            log.info("File saved: id={} label={}", entity.getId(), label);

            return ResponseEntity.ok(Map.of(
                "message", "文件上传成功",
                "fileId", entity.getId(),
                "fileName", label
            ));
        } catch (IOException e) {
            log.error("File upload failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "文件上传失败"));
        }
    }

    @GetMapping("/files/{id}/view")
    public ResponseEntity<?> viewFile(@PathVariable Long id) {
        FileEntity entity = fileRepository.findById(id).orElse(null);
        if (entity == null) return ResponseEntity.notFound().build();

        Path filePath = Paths.get(uploadDir, "files", entity.getStoredName());
        File file = filePath.toFile();
        if (!file.exists()) return ResponseEntity.notFound().build();

        String name = (entity.getOriginalName() != null ? entity.getOriginalName() : "").toLowerCase();
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (name.endsWith(".pdf")) mediaType = MediaType.APPLICATION_PDF;
        else if (name.endsWith(".png")) mediaType = MediaType.IMAGE_PNG;
        else if (name.endsWith(".jpg") || name.endsWith(".jpeg")) mediaType = MediaType.IMAGE_JPEG;
        else if (name.endsWith(".gif")) mediaType = MediaType.IMAGE_GIF;
        else if (name.endsWith(".txt") || name.endsWith(".md")) mediaType = MediaType.TEXT_PLAIN;

        String encoded = URLEncoder.encode(entity.getFileName(), StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encoded)
                .body(new FileSystemResource(file));
    }

    @GetMapping("/files/{id}/download")
    public ResponseEntity<?> downloadFile(@PathVariable Long id) {
        FileEntity entity = fileRepository.findById(id).orElse(null);
        if (entity == null) return ResponseEntity.notFound().build();

        Path filePath = Paths.get(uploadDir, "files", entity.getStoredName());
        File file = filePath.toFile();
        if (!file.exists()) return ResponseEntity.notFound().build();

        String encoded = URLEncoder.encode(entity.getFileName(), StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                .body(new FileSystemResource(file));
    }

    @DeleteMapping("/files/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        FileEntity entity = fileRepository.findById(id).orElse(null);
        if (entity == null) return ResponseEntity.notFound().build();

        Path filePath = Paths.get(uploadDir, "files", entity.getStoredName());
        try { Files.deleteIfExists(filePath); } catch (IOException ignored) {}

        fileRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "文件已删除"));
    }
}
