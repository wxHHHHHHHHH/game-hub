package com.gamehub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FfmpegService {

    private static final Logger log = LoggerFactory.getLogger(FfmpegService.class);

    @Value("${gamehub.upload-dir:E:/game-hub/uploads}")
    private String uploadDir;

    private Boolean ffmpegAvailable = null;

    public boolean isFfmpegAvailable() {
        if (ffmpegAvailable == null) {
            try {
                Process p = new ProcessBuilder("ffmpeg", "-version").start();
                int exitCode = p.waitFor();
                ffmpegAvailable = exitCode == 0;
            } catch (Exception e) {
                ffmpegAvailable = false;
            }
            log.info("FFmpeg available: {}", ffmpegAvailable);
        }
        return ffmpegAvailable;
    }

    /**
     * Transcode uploaded video to HLS (m3u8 + ts segments).
     * Returns the relative path to the m3u8 playlist.
     */
    public String transcodeToHls(String originalFilePath, Long videoId) throws IOException, InterruptedException {
        if (!isFfmpegAvailable()) {
            throw new RuntimeException("FFmpeg 未安装，无法转码。请安装 FFmpeg 后重试。");
        }

        String hlsDirName = "hls_" + videoId + "_" + UUID.randomUUID().toString().substring(0, 8);
        Path hlsDir = Paths.get(uploadDir, "videos", "hls", hlsDirName);
        Files.createDirectories(hlsDir);

        String playlistPath = hlsDir.resolve("index.m3u8").toString().replace("\\", "/");
        String segmentPattern = hlsDir.resolve("segment_%03d.ts").toString().replace("\\", "/");

        // FFmpeg command: input -> HLS output
        // -c:v libx264: H.264 video codec
        // -c:a aac: AAC audio codec
        // -hls_time 10: each TS segment is ~10 seconds
        // -hls_list_size 0: include all segments in playlist
        // -hls_segment_filename: pattern for segment files
        ProcessBuilder pb = new ProcessBuilder(
            "ffmpeg",
            "-i", originalFilePath,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",
            "-b:a", "128k",
            "-hls_time", "10",
            "-hls_list_size", "0",
            "-hls_segment_filename", segmentPattern,
            "-hls_playlist_type", "vod",
            "-vf", "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease",
            playlistPath
        );

        log.info("Running FFmpeg: {}", String.join(" ", pb.command()));
        Process process = pb.start();

        // Read stderr for progress
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                log.debug("FFmpeg: {}", line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg 转码失败，退出码: " + exitCode);
        }

        // Verify playlist exists
        if (!Files.exists(Paths.get(playlistPath))) {
            throw new RuntimeException("HLS playlist 未生成");
        }

        // Return relative path for serving
        return "/uploads/videos/hls/" + hlsDirName + "/index.m3u8";
    }
}
