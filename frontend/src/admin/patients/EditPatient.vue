<template>
  <div>
    <h1>Edit patient: {{ patient.name }}</h1>
    <hr />

    <div v-if="loading" class="text-muted">Loading patient data...</div>

    <form v-else @submit.prevent="submitEdit">
      <!-- Name -->
      <div class="mb-3">
        <label class="form-label" for="name">Name:</label>
        <input
          class="form-control"
          type="text"
          id="name"
          maxlength="120"
          v-model="patient.name"
          required
        />
      </div>

      <!-- Date of Birth -->
      <div class="mb-3">
        <label class="form-label" for="dob">Date of Birth:</label>
        <input
          class="form-control"
          type="date"
          id="dob"
          required
          min="1900-01-01"
          :max="today"
          v-model="patient.dob"
        />
        <div class="form-text">Select a valid birth date.</div>
      </div>

      <!-- Phone -->
      <div class="mb-3">
        <label class="form-label" for="phone">Phone:</label>
        <input
          class="form-control"
          type="text"
          id="phone"
          maxlength="20"
          v-model="patient.phone"
          required
        />
      </div>

      <!-- Address -->
      <div class="mb-3">
        <label class="form-label" for="address">Address:</label>
        <textarea
          class="form-control"
          id="address"
          cols="30"
          rows="5"
          maxlength="250"
          v-model="patient.address"
          required
        ></textarea>
      </div>

      <!-- Blacklisted -->
      <div class="form-check mb-3">
        <input
          class="form-check-input"
          type="checkbox"
          id="blacklisted"
          v-model="patient.blacklisted"
        />
        <label class="form-check-label" for="blacklisted">Blacklisted</label>
      </div>

      <hr />
      <p><strong>Are you sure you want to edit this patient profile?</strong></p>

      <button type="submit" class="btn btn-success me-2" :disabled="submitting">
        <i class="fa fa-pencil" aria-hidden="true"></i>
        {{ submitting ? "Saving..." : "Edit" }}
      </button>

      <button type="button" class="btn btn-secondary" @click="goHome" :disabled="submitting">
        <i class="fa fa-times" aria-hidden="true"></i>
        Cancel
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EditPatient",
  data() {
    return {
      loading: false,
      submitting: false,
      patient: {
        id: null,
        name: "",
        dob: "",
        phone: "",
        address: "",
        blacklisted: false,
      },
    };
  },
  computed: {
    today() {
      return new Date().toISOString().split("T")[0];
    },
  },
  created() {
    this.fetchPatient(this.$route.params.id);
  },
  methods: {
    getToken() {
      return localStorage.getItem("access_token");
    },
    async fetchPatient(id) {
      this.loading = true;
      try {
        const response = await axios.get(`/patient/edit/${id}`, {
          headers: { Authorization: `Bearer ${this.getToken()}` },
        });
        this.patient = response.data.patient;
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load patient information.");
      } finally {
        this.loading = false;
      }
    },
    async submitEdit() {
      this.submitting = true;
      try {
        const patientId = this.$route.params.id;
        const response = await axios.put(
          `/patient/edit/${patientId}`,
          {
            name: this.patient.name,
            dob: this.patient.dob,
            phone: this.patient.phone,
            address: this.patient.address,
            blacklisted: this.patient.blacklisted,
          },
          {
            headers: { Authorization: `Bearer ${this.getToken()}` },
          }
        );
        alert(response.data.message);
        this.goHome();
      } catch (error) {
        alert(error.response?.data?.message || "An error occurred while editing the patient.");
      } finally {
        this.submitting = false;
      }
    },
    goHome() {
      this.$router.push("/");
    },
  },
};
</script>