package com.gamehub.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {

    private final StringRedisTemplate redis;
    private static final String PREFIX = "blacklist:";
    private static final long DEFAULT_TTL = 7 * 24 * 3600; // 7 days

    public TokenBlacklistService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void blacklist(String token, long ttlSeconds) {
        redis.opsForValue().set(PREFIX + token, "1", ttlSeconds, TimeUnit.SECONDS);
    }

    public void blacklist(String token) {
        blacklist(token, DEFAULT_TTL);
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redis.hasKey(PREFIX + token));
    }

    // Rate limiting: max attempts per key in window seconds
    public boolean isRateLimited(String key, int maxAttempts, int windowSeconds) {
        String rk = "ratelimit:" + key;
        Long count = redis.opsForValue().increment(rk);
        if (count != null && count == 1) {
            redis.expire(rk, windowSeconds, TimeUnit.SECONDS);
        }
        return count != null && count > maxAttempts;
    }
}
