<template>
  <div>
    <div class="d-flex align-items-center mb-3">
      <h2 class="me-3">
        Department of {{ department?.name || 'Loading...' }}
      </h2>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-if="!loading && department" class="row g-4">
      <div class="col-lg-6 col-md-8 col-sm-12">
        <div class="card card-outline shadow-sm">
          <div class="card-body">
            <h4 class="mb-0">Overview</h4>
            <p class="card-text">{{ department.description || 'No description available' }}</p>

            <h5 class="mb-0">Doctor's list</h5>
            <ul class="list-group">
              <li
                v-for="doctor in activeDoctors"
                :key="doctor.id"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>{{ doctor.name }}</div>

                <div>
                  <router-link
                    :to="{ name: 'DoctorAppointment', params: { doctorId: doctor.id } }"
                    class="btn btn-sm btn-outline-primary"
                    title="Check availability"
                  >
                    Check availability
                  </router-link>
                </div>

                <div>
                  <router-link
                    :to="{ name: 'DoctorsView', params: { id: doctor.id } }"
                    class="btn btn-sm btn-outline-primary"
                  >
                    View details
                  </router-link>
                </div>
              </li>

              <li v-if="activeDoctors.length === 0" class="list-group-item text-muted">
                No doctors yet
              </li>
            </ul>

            <div class="mt-3">
              <router-link
                :to="{ name: 'PatientDashboard', params: { id: patientId } }"
                class="btn btn-sm btn-outline-primary"
              >
                Back
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DepartmentView",
  props: {
    id: { type: [String, Number], required: true },
  },
  data() {
    return {
      department: null,
      doctors: [],
      patientId: null,
      loading: false,
      error: null,
    };
  },
  async mounted() {
    this.patientId = JSON.parse(localStorage.getItem("user_info") || "{}").patient_id;
    await this.fetchDepartment();
  },
  methods: {
    async fetchDepartment() {
      this.loading = true;
      const token = localStorage.getItem("access_token");
      try {
        const res = await axios.get(
          `http://127.0.0.1:5000/department/${this.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.department = res.data.department;
        this.doctors = res.data.doctors;
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to load department.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
  computed: {
    activeDoctors() {
      return this.doctors.filter((doctor) => !doctor.blacklisted);
    },
  },
};
</script>