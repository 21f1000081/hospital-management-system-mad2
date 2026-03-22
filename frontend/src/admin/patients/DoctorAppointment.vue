<template>
  <div class="container mt-4">
    <h1>Book Appointment</h1>
    <hr />

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

    <div v-if="loading" class="text-center my-4">
      <span class="spinner-border"></span> Loading availability...
    </div>

    <form v-else @submit.prevent="bookAppointment">
      <table class="table table-bordered">
        <thead class="table-light">
          <tr>
            <th>Date</th>
            <th>Morning (08:00–12:00)</th>
            <th>Evening (16:00–21:00)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(slot, index) in availability" :key="index">
            <td>{{ slot.date }}</td>

            <!-- Morning -->
            <td>
              <div v-if="slot.morning_slot_status === 'available'">
                <input
                  type="checkbox"
                  v-model="slot.morning_selected"
                  :id="'morning_' + index"
                />
                <label :for="'morning_' + index" class="ms-2">Available</label>
              </div>
              <span
                v-else-if="slot.morning_slot_status === 'booked'"
                class="badge bg-warning text-dark"
              >
                Booked
              </span>
              <span v-else class="text-muted">Not Available</span>
            </td>

            <!-- Evening -->
            <td>
              <div v-if="slot.evening_slot_status === 'available'">
                <input
                  type="checkbox"
                  v-model="slot.evening_selected"
                  :id="'evening_' + index"
                />
                <label :for="'evening_' + index" class="ms-2">Available</label>
              </div>
              <span
                v-else-if="slot.evening_slot_status === 'booked'"
                class="badge bg-warning text-dark"
              >
                Booked
              </span>
              <span v-else class="text-muted">Not Available</span>
            </td>
          </tr>

          <tr v-if="availability.length === 0">
            <td colspan="3" class="text-center text-muted">No slots available.</td>
          </tr>
        </tbody>
      </table>

      <button type="submit" class="btn btn-success me-2" :disabled="submitting">
        <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
        {{ submitting ? "Booking..." : "Book Appointment" }}
      </button>
      <button type="button" class="btn btn-secondary" @click="cancel" :disabled="submitting">
        Cancel
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DoctorAppointment",

  props: {
    doctorId: { type: Number, required: true }
  },

  data() {
    return {
      availability: [],
      patientId: null,
      errorMessage: "",
      successMessage: "",
      submitting: false,
      loading: false
    };
  },

  created() {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user_info"));
      this.patientId = userInfo?.patient_id || null;
    } catch {
      this.patientId = null;
    }

    if (!this.doctorId) {
      this.errorMessage = "Doctor ID is missing.";
      return;
    }

    if (!this.patientId) {
      this.errorMessage = "Patient ID is missing. Please log in again.";
      return;
    }

    this.fetchAvailability();
  },

  methods: {
    getToken() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        this.$router.push("/login");
        return null;
      }
      return token;
    },

    async fetchAvailability() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const token = this.getToken();
        if (!token) return;

        const res = await axios.get(
          `http://127.0.0.1:5000/doctors/doctors_availability/${this.doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.availability = res.data.map(avail => ({
          date: avail.date,
          morning_slot_status: avail.morning_slot_status?.toLowerCase(),
          evening_slot_status: avail.evening_slot_status?.toLowerCase(),
          morning_selected: false,
          evening_selected: false
        }));
      } catch (err) {
        this.errorMessage =
          err.response?.data?.message || "Failed to load availability.";
      } finally {
        this.loading = false;
      }
    },

    async bookAppointment() {
      this.errorMessage = "";
      this.successMessage = "";

      const token = this.getToken();
      if (!token) return;

      if (!this.patientId) {
        this.errorMessage = "Patient ID is missing. Please log in again.";
        return;
      }

      const selected = this.availability.filter(
        a => a.morning_selected || a.evening_selected
      );

      if (selected.length === 0) {
        this.errorMessage = "Please select at least one slot.";
        return;
      }

      const slots = selected.map(a => ({
        date: a.date,
        morning: a.morning_selected ? "Morning" : null,
        evening: a.evening_selected ? "Evening" : null
      }));

      this.submitting = true;

      try {
        await axios.post(
          `http://127.0.0.1:5000/appointment/${this.doctorId}`,
          {
            doctor_id: this.doctorId,
            patient_id: this.patientId,
            slots
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.availability = this.availability.map(slot => ({
          ...slot,
          morning_slot_status: slot.morning_selected ? "booked" : slot.morning_slot_status,
          evening_slot_status: slot.evening_selected ? "booked" : slot.evening_slot_status,
          morning_selected: false,
          evening_selected: false
        }));

        this.successMessage = "Appointment booked successfully! Redirecting...";

        setTimeout(() => {
          this.$router.push({ name: "PatientDashboard", params: { id: this.patientId } });
        }, 500);

      } catch (err) {
        this.errorMessage =
          err.response?.data?.message || "Failed to book appointment.";
      } finally {
        this.submitting = false;
      }
    },

    cancel() {
      this.$router.back();
    }
  }
};
</script>