<template>
  <div class="container py-4">

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2 text-muted">Loading appointment...</p>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Content -->
    <div v-if="!loading && appointment.id">
      <h2 class="mb-3">Cancel Appointment</h2>
      <hr />

      <form @submit.prevent="confirmCancellation">

        <!-- Doctor -->
        <label class="form-label">Doctor Name:</label>
        <input class="form-control" type="text" v-model="doctor.name" readonly />
        <br />

        <!-- Department -->
        <label class="form-label">Department:</label>
        <input class="form-control" type="text" v-model="department.name" readonly />
        <br />

        <!-- Date -->
        <label class="form-label">Date:</label>
        <input class="form-control" type="text" v-model="appointment.date" readonly />
        <br />

        <!-- Time -->
        <label class="form-label">Time:</label>
        <input class="form-control" type="text" v-model="appointment.time" readonly />
        <br />

        <!-- Type -->
        <label class="form-label">Type:</label>
        <input class="form-control" type="text" v-model="appointment.type" readonly />
        <br />

        <hr />

        <p class="fw-bold text-danger">
          Are you sure you want to cancel this appointment?
        </p>

        <!-- Buttons -->
        <button type="submit" class="btn btn-danger me-2" :disabled="loading">
          Confirm Cancellation
        </button>

        <button type="button" class="btn btn-secondary" @click="goBack">
          Go Back
        </button>

      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CancelAppointment",

  data() {
    return {
      user: {},
      doctor: {},
      department: {},
      appointment: {},
      patient: {},
      loading: false,
      errorMessage: ""
    };
  },

  async mounted() {
    await this.fetchAppointment();
  },

  methods: {
    // ✅ Get token
    getToken() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        this.$router.push("/login");
        return null;
      }
      return token;
    },

    // ✅ Fetch appointment details
    async fetchAppointment() {
      this.loading = true;
      this.errorMessage = "";

      const token = this.getToken();
      if (!token) return;

      try {
        const appointmentId = this.$route.params.id;

        const res = await axios.get(
          `http://127.0.0.1:5000/appointment/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.appointment = res.data.appointment || {};
        this.doctor = res.data.doctor || {};
        this.patient = res.data.patient || {};
        this.department = res.data.department || {};
        this.user = { id: res.data.patient?.user_id };

      } catch (err) {
        console.error(err);
        this.errorMessage =
          err.response?.data?.message || "Failed to load appointment.";
      } finally {
        this.loading = false;
      }
    },

    // ✅ Cancel appointment
    async confirmCancellation() {
      if (!confirm("Are you sure you want to cancel this appointment?")) return;

      const token = this.getToken();
      if (!token) return;

      this.loading = true;

      try {
        const res = await axios.patch(
          `http://127.0.0.1:5000/cancel_appointment/${this.appointment.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        alert(res.data.message);

        // Redirect after success
        this.$router.push({
          name: "PatientDashboard",
          params: { id: this.patient.id }
        });

      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Cancellation failed");
      } finally {
        this.loading = false;
      }
    },

    // ✅ Go back
    goBack() {
      this.$router.push({
        name: "PatientDashboard",
        params: { id: this.patient.id }
      });
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>