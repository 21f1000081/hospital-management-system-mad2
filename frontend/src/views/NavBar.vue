<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-blue shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand d-lg-none" href="#">Hospital Admin</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#topNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="topNav">
          <ul class="navbar-nav d-flex align-items-center me-auto">
            <li class="nav-item me-2">
              <router-link class="nav-link" to="/">
                <i class="bi bi-house-door-fill me-1"></i> Home
              </router-link>
            </li>
            <li class="nav-item me-4">
              <button class="btn btn-sm btn-outline-danger" @click="handleLogout">
                Logout
              </button>
            </li>
          </ul>

          <!-- Admin search box -->
          <div v-if="userRole === 'admin'" class="ms-auto d-flex align-items-center">
            <input
              type="text"
              v-model="query"
              class="form-control me-2"
              placeholder="Search doctor, patient, department..."
              @keyup.enter="search"
            />
            <button class="btn btn-primary" @click="search">Search</button>
          </div>

          <!-- Patient nav links -->
          <template v-if="userRole === 'patient' && patient && currentPage === 'patient_dashboard'">
            <ul class="navbar-nav d-flex align-items-center ms-auto">
              <li class="nav-item me-2">
                <router-link class="nav-link" :to="`/patients/edit/${patient.id}`">
                  <i class="bi bi-pencil-fill me-1"></i> Edit Profile
                </router-link>
              </li>
              <li v-if="doctor" class="nav-item me-2">
                <router-link
                  class="nav-link"
                  :to="{ name: 'patient_history', params: { patient_id: patient.id } }"
                >
                  <i class="bi bi-clock-history me-1"></i> History
                </router-link>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </nav>

    <main class="main-container container-fluid py-4">
      <div class="container">
        <MessagePage />
      </div>
    </main>
  </div>
</template>

<script>
import MessagePage from "@/views/MessagePage.vue";

export default {
  name: "NavBar",
  components: { MessagePage },

  props: {
    patient:     { type: Object, default: () => null },
    doctor:      { type: Object, default: () => null },
    currentPage: { type: String, default: "" }
  },

  data() {
    return {
      query:    "",
      userRole: null
    };
  },

  mounted() {
    this.loadUser();
  },

  watch: {
    $route() {
      this.loadUser();
    }
  },

  methods: {
    loadUser() {
      try {
        const raw = localStorage.getItem("user_info");
        if (raw) {
          const parsed = JSON.parse(raw);
          this.userRole = parsed.role || null;
        } else {
          this.userRole = null;
        }
      } catch {
        this.userRole = null;
      }
    },

    search() {
      // Push to /admin with search query param — no named route needed
      if (!this.query.trim()) return;
      this.$router.push({ path: "/admin", query: { query: this.query.trim() } });
    },

    handleLogout() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
      sessionStorage.clear();
      this.$router.push("/login");
    }
  }
};
</script>