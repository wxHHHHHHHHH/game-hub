package com.gamehub.service;

import com.gamehub.entity.Video;
import com.gamehub.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    public List<Video> getAll(String sort) {
        if ("hot".equals(sort)) {
            return videoRepository.findAllByOrderByLikesDesc();
        }
        return videoRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Video> getAll() {
        return getAll("latest");
    }

    public Video getById(Long id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("视频不存在"));
    }

    public Video create(Video video) {
        return videoRepository.save(video);
    }

    @Transactional
    public Video like(Long id) {
        Video video = getById(id);
        video.setLikes(video.getLikes() + 1);
        return videoRepository.save(video);
    }

    @Transactional
    public Video unlike(Long id) {
        Video video = getById(id);
        if (video.getLikes() > 0) {
            video.setLikes(video.getLikes() - 1);
        }
        return videoRepository.save(video);
    }

    public void delete(Long id) {
        videoRepository.deleteById(id);
    }
}
