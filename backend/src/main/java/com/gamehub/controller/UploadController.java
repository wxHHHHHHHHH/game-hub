package com.gamehub.controller;

import com.gamehub.service.FfmpegService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Logger log = LoggerFactory.getLogger(UploadController.class);

    @Value("${gamehub.upload-dir:E:/game-hub/uploads}")
    private String uploadDir;

    private final FfmpegService ffmpegService;

    public UploadController(FfmpegService ffmpegService) {
        this.ffmpegService = ffmpegService;
    }

    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file,
                                         @RequestAttribute(value = "userId", required = false) Long userId) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "文件为空"));
        }

        // Validate file type
        String originalName = file.getOriginalFilename();
        if (originalName == null || !isVideoFile(originalName)) {
            return ResponseEntity.badRequest().body(Map.of("error", "不支持的视频格式，支持: mp4, mov, avi, mkv, webm, flv"));
        }

        try {
            // Create upload directory
            Path videoDir = Paths.get(uploadDir, "videos", "original");
            Files.createDirectories(videoDir);

            // Save original file with unique name
            String ext = getExtension(originalName);
            String storedName = UUID.randomUUID().toString() + "." + ext;
            Path destPath = videoDir.resolve(storedName);
            file.transferTo(destPath.toFile());

            log.info("Video saved: {}", destPath);

            // Try FFmpeg transcoding
            String videoUrl;
            String videoType;
            String transcodeMsg;

            if (ffmpegService.isFfmpegAvailable()) {
                try {
                    // Use filename hash as video ID for transcoding (real ID comes after Video entity is saved)
                    long tempId = Math.abs(storedName.hashCode());
                    videoUrl = ffmpegService.transcodeToHls(destPath.toString(), tempId);
                    videoType = "LOCAL";
                    transcodeMsg = "视频已上传并转码为 HLS 流";
                    log.info("HLS transcoded: {}", videoUrl);
                } catch (Exception e) {
                    // Fallback to direct file serving
                    videoUrl = "/uploads/videos/original/" + storedName;
                    videoType = "LOCAL";
                    transcodeMsg = "视频已上传（FFmpeg转码失败，使用原始文件）: " + e.getMessage();
                    log.warn("FFmpeg failed, using original: {}", e.getMessage());
                }
            } else {
                videoUrl = "/uploads/videos/original/" + storedName;
                videoType = "LOCAL";
                transcodeMsg = "视频已上传（未安装FFmpeg，使用原始文件）";
            }

            return ResponseEntity.ok(Map.of(
                "message", transcodeMsg,
                "videoType", videoType,
                "videoUrl", videoUrl,
                "originalName", originalName
            ));
        } catch (IOException e) {
            log.error("Upload failed", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "文件上传失败: " + e.getMessage()));
        }
    }

    private boolean isVideoFile(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".avi")
            || lower.endsWith(".mkv") || lower.endsWith(".webm") || lower.endsWith(".flv")
            || lower.endsWith(".wmv") || lower.endsWith(".m4v");
    }

    private String getExtension(String filename) {
        int i = filename.lastIndexOf('.');
        return i > 0 ? filename.substring(i + 1).toLowerCase() : "mp4";
    }
}
