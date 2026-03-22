<template>
  <div class="dashboard-container">
    <div v-if="loading" class="text-center mt-5">
      <span class="spinner-border"></span> Loading...
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger mt-4">
      {{ errorMessage }}
    </div>

    <template v-else-if="doctor">
      <div class="d-flex align-items-center mb-3">
        <h2 class="me-3">Welcome, {{ doctor.name }}</h2>
        <small class="text-muted">Manage your appointments and medical history</small>
      </div>

      <!-- Upcoming Appointments -->
      <div class="mb-5">
        <h5>Upcoming Appointments</h5>
        <table class="table table-bordered table-hover bg-white">
          <thead class="table-secondary">
            <tr>
              <th>Sr No.</th>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Visit Type</th>
              <th>Status</th>
              <th>Patient History</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appt in bookedAppointments" :key="appt.id">
              <td>{{ appt.id }}</td>
              <td>{{ appt.patient_name }}</td>
              <td>{{ appt.date }}</td>
              <td>{{ appt.time }}</td>
              <td>{{ appt.type }}</td>
              <td>
                <span v-if="appt.status === 'Completed'" class="badge bg-success">Completed</span>
                <span v-else-if="appt.status === 'Cancelled'" class="badge bg-danger">Cancelled</span>
                <span v-else class="badge bg-secondary">{{ appt.status }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-warning"
                        @click="updateHistory(appt.id)"
                        :disabled="appt.status === 'Completed' || appt.status === 'Cancelled'">
                  Update
                </button>
              </td>
              <td>
                <div>
                  <button class="btn btn-sm btn-outline-success"
                          @click="markCompleted(appt.id)"
                          :disabled="appt.status === 'Cancelled' || appt.status === 'Completed'">
                    Mark as Complete
                  </button>
                  <button class="btn btn-sm btn-outline-danger"
                          @click="cancelAppointment(appt.id)"
                          :disabled="appt.status === 'Completed' || appt.status === 'Cancelled'">
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="bookedAppointments.length === 0">
              <td colspan="8" class="text-muted text-center">No upcoming appointments.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Assigned Patients -->
      <div class="mb-5">
        <h5>Assigned Patients</h5>
        <table class="table table-bordered table-hover bg-white">
          <thead class="table-secondary">
            <tr>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Date of Birth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pat in patients" :key="pat.id">
              <td>{{ pat.id }}</td>
              <td>{{ pat.name }}</td>
              <td>{{ pat.dob }}</td>
              <td>
                <button class="btn btn-sm btn-info" @click="viewHistory(doctor.user_id, pat.id)">
                  View History
                </button>
              </td>
            </tr>
            <tr v-if="patients.length === 0">
              <td colspan="4" class="text-muted text-center">No assigned patients.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Provide Availability -->
      <div class="text-end">
        <button class="btn btn-success" @click="provideAvailability(doctor.id)">
          Provide Availability
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DoctorsDashboard",
  data() {
    return {
      doctor: null,
      appointments: [],
      patients: [],
      loading: true,
      errorMessage: ""
    };
  },
  async mounted() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      this.$router.push("/login");
      return;
    }
    try {
      const id = this.$route.params.id;
      const res = await axios.get(`http://127.0.0.1:5000/doctors/doctors_dashboard/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.doctor = res.data.doctor;
      this.appointments = res.data.appointments;
      this.patients = res.data.patients;
    } catch (err) {
      this.errorMessage = "Failed to load dashboard.";
    } finally {
      this.loading = false;
    }
  },
  computed: {
    bookedAppointments() {
      return this.appointments.map(appt => {
        const patient = this.patients.find(p => p.user_id === appt.patient_id || p.id === appt.patient_id);
        return { ...appt, patient_name: patient ? patient.name : "Unknown" };
      });
    }
  },
  methods: {
    updateHistory(appointmentId) {
      this.$router.push(`/doctors/update_history/${appointmentId}`);
    },
    async markCompleted(appointmentId) {
      const token = localStorage.getItem("access_token");
      try {
        const res = await axios.patch(
          `http://127.0.0.1:5000/mark_completed/${appointmentId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(res.data.message);
        this.appointments = this.appointments.map(appt =>
          appt.id === appointmentId ? { ...appt, status: "Completed" } : appt
        );
      } catch {
        alert("Failed to mark appointment as completed.");
      }
    },
    async cancelAppointment(appointmentId) {
      const token = localStorage.getItem("access_token");
      try {
        const res = await axios.patch(
          `http://127.0.0.1:5000/appointment_cancelled/${appointmentId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(res.data.message);
        this.appointments = this.appointments.map(appt =>
          appt.id === appointmentId ? { ...appt, status: "Cancelled" } : appt
        );
      } catch {
        alert("Failed to cancel appointment.");
      }
    },
    viewHistory(doctorId, patientId) {
      this.$router.push({ name: "PatientHistoryDoctor", params: { doctorId, patientId } });
    },
    provideAvailability(doctorId) {
      this.$router.push({ name: "DoctorsAvailability", params: { id: doctorId } });
    }
  }
};
</script>
