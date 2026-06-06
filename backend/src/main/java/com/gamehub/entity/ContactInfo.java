package com.gamehub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "contact_info")
public class ContactInfo {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id = 1L;

    @Column(length = 500)
    private String address = "中国·北京市朝阳区建国路88号 波比集团大厦";

    @Column(length = 200)
    private String phone = "010-8888-6666";

    @Column(length = 200)
    private String fax = "010-8888-6667";

    @Column(length = 200)
    private String email = "info@bobigroup.cn";

    @Column(length = 200)
    private String hrEmail = "hr@bobigroup.cn";

    @Column(length = 200)
    private String workHours = "周一至周五 9:00-18:00  周六 9:00-12:00";

    @Column(length = 500)
    private String mapUrl = "https://map.baidu.com/";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getFax() { return fax; }
    public void setFax(String fax) { this.fax = fax; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getHrEmail() { return hrEmail; }
    public void setHrEmail(String hrEmail) { this.hrEmail = hrEmail; }
    public String getWorkHours() { return workHours; }
    public void setWorkHours(String workHours) { this.workHours = workHours; }
    public String getMapUrl() { return mapUrl; }
    public void setMapUrl(String mapUrl) { this.mapUrl = mapUrl; }
}
