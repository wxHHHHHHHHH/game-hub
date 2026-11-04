package com.gamehub.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 获取真实客户端 IP。
 * 后端经 nginx 反代时，getRemoteAddr() 拿到的是 nginx 地址（127.0.0.1），
 * 需优先取 nginx 透传的 X-Forwarded-For / X-Real-IP。
 */
public final class ClientIpUtil {

    private ClientIpUtil() {}

    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            // X-Forwarded-For 可能是逗号分隔的链: "client, proxy1, proxy2"，取第一个
            int idx = ip.indexOf(',');
            return (idx > 0 ? ip.substring(0, idx) : ip).trim();
        }
        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.trim();
        }
        return request.getRemoteAddr();
    }
}
