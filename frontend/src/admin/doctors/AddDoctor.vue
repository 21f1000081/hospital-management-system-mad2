<template>
  <div class="container mt-4" style="max-width: 700px;">
    <h1>New Doctor</h1>
    <hr />

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <form @submit.prevent="submitDoctor" novalidate>

      <div class="mb-3">
        <label class="form-label" for="name">Name: <span class="text-danger">*</span></label>
        <input
          v-model.trim="doctor.name"
          class="form-control" :class="{ 'is-invalid': errors.name }"
          id="name" maxlength="100"
        />
        <div class="invalid-feedback">{{ errors.name }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="qualification">Qualification: <span class="text-danger">*</span></label>
        <input
          v-model.trim="doctor.qualification"
          class="form-control" :class="{ 'is-invalid': errors.qualification }"
          id="qualification" maxlength="100"
        />
        <div class="invalid-feedback">{{ errors.qualification }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="specialization">Specialization: <span class="text-danger">*</span></label>
        <select
          v-model="doctor.specialization_id"
          class="form-control" :class="{ 'is-invalid': errors.specialization_id }"
          id="specialization"
        >
          <option value="">-- Select Specialization --</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
        <div class="invalid-feedback">{{ errors.specialization_id }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="experience_years">
          Experience (years): <span class="text-danger">*</span>
        </label>
        <input
          v-model.number="doctor.experience_years"
          type="number" min="0" max="60"
          class="form-control" :class="{ 'is-invalid': errors.experience_years }"
          id="experience_years"
        />
        <div class="invalid-feedback">{{ errors.experience_years }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="phone">Phone: <span class="text-danger">*</span></label>
        <input
          v-model.trim="doctor.phone"
          class="form-control" :class="{ 'is-invalid': errors.phone }"
          id="phone" maxlength="15"
        />
        <div class="invalid-feedback">{{ errors.phone }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="email">e-Mail: <span class="text-danger">*</span></label>
        <input
          v-model.trim="doctor.email"
          class="form-control" :class="{ 'is-invalid': errors.email }"
          type="email"
          id="email"
        />
        <div class="invalid-feedback">{{ errors.email }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Availability:</label>
        <table class="table table-bordered table-sm">
          <thead class="table-light">
            <tr>
              <th>Date</th>
              <th>Morning Slot</th>
              <th>Evening Slot</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in availability" :key="index">
              <td>
                <input v-model="entry.date" type="date" class="form-control form-control-sm" :min="minDate" :max="maxDate" />
              </td>
              <td>
                <select v-model="entry.morning_slot_status" class="form-select form-select-sm">
                  <option value="available">Available</option>
                  <option value="not available">Not Available</option>
                </select>
              </td>
              <td>
                <select v-model="entry.evening_slot_status" class="form-select form-select-sm">
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
              <td colspan="4" class="text-muted text-center">No availability slots added yet.</td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="btn btn-outline-primary btn-sm" @click="addRow">
          <i class="fa fa-plus me-1"></i> Add Date
        </button>
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-success" :disabled="submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="fa fa-plus me-1"></i>
          {{ submitting ? 'Adding...' : 'Add Doctor' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="cancel" :disabled="submitting">
          <i class="fa fa-times me-1"></i> Cancel
        </button>
      </div>

    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddDoctor",

  data() {
    return {
      doctor: {
        name: "",
        qualification: "",
        specialization_id: "",
        experience_years: "",
        phone: "",
        email: ""
      },
      departments: [],
      availability: [],
      errors: {},
      errorMessage: "",
      submitting: false
    };
  },

  async mounted() {
    await this.fetchDepartments();
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

    async fetchDepartments() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { this.$router.push("/login"); return; }

        const res = await axios.get("http://127.0.0.1:5000/doctors/add", {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.departments = res.data.departments || [];

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
        } else {
          this.errorMessage = "Failed to load departments.";
        }
      }
    },

    validate() {
      const e = {};
      if (!this.doctor.name)
        e.name = "Name is required.";
      if (!this.doctor.qualification)
        e.qualification = "Qualification is required.";
      if (!this.doctor.specialization_id)
        e.specialization_id = "Please select a specialization.";
      if (this.doctor.experience_years === "" || this.doctor.experience_years === null)
        e.experience_years = "Experience years is required.";
      else if (this.doctor.experience_years < 0 || this.doctor.experience_years > 60)
        e.experience_years = "Experience must be between 0 and 60 years.";
      if (!this.doctor.phone)
        e.phone = "Phone is required.";
      else if (this.doctor.phone.length > 15)
        e.phone = "Phone cannot exceed 15 characters.";
      if (!this.doctor.email)
        e.email = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.doctor.email))
        e.email = "Please enter a valid email address.";

      this.errors = e;
      return Object.keys(e).length === 0;
    },

    async submitDoctor() {
      this.errorMessage = "";
      if (!this.validate()) return;

      this.submitting = true;
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { this.$router.push("/login"); return; }

        await axios.post(
          "http://127.0.0.1:5000/doctors/add",
          {
            name: this.doctor.name,
            qualification: this.doctor.qualification,
            specialization_id: this.doctor.specialization_id,
            experience_years: this.doctor.experience_years,
            phone: this.doctor.phone,
            email: this.doctor.email,
            availability: this.availability
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        sessionStorage.setItem("flashMessage", "Doctor added successfully!");
        this.$router.push("/admin");

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
        } else {
          this.errorMessage = err.response?.data?.message || "Failed to add doctor.";
        }
      } finally {
        this.submitting = false;
      }
    },

    addRow() {
      this.availability.push({
        date: "",
        morning_slot_status: "not available",
        evening_slot_status: "not available"
      });
    },

    removeRow(index) {
      this.availability.splice(index, 1);
    },

    cancel() {
      this.$router.push("/admin");
    }
  }
};
</script>
