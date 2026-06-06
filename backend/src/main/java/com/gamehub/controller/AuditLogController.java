package com.gamehub.controller;

import com.gamehub.repository.AuditLogRepository;
import com.gamehub.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AuditLogController {

    private final AuditLogRepository auditRepo;
    private final AuditLogService auditService;

    public AuditLogController(AuditLogRepository auditRepo, AuditLogService auditService) {
        this.auditRepo = auditRepo;
        this.auditService = auditService;
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs() {
        return ResponseEntity.ok(auditRepo.findTop50ByOrderByCreatedAtDesc());
    }

    @PostMapping("/logs")
    public ResponseEntity<?> addLog(@RequestBody Map<String, String> body,
                                    @RequestAttribute(value = "userRole", required = false) String role,
                                    @RequestAttribute(value = "userId", required = false) Long userId) {
        // This is called by frontend after admin actions
        auditService.log(body.get("action"), body.get("username"), body.get("detail"));
        return ResponseEntity.ok(Map.of("message", "ok"));
    }
}
