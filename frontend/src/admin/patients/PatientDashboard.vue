<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-items-center mb-3">
      <h2 class="me-3">Welcome, {{ patient.name || 'Loading...' }}</h2>
      <small class="text-muted">Manage your appointments and medical history</small>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Departments -->
    <div v-if="!loading" class="row g-4">
      <div class="col-lg-4 w-100">
        <div class="card card-outline shadow-sm">
          <div class="card-body">
            <div class="section-header mb-3">
              <h5 class="mb-0">Departments</h5>
            </div>
            <ul class="list-group">
              <li
                v-for="department in departments"
                :key="department.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>{{ department.name }}</div>
                <div>
                  <router-link
                    :to="{ name: 'DepartmentView', params: { id: department.id } }"
                    class="btn btn-sm btn-outline-primary"
                  >
                    View
                  </router-link>
                </div>
              </li>
              <li v-if="departments.length === 0" class="list-group-item text-muted">
                No departments yet
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Appointments -->
    <div v-if="!loading" class="card card-outline shadow-sm mt-4">
      <div class="card-body">
        <div class="section-header mb-3">
          <h5 class="mb-0">Upcoming Appointments</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Doctor Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(appt, index) in upcomingAppointments" :key="appt.id">
                <td>{{ index + 1 }}</td>
                <td>{{ getDoctorName(appt.doctor_id) }}</td>
                <td>{{ getDoctorSpecialization(appt.doctor_id) }}</td>
                <td>{{ appt.date }}</td>
                <td>{{ appt.time }}</td>
                <td>
                  <button
                    @click="cancelAppointment(appt.id)"
                    class="btn btn-sm btn-outline-danger"
                    :disabled="cancellingId === appt.id"
                  >
                    {{ cancellingId === appt.id ? "Cancelling..." : "Cancel" }}
                  </button>
                </td>
              </tr>
              <tr v-if="upcomingAppointments.length === 0">
                <td colspan="6" class="text-center text-muted">No upcoming appointments found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PatientDashboard",
  props: {
    id: {
      type: [String, Number],
      required: false,
    },
  },
  data() {
    return {
      patient: {},
      departments: [],
      appointments: [],
      doctors: [],
      loading: false,
      error: null,
      cancellingId: null,
    };
  },

  computed: {
    upcomingAppointments() {
      const today = new Date().toISOString().split("T")[0];
      return this.appointments.filter((appt) => {
        const apptDate = appt.date || appt.appointment_date || "";
        return apptDate >= today;
      });
    },
  },

  async mounted() {
    const patientId =
      this.id ||
      JSON.parse(localStorage.getItem("user_info") || "{}").patient_id;

    if (patientId) {
      await this.fetchDashboard(patientId);
    } else {
      this.error = "Patient ID not found. Please log in again.";
      this.$router.push("/login");
    }
  },

  methods: {
    async fetchDashboard(patientId) {
      this.loading = true;
      this.error = null;

      const token = localStorage.getItem("access_token");
      if (!token) {
        this.error = "Session expired. Please log in again.";
        this.loading = false;
        this.$router.push("/login");
        return;
      }

      try {
        const res = await axios.get(
          `http://127.0.0.1:5000/patient/patient_dashboard/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Dashboard response:", res.data);

        this.patient      = res.data.patient      || {};
        this.departments  = res.data.departments  || [];
        this.doctors      = res.data.doctors      || [];

        this.appointments =
          res.data.appointments ||
          res.data.upcoming_appointments ||
          [];

      } catch (err) {
        if (err.response?.status === 401) {
          this.error = "Session expired. Please log in again.";
          this.$router.push("/login");
        } else if (err.response?.status === 403) {
          this.error = "You do not have permission to view this page.";
        } else {
          this.error = err.response?.data?.message || "Failed to load dashboard.";
        }
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    getDoctorName(doctorId) {
      const doctor = this.doctors.find(
        (d) => String(d.id) === String(doctorId)
      );
      return doctor ? doctor.name : "Unknown";
    },

    getDoctorSpecialization(doctorId) {
      const doctor = this.doctors.find(
        (d) => String(d.id) === String(doctorId)
      );
      return doctor
        ? doctor.specialization || doctor.department || "Unknown"
        : "Unknown";
    },

    async cancelAppointment(id) {
      if (!confirm("Are you sure you want to cancel this appointment?")) return;
      this.cancellingId = id;
      try {
        const token = localStorage.getItem("access_token");
        await axios.patch(
          `http://127.0.0.1:5000/cancel_appointment/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.appointments = this.appointments.filter((appt) => appt.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to cancel appointment.";
        console.error(err);
      } finally {
        this.cancellingId = null;
      }
    },
  },
};
</script>