<template>
  <div class="container mt-5" style="max-width: 500px;">
    <h2 class="text-center mb-4">
      <i class="bi bi-person-plus"></i> User Registration
    </h2>

    <form @submit.prevent="RegisterUser">
      <div class="mb-3">
        <label for="username" class="form-label">
          <i class="bi bi-person"></i> Username:
        </label>
        <input
          type="text"
          id="username"
          v-model="username"
          class="form-control"
          placeholder="User Name"
          required
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">
          <i class="bi bi-lock"></i> Password:
        </label>
        <input
          type="password"
          id="password"
          v-model="password"
          class="form-control"
          placeholder="Password"
          required
        />
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">
          <i class="bi bi-envelope"></i> e-Mail:
        </label>
        <input
          type="email"
          id="email"
          v-model="email"
          class="form-control"
          placeholder="e-Mail"
          required
        />
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-success">
          <i class="bi bi-check-circle"></i> Register
        </button>
      </div>
    </form>

    <div v-if="errorMessage" class="text-danger mt-3">
      <i class="bi bi-exclamation-circle"></i> {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="text-success mt-3">
      <i class="bi bi-check-circle-fill"></i> {{ successMessage }}
    </div>

    <div class="text-center mt-3">
      <router-link to="/login" class="text-decoration-none">
        Already have an account? Login
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserRegister",
  data() {
    return {
      username: "",
      password: "",
      email: "",
      errorMessage: "",
      successMessage: ""
    };
  },
  methods: {
    async RegisterUser() {
      try {
        const response = await axios.post("http://127.0.0.1:5000/register", {
          username: this.username,
          password: this.password,
          email: this.email
        });

        this.successMessage = "User registered successfully!";
        this.errorMessage = "";
        console.log(response.data);

        // Clear form
        this.username = "";
        this.password = "";
        this.email = "";

        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user_info", JSON.stringify(response.data.user_info));

        // Redirect to patient add or dashboard
        this.$router.push("/patient/add");

      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Registration failed";
        this.successMessage = "";
      }
    }
  }
};
</script>
