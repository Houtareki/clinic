package com.project.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "doctor")
public class Doctor {

    @Id
    @Column(name = "doctor_id")
    private int doctorId;

    @Column(name = "degree")
    private String degree;

    @Column(name = "specialty")
    private String specialty;

    @Column(name = "bio")
    private String bio;


    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id")
    private Account account;
}