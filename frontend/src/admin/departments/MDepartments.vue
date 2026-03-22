<template>
  <div class="container mt-4" style="max-width: 600px;">
    <h1>New Department / Specialization</h1>
    <hr />

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <form @submit.prevent="addDepartment" novalidate>
      <div class="mb-3">
        <label class="form-label" for="name">Name: <span class="text-danger">*</span></label>
        <input
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          id="name"
          v-model.trim="form.name"
          maxlength="100"
          placeholder="Enter department name"
          autocomplete="off"
        />
        <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label" for="description">Description: <span class="text-danger">*</span></label>
        <textarea
          class="form-control"
          :class="{ 'is-invalid': errors.description }"
          id="description"
          v-model.trim="form.description"
          maxlength="400"
          rows="4"
          placeholder="Enter department description"
        ></textarea>
        <div class="invalid-feedback" v-if="errors.description">{{ errors.description }}</div>
        <div class="form-text text-end">{{ form.description.length }} / 400</div>
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-success" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status"></span>
          <i v-else class="fa fa-plus me-1"></i>
          {{ loading ? "Adding..." : "Add" }}
        </button>
        <button type="button" class="btn btn-secondary" @click="cancel" :disabled="loading">
          <i class="fa fa-times me-1"></i> Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NewDepartmentForm",
  data() {
    return {
      form: { name: "", description: "" },
      errors: { name: "", description: "" },
      errorMessage: "",
      loading: false
    };
  },
  methods: {
    validate() {
      let valid = true;
      this.errors = { name: "", description: "" };

      if (!this.form.name) {
        this.errors.name = "Department name is required.";
        valid = false;
      }
      if (!this.form.description) {
        this.errors.description = "Description is required.";
        valid = false;
      }
      return valid;
    },

    async addDepartment() {
      this.errorMessage = "";
      if (!this.validate()) return;

      this.loading = true;
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          this.$router.push("/login");
          return;
        }

        const res = await axios.post(
          "http://127.0.0.1:5000/departments/add",
          {
            name: this.form.name,
            description: this.form.description
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );
        this.$router.push({
          path: "/",
          query: { success: res.data.message || "Department added successfully!" }
        });

      } catch (err) {
        console.error("Error adding department:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
          return;
        }

        if (err.response?.status === 409) {
          this.errors.name = err.response.data.message || "A department with this name already exists.";
        } else {
          this.errorMessage = err.response?.data?.message || "Failed to add department. Please try again.";
        }

      } finally {
        this.loading = false;
      }
    },

    cancel() {
      this.$router.push("/");
    }
  }
};
</script>