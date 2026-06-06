package com.gamehub.controller;

import com.gamehub.entity.ContactInfo;
import com.gamehub.repository.ContactInfoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactInfoRepository repo;
    public ContactController(ContactInfoRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<ContactInfo> get() {
        ContactInfo c = repo.findById(1L).orElse(new ContactInfo());
        repo.save(c);
        return ResponseEntity.ok(c);
    }

    @PutMapping
    public ResponseEntity<?> update(@RequestBody ContactInfo body) {
        ContactInfo c = repo.findById(1L).orElse(new ContactInfo());
        c.setAddress(body.getAddress());
        c.setPhone(body.getPhone());
        c.setFax(body.getFax());
        c.setEmail(body.getEmail());
        c.setHrEmail(body.getHrEmail());
        c.setWorkHours(body.getWorkHours());
        c.setMapUrl(body.getMapUrl());
        repo.save(c);
        return ResponseEntity.ok(Map.of("message", "联系信息已更新"));
    }
}
