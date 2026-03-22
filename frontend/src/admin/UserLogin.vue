<template>
  <div class="container mt-5" style="max-width: 500px">
    <h2 class="text-center mb-4">🔐 User Login</h2>

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <form @submit.prevent="loginUser" novalidate>
      <div class="mb-3">
        <label for="username" class="form-label">
          <i class="bi bi-person"></i> Username:
        </label>
        <input
          type="text"
          id="username"
          v-model.trim="username"
          class="form-control"
          placeholder="Username"
          required
          autofocus
          autocomplete="username"
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">
          <i class="bi bi-lock"></i> Password:
        </label>
        <div class="input-group">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            class="form-control"
            placeholder="Password"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="showPassword = !showPassword"
            tabindex="-1"
          >
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-1"
            role="status"
          ></span>
          {{ loading ? "Logging in..." : "Login" }}
          <i v-if="!loading" class="bi bi-door-open-fill ms-1"></i>
        </button>
      </div>

      <div class="text-center mt-3">
        <router-link to="/register" class="text-decoration-none">
          Create Account?
        </router-link>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserLogin",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
      successMessage: "",
      loading: false,
      showPassword: false,
    };
  },
  methods: {
    async loginUser() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.username || !this.password) {
        this.errorMessage = "Username and password are required.";
        return;
      }

      this.loading = true;

      try {
        const response = await axios.post("http://127.0.0.1:5000/login", {
          username: this.username,
          password: this.password,
        });

        const access_token = response.data.access_token;
        const user_info = response.data.user_info;

        // store in localStorage
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user_info", JSON.stringify(user_info));

        this.successMessage = "Login successful! Redirecting...";
        this.username = "";
        this.password = "";

        const roleRoutes = {
          admin: "/admin",
          doctor: `/doctors/doctors_dashboard/${user_info.id}`,
          patient: `/patient/patient_dashboard/${user_info.patient_id}`,
        };

        const destination = roleRoutes[user_info.role];

        if (destination) {
          this.$router.push(destination);
        } else {
          this.errorMessage = "Unknown user role.";
        }
      } catch (error) {
        console.error(error);

        if (error.response?.status === 403) {
          // Blacklisted user
          this.errorMessage =
            error.response?.data?.message ||
            "You are blacklisted. Please contact the administrator.";

          localStorage.removeItem("access_token");
          localStorage.removeItem("user_info");
        } else {
          this.errorMessage =
            error.response?.data?.message || "Login failed. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
