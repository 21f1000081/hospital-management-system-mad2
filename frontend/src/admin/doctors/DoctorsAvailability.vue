<template>
  <div class="container">
    <h1>Doctor's Availability</h1>
    <hr />

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

    <form @submit.prevent="saveAvailability">
      <div class="container">
        <h2>Availability</h2>
        <table class="table table-bordered">
          <thead class="table-light">
            <tr>
              <th>Date</th>
              <th>Morning</th>
              <th>Evening</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(slot, index) in availability" :key="index">
              <td>
                <!-- Date restricted to today through today + 6 (7 days total) -->
                <input
                  v-model="slot.date"
                  type="date"
                  class="form-control"
                  :min="minDate"
                  :max="maxDate"
                />
              </td>
              <td>
                <select v-model="slot.morning_slot_status" class="form-control">
                  <option value="available">Available</option>
                  <option value="not available">Not Available</option>
                </select>
              </td>
              <td>
                <select v-model="slot.evening_slot_status" class="form-control">
                  <option value="available">Available</option>
                  <option value="not available">Not Available</option>
                </select>
              </td>
              <td>
                <button type="button" class="btn btn-sm btn-outline-danger" @click="removeRow(index)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="availability.length === 0">
              <td colspan="4" class="text-muted text-center">No availability slots. Add one below.</td>
            </tr>
          </tbody>
        </table>

        <button type="button" class="btn btn-outline-primary btn-sm mb-3" @click="addRow">
          <i class="fa fa-plus me-1"></i> Add Date
        </button>
      </div>

      <br />
      <button type="submit" class="btn btn-success me-2" :disabled="submitting">
        <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="fa fa-save me-1"></i>
        {{ submitting ? 'Saving...' : 'Save' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="cancel" :disabled="submitting">
        <i class="fa fa-times me-1"></i> Cancel
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DoctorsAvailability",

  props: {
    doctorId: { type: Number, required: true }
  },

  data() {
    return {
      availability: [],
      errorMessage: "",
      successMessage: "",
      submitting: false
    };
  },

  created() {
    this.fetchAvailability();
  },

  computed: {
    minDate() {
      return new Date().toISOString().split('T')[0];
    },
    maxDate() {
      const d = new Date();
      d.setDate(d.getDate() + 6);
      return d.toISOString().split('T')[0];
    }
  },

  methods: {
    async fetchAvailability() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { this.$router.push("/login"); return; }

        const res = await axios.get(
          `http://127.0.0.1:5000/doctors/doctors_availability/${this.doctorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.availability = res.data.map(avail => ({
          date:    avail.date,
          morning_slot_status: avail.morning_slot_status,
          evening_slot_status: avail.evening_slot_status
        }));

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
        } else {
          this.errorMessage = "Failed to load availability.";
        }
      }
    },

    async saveAvailability() {
      this.errorMessage   = "";
      this.successMessage = "";
      this.submitting     = true;
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { this.$router.push("/login"); return; }

        await axios.post(
          `http://127.0.0.1:5000/doctors/doctors_availability/${this.doctorId}`,
          { availability: this.availability },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.successMessage = "Availability updated successfully.";
        this.$router.push("/");

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
        } else {
          this.errorMessage = "Failed to update availability.";
        }
      } finally {
        this.submitting = false;
      }
    },

    addRow() {
      this.availability.push({
        date:    "",
        morning_slot_status: "not available",
        evening_slot_status: "not available"
      });
    },

    removeRow(index) {
      this.availability.splice(index, 1);
    },

    cancel() {
      this.$router.push('/');
    }
  }
};
</script>
