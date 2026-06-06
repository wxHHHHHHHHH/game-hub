package com.gamehub.service;

import com.gamehub.entity.AuditLog;
import com.gamehub.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditRepo;
    public AuditLogService(AuditLogRepository auditRepo) { this.auditRepo = auditRepo; }

    public void log(String action, String username, String detail) {
        AuditLog a = new AuditLog();
        a.setAction(action);
        a.setUsername(username);
        a.setDetail(detail);
        auditRepo.save(a);
    }
}
