<template>
  <div class="container-fluid py-4">

    <div v-if="flashMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ flashMessage }}
      <button type="button" class="btn-close" @click="flashMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Loading dashboard...</p>
    </div>

    <template v-else>
      <div class="d-flex align-items-center mb-4">
        <h2 class="me-3">Welcome, Admin</h2>
        <small class="text-muted">Manage departments, staff, patients and appointments</small>
      </div>

      <!-- Search result banner -->
      <div v-if="searchQuery" class="alert alert-info d-flex justify-content-between align-items-center">
        <span>Showing results for: <strong>{{ searchQuery }}</strong></span>
        <button class="btn btn-sm btn-outline-secondary" @click="clearSearch">Clear</button>
      </div>

      <div class="row g-4">

        <!-- Departments -->
        <div class="col-lg-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Departments</h5>
                <router-link to="/departments/add" class="btn btn-sm btn-success">+ Create</router-link>
              </div>

              <ul class="list-group list-group-flush">
                <li
                  v-for="dept in filteredDepartments"
                  :key="dept.id"
                  class="list-group-item d-flex justify-content-between align-items-center px-0"
                >
                  <span>{{ dept.name || '(no name)' }}</span>
                  <div>
                    <router-link
                      :to="`/departments/edit/${dept.id}`"
                      class="btn btn-sm btn-outline-warning me-1"
                    >Edit</router-link>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete('department', dept.id, dept.name)"
                    >Delete</button>
                  </div>
                </li>
                <li v-if="filteredDepartments.length === 0" class="list-group-item text-muted px-0">
                  No departments found
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Doctors -->
        <div class="col-lg-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Registered Doctors</h5>
                <router-link to="/doctors/add" class="btn btn-sm btn-success">+ Create</router-link>
              </div>

              <div class="list-group list-group-flush">
                <div
                  v-for="doc in filteredDoctors"
                  :key="doc.id"
                  class="list-group-item d-flex justify-content-between align-items-center px-0"
                >
                  <div>
                    <strong>{{ doc.name || '(no name)' }}</strong>
                    <div class="text-muted small">{{ doc.specialization || '' }}</div>
                  </div>
                  <div class="btn-group">
                    <router-link :to="`/doctors/edit/${doc.id}`" class="btn btn-sm btn-outline-primary">
                      Edit
                    </router-link>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete('doctor', doc.id, doc.name)"
                    >Delete</button>
                    <button
                      class="btn btn-sm"
                      :class="doc.blacklisted ? 'btn-outline-success' : 'btn-outline-warning'"
                      @click="toggleBlacklistDoctor(doc)"
                    >
                      {{ doc.blacklisted ? 'Unblock' : 'Blacklist' }}
                    </button>
                  </div>
                </div>
                <div v-if="filteredDoctors.length === 0" class="list-group-item text-muted px-0">
                  No doctors found
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Patients -->
        <div class="col-lg-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Registered Patients</h5>
              </div>

              <ul class="list-group list-group-flush">
                <li
                  v-for="pat in filteredPatients"
                  :key="pat.id"
                  class="list-group-item d-flex justify-content-between align-items-center px-0"
                >
                  <div>
                    <strong>{{ pat.name || '(no name)' }}</strong>
                    <div class="text-muted small">ID: {{ pat.id }}</div>
                  </div>
                  <div class="btn-group">
                    <router-link :to="`/patient/edit/${pat.id}`" class="btn btn-sm btn-outline-primary">
                      Edit
                    </router-link>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete('patient', pat.id, pat.name)"
                    >Delete</button>
                    <button
                      class="btn btn-sm"
                      :class="pat.blacklisted ? 'btn-outline-success' : 'btn-outline-warning'"
                      @click="toggleBlacklistPatient(pat)"
                    >
                      {{ pat.blacklisted ? 'Unblock' : 'Blacklist' }}
                    </button>
                  </div>
                </li>
                <li v-if="filteredPatients.length === 0" class="list-group-item text-muted px-0">
                  No patients found
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr class="my-4" />

      <!-- Appointments -->
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="mb-3">Upcoming Appointments</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>History</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(appt, index) in filteredAppointments" :key="appt.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ appt.patient ? appt.patient.name : '—' }}</td>
                  <td>{{ appt.doctor  ? appt.doctor.name  : '—' }}</td>
                  <td>{{ appt.doctor  ? appt.doctor.specialization : '—' }}</td>
                  <td class="text-nowrap">{{ appt.date || 'TBD' }}</td>
                  <td class="text-nowrap">{{ appt.time || 'TBD' }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-success':   appt.status === 'Booked',
                        'bg-secondary': appt.status === 'Completed',
                        'bg-danger':    appt.status === 'Cancelled'
                      }"
                    >{{ appt.status }}</span>
                  </td>
                  <td>
                    <router-link
                      :to="{
                        name: 'PatientHistoryDoctor',
                        params: {
                          doctorId:  String(appt.doctor?.user_id),
                          patientId: String(appt.patient?.id)
                        }
                      }"
                      class="btn btn-sm btn-outline-secondary"
                    >View</router-link>
                  </td>
                </tr>
                <tr v-if="filteredAppointments.length === 0">
                  <td colspan="8" class="text-center text-muted">No upcoming appointments</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminDashboard",

  data() {
    return {
      departments:  [],
      doctors:      [],
      patients:     [],
      appointments: [],
      loading:      true,
      errorMessage: "",
      flashMessage: ""
    };
  },

  computed: {
    // Read search query from URL param
    searchQuery() {
      return (this.$route.query.query || "").toLowerCase().trim();
    },

    // Filter departments by search
    filteredDepartments() {
      if (!this.searchQuery) return this.departments;
      return this.departments.filter(d =>
        d.name?.toLowerCase().includes(this.searchQuery)
      );
    },

    // Filter doctors by name or specialization
    filteredDoctors() {
      if (!this.searchQuery) return this.doctors;
      return this.doctors.filter(d =>
        d.name?.toLowerCase().includes(this.searchQuery) ||
        d.specialization?.toLowerCase().includes(this.searchQuery)
      );
    },

    // Filter patients by name
    filteredPatients() {
      if (!this.searchQuery) return this.patients;
      return this.patients.filter(p =>
        p.name?.toLowerCase().includes(this.searchQuery)
      );
    },

    // Only booked appointments, with doctor/patient joined
    filteredAppointments() {
      return this.appointments
        .filter(appt => appt.status === "Booked")
        .map(appt => {
          const doctor  = this.doctors.find(d => d.id === appt.doctor_id)   || null;
          const patient = this.patients.find(p => p.id === appt.patient_id) || null;
          return { ...appt, doctor, patient };
        });
    }
  },

  async mounted() {
    const flash = sessionStorage.getItem("flashMessage");
    if (flash) {
      this.flashMessage = flash;
      sessionStorage.removeItem("flashMessage");
    }
    await this.fetchDashboard();
  },

  methods: {
    // Clear search by removing query param
    clearSearch() {
      this.$router.push({ path: "/admin" });
    },

    getToken() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        this.redirectToLogin();
        return null;
      }
      return token;
    },

    redirectToLogin() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
      this.$router.push("/login");
    },

    async fetchDashboard() {
      this.loading      = true;
      this.errorMessage = "";

      const token = this.getToken();
      if (!token) return;

      try {
        const res = await axios.get("http://127.0.0.1:5000/admin", {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.departments  = Array.isArray(res.data.departments)  ? res.data.departments  : [];
        this.doctors      = Array.isArray(res.data.doctors)      ? res.data.doctors      : [];
        this.patients     = Array.isArray(res.data.patients)     ? res.data.patients     : [];
        this.appointments = Array.isArray(res.data.appointments) ? res.data.appointments : [];

      } catch (err) {
        if (err.response?.status === 401) {
          this.redirectToLogin();
        } else {
          this.errorMessage = err.response?.data?.message || "Failed to load dashboard. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },

    async toggleBlacklistDoctor(doctor) {
      const token = this.getToken();
      if (!token) return;

      try {
        const res = await axios.post(
          `http://127.0.0.1:5000/doctors/${doctor.id}/blacklist`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const idx = this.doctors.findIndex(d => d.id === doctor.id);
        if (idx !== -1) {
          this.doctors.splice(idx, 1, { ...this.doctors[idx], blacklisted: res.data.blacklisted });
        }
        this.flashMessage = `${doctor.name} ${res.data.blacklisted ? "blacklisted" : "unblocked"} successfully.`;

      } catch (err) {
        if (err.response?.status === 401) {
          this.redirectToLogin();
        } else {
          this.errorMessage = err.response?.data?.message || "Failed to update doctor status.";
        }
      }
    },

    async toggleBlacklistPatient(patient) {
      const token = this.getToken();
      if (!token) return;

      try {
        const res = await axios.patch(
          `http://127.0.0.1:5000/patient/blacklist/${patient.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const idx = this.patients.findIndex(p => p.id === patient.id);
        if (idx !== -1) {
          this.patients.splice(idx, 1, { ...this.patients[idx], blacklisted: res.data.patient.blacklisted });
        }
        this.flashMessage = `${patient.name} ${res.data.patient.blacklisted ? "blacklisted" : "unblocked"} successfully.`;

      } catch (err) {
        if (err.response?.status === 401) {
          this.redirectToLogin();
        } else {
          this.errorMessage = err.response?.data?.message || "Failed to update patient status.";
        }
      }
    },

    async confirmDelete(type, id, name) {
      if (!confirm(`Are you sure you want to delete ${type} "${name}"? This cannot be undone.`)) return;

      const token = this.getToken();
      if (!token) return;

      const urls = {
        department: `http://127.0.0.1:5000/departments/delete/${id}`,
        doctor:     `http://127.0.0.1:5000/doctors/delete/${id}`,
        patient:    `http://127.0.0.1:5000/patient/delete/${id}`
      };

      try {
        await axios.delete(urls[type], { headers: { Authorization: `Bearer ${token}` } });
        this.flashMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} "${name}" deleted successfully.`;

        if (type === "department") this.departments = this.departments.filter(d => d.id !== id);
        if (type === "doctor")     this.doctors     = this.doctors.filter(d => d.id !== id);
        if (type === "patient")    this.patients    = this.patients.filter(p => p.id !== id);

      } catch (err) {
        if (err.response?.status === 401) {
          this.redirectToLogin();
        } else {
          this.errorMessage = err.response?.data?.message || `Failed to delete ${type}.`;
        }
      }
    }
  }
};
</script>