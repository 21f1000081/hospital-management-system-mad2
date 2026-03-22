<template>
  <div class="container py-4">

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger"></div>
      <p class="mt-2 text-muted">Loading patient...</p>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Content -->
    <div v-if="!loading && patient.id">
      <h2 class="mb-3 text-danger">Delete Patient Profile</h2>
      <hr />

      <form @submit.prevent="confirmDelete">

        <!-- Name -->
        <label class="form-label">Name:</label>
        <input class="form-control" type="text" v-model="patient.name" readonly />
        <br />

        <!-- DOB -->
        <label class="form-label">Date of Birth:</label>
        <input class="form-control" type="date" v-model="patient.dob" readonly />
        <br />

        <!-- Phone -->
        <label class="form-label">Phone:</label>
        <input class="form-control" type="text" v-model="patient.phone" readonly />
        <br />

        <!-- Address -->
        <label class="form-label">Address:</label>
        <textarea class="form-control" rows="4" v-model="patient.address" readonly></textarea>
        <br />

        <hr />

        <p class="fw-bold text-danger">
          Are you sure you want to delete this patient profile?
        </p>

        <!-- Buttons -->
        <button type="submit" class="btn btn-danger me-2" :disabled="loading">
          Confirm Delete
        </button>

        <button type="button" class="btn btn-secondary" @click="goHome">
          Cancel
        </button>

      </form>
    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DeletePatientProfile",

  data() {
    return {
      user: {},
      patient: {},
      loading: false,
      errorMessage: ""
    };
  },

  async mounted() {
    await this.fetchPatient();
  },

  methods: {
    // ✅ Token helper
    getToken() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        this.$router.push("/login");
        return null;
      }
      return token;
    },

    // ✅ Fetch patient data
    async fetchPatient() {
      this.loading = true;
      this.errorMessage = "";

      const token = this.getToken();
      if (!token) return;

      try {
        const patientId = this.$route.params.id;

        const res = await axios.get(
          `http://127.0.0.1:5000/patient/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.patient = res.data.patient || {};
        this.user = res.data.user || {};

      } catch (err) {
        console.error(err);
        this.errorMessage =
          err.response?.data?.message || "Failed to load patient.";
      } finally {
        this.loading = false;
      }
    },

    // ✅ Delete patient
    async confirmDelete() {
      if (!confirm("Are you sure you want to delete this patient?")) return;

      const token = this.getToken();
      if (!token) return;

      this.loading = true;

      try {
        const res = await axios.delete(
          `http://127.0.0.1:5000/patient/delete/${this.patient.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        alert(res.data.message);

        // Redirect after delete
        this.$router.push({ name: "AdminDashboard" });

      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Delete failed");
      } finally {
        this.loading = false;
      }
    },

    // ✅ Cancel / go back
    goHome() {
      this.$router.push({ name: "AdminDashboard" });
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
}
</style>