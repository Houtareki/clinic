package com.project.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medicalrecord")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private int recordId;

    @ManyToOne
    @JoinColumn(name = "doctor_id", referencedColumnName = "account_id")
    private Account doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;


    @ManyToOne
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "examined_at")
    private LocalDateTime examinedAt;
}
