<template>
  <div class="container mt-4" style="max-width: 700px;">
    <h1>Edit Doctor: {{ doctor.name }}</h1>
    <hr />

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <form @submit.prevent="submitEdit" novalidate>

      <div class="mb-3">
        <label class="form-label" for="name">Name: <span class="text-danger">*</span></label>
        <input
          v-model.trim="doctor.name"
          class="form-control" :class="{ 'is-invalid': errors.name }"
          type="text" id="name" maxlength="100"
        />
        <div class="invalid-feedback">{{ errors.name }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="qualification">Qualification: <span class="text-danger">*</span></label>
        <input
          v-model.trim="doctor.qualification"
          class="form-control" :class="{ 'is-invalid': errors.qualification }"
          type="text" id="qualification" maxlength="100"
        />
        <div class="invalid-feedback">{{ errors.qualification }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="specialization">Specialization: <span class="text-danger">*</span></label>
        <select
          v-model="doctor.specialization"
          class="form-control" :class="{ 'is-invalid': errors.specialization }"
          id="specialization"
        >
          <option value="">-- Select Specialization --</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
        <div class="invalid-feedback">{{ errors.specialization }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="experience_years">Experience (years): <span class="text-danger">*</span></label>
        <input
          v-model.number="doctor.experience_years"
          class="form-control" :class="{ 'is-invalid': errors.experience_years }"
          type="number" id="experience_years" min="0" max="60"
        />
        <div class="invalid-feedback">{{ errors.experience_years }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="phone">Phone: <span class="text-danger">*</span></label>
        <input
          v-model.trim="doctor.phone"
          class="form-control" :class="{ 'is-invalid': errors.phone }"
          type="tel" id="phone" maxlength="15"
        />
        <div class="invalid-feedback">{{ errors.phone }}</div>
      </div>

      <hr />
      <p><b>Are you sure you want to edit this doctor profile?</b></p>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-success" :disabled="submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="fa fa-pencil me-1"></i>
          {{ submitting ? 'Saving...' : 'Save Changes' }}
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
  name: "EditDoctor",

  data() {
    return {
      doctor: {
        name: "",
        qualification: "",
        specialization: "",
        experience_years: "",
        phone: ""
      },
      departments: [],
      errors: {},
      errorMessage: "",
      submitting: false
    };
  },

  async mounted() {
    await Promise.all([this.fetchDoctor(), this.fetchDepartments()]);
  },

  methods: {

    async fetchDoctor() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { this.$router.push("/login"); return; }

        const id  = this.$route.params.id;
        const res = await axios.get(`http://127.0.0.1:5000/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const d = res.data.doctor;
        this.doctor = {
          name: d.name,
          qualification: d.qualification,
          specialization: d.department_id,
          experience_years: d.experience_years,
          phone: d.phone
        };

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
        } else {
          this.errorMessage = "Failed to load doctor details.";
        }
      }
    },

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
      if (!this.doctor.specialization)
        e.specialization = "Please select a specialization.";
      if (this.doctor.experience_years === "" || this.doctor.experience_years === null)
        e.experience_years = "Experience years is required.";
      else if (this.doctor.experience_years < 0 || this.doctor.experience_years > 60)
        e.experience_years = "Experience must be between 0 and 60 years.";
      if (!this.doctor.phone)
        e.phone = "Phone is required.";
      else if (this.doctor.phone.length > 15)
        e.phone = "Phone cannot exceed 15 characters.";

      this.errors = e;
      return Object.keys(e).length === 0;
    },

    async submitEdit() {
      this.errorMessage = "";
      if (!this.validate()) return;

      this.submitting = true;
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { this.$router.push("/login"); return; }

        const id = this.$route.params.id;
        await axios.put(
          `http://127.0.0.1:5000/doctors/edit/${id}`,
          {
            name: this.doctor.name,
            qualification: this.doctor.qualification,
            specialization: this.doctor.specialization,
            experience_years: this.doctor.experience_years,
            phone: this.doctor.phone
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        sessionStorage.setItem("flashMessage", "Doctor updated successfully!");
        this.$router.push("/admin");

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
        } else {
          this.errorMessage = err.response?.data?.message || "Failed to update doctor.";
        }
      } finally {
        this.submitting = false;
      }
    },

    cancel() {
      this.$router.push("/admin");
    }
  }
};
</script>