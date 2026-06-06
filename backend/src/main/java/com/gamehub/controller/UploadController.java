package com.gamehub.controller;

import com.gamehub.service.FfmpegService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
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

    @PostMapping("/cover")
    public ResponseEntity<?> uploadCover(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "文件为空"));
        if (file.getSize() > 50 * 1024 * 1024) return ResponseEntity.badRequest().body(Map.of("error", "图片最大50MB"));

        try {
            Path coverDir = Paths.get(uploadDir, "covers");
            Files.createDirectories(coverDir);
            String name = UUID.randomUUID().toString() + ".jpg";

            // Save and compress cover
            Path dest = coverDir.resolve(name);
            BufferedImage original = ImageIO.read(file.getInputStream());
            if (original != null) {
                // Resize to max 640px wide
                int w = original.getWidth(), h = original.getHeight();
                if (w > 640) { h = (int)((double)h / w * 640); w = 640; }
                BufferedImage thumb = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
                Graphics2D g = thumb.createGraphics();
                g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g.drawImage(original, 0, 0, w, h, null);
                g.dispose();

                Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
                if (writers.hasNext()) {
                    ImageWriter writer = writers.next();
                    ImageWriteParam param = writer.getDefaultWriteParam();
                    param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                    param.setCompressionQuality(0.75f);
                    writer.setOutput(ImageIO.createImageOutputStream(dest.toFile()));
                    writer.write(null, new IIOImage(thumb, null, null), param);
                    writer.dispose();
                } else {
                    ImageIO.write(thumb, "jpg", dest.toFile());
                }
            } else {
                file.transferTo(dest.toFile());
            }

            String url = "/uploads/covers/" + name;
            log.info("Cover saved: {}", url);
            return ResponseEntity.ok(Map.of("message", "封面上传成功", "coverUrl", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "上传失败"));
        }
    }
}
