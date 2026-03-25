async function loadDashboardData (){
    const totalDoctors = document.getElementById("total-doctors-stat");
    const todayPatients = document.getElementById("today-patients-stat");
    const todayShifts = document.getElementById("today-shifts-stat");
    const satisfaction = document.getElementById("satisfaction-stat");

    if (!totalDoctors) return;

    totalDoctors.innerText = "24";
    todayPatients.innerText = "150";
    todayShifts.innerText = "8";
    satisfaction.innerText = "99%";
}