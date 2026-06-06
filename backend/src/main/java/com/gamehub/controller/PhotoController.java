package com.gamehub.controller;

import com.gamehub.entity.Photo;
import com.gamehub.repository.PhotoRepository;
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
        return ResponseEntity.ok(photoRepo.findAllByOrderByPhotoDateDescCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<Photo> create(@RequestBody Photo photo) {
        return ResponseEntity.ok(photoRepo.save(photo));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam(value = "caption", defaultValue = "") String caption,
                                    @RequestParam(value = "album", defaultValue = "默认相册") String album,
                                    @RequestParam(value = "date", defaultValue = "") String date) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "文件为空"));
        if (file.getSize() > 50 * 1024 * 1024) return ResponseEntity.badRequest().body(Map.of("error", "图片最大50MB"));

        try {
            Path origDir = Paths.get(uploadDir, "photos", "original");
            Path thumbDir = Paths.get(uploadDir, "photos", "thumb");
            Files.createDirectories(origDir);
            Files.createDirectories(thumbDir);

            String ext = ".jpg";
            String origName = file.getOriginalFilename();
            if (origName != null) {
                String low = origName.toLowerCase();
                if (low.endsWith(".png")) ext = ".png";
                else if (low.endsWith(".gif")) ext = ".gif";
                else if (low.endsWith(".webp")) ext = ".webp";
            }
            String name = UUID.randomUUID().toString() + ext;

            // Save original
            Path origPath = origDir.resolve(name);
            file.transferTo(origPath.toFile());

            // Generate thumbnail (max 600px wide, JPEG quality 0.7)
            String thumbName = name.substring(0, name.lastIndexOf('.')) + ".jpg";
            Path thumbPath = thumbDir.resolve(thumbName);
            generateThumbnail(origPath.toFile(), thumbPath.toFile(), 600, 0.7f);

            Photo p = new Photo();
            p.setImageUrl("/uploads/photos/original/" + name);
            p.setThumbnailUrl("/uploads/photos/thumb/" + thumbName);
            p.setCaption(caption);
            p.setAlbum(album);
            if (date != null && !date.isBlank()) {
                try { p.setPhotoDate(java.time.LocalDateTime.parse(date + "T00:00:00")); } catch (Exception ignored) {}
            }
            if (p.getPhotoDate() == null) p.setPhotoDate(java.time.LocalDateTime.now());
            photoRepo.save(p);

            return ResponseEntity.ok(p);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "上传失败: " + e.getMessage()));
        }
    }

    private void generateThumbnail(File src, File dest, int maxWidth, float quality) throws IOException {
        BufferedImage original = ImageIO.read(src);
        if (original == null) {
            // If can't read (e.g. animated GIF), just copy
            Files.copy(src.toPath(), dest.toPath());
            return;
        }

        int w = original.getWidth();
        int h = original.getHeight();
        if (w > maxWidth) {
            h = (int) ((double) h / w * maxWidth);
            w = maxWidth;
        }

        BufferedImage thumb = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = thumb.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(original, 0, 0, w, h, null);
        g.dispose();

        // Compress JPEG
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (writers.hasNext()) {
            ImageWriter writer = writers.next();
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality);
            writer.setOutput(ImageIO.createImageOutputStream(dest));
            writer.write(null, new IIOImage(thumb, null, null), param);
            writer.dispose();
        } else {
            ImageIO.write(thumb, "jpg", dest);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Photo p = photoRepo.findById(id).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();
        deleteFile(p.getImageUrl(), "original");
        deleteFile(p.getThumbnailUrl(), "thumb");
        photoRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "已删除"));
    }

    private void deleteFile(String url, String subdir) {
        if (url == null) return;
        String prefix = "/uploads/photos/" + subdir + "/";
        if (url.startsWith(prefix)) {
            try { Files.deleteIfExists(Paths.get(uploadDir, "photos", subdir, url.substring(prefix.length()))); } catch (IOException ignored) {}
        }
    }
}
