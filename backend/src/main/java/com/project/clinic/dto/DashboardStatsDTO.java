package com.project.clinic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long patientsToday;
    private long shiftsToday;

    private long totalDoctors;
    private long newPatientsToday;
    private long totalShiftsToday;
    private long totalAppointmentsToday;

    private long myShiftsToday;
    private long myAppointmentsToday;
    private long myPendingAppointments;
    private long myCompletedAppointments;
}
