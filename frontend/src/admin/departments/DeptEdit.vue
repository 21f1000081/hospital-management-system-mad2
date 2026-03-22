<template>
  <div class="container mt-4" style="max-width: 600px;">
    <h1>Edit Department</h1>
    <hr />

    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border spinner-border-sm"></div> Loading...
    </div>

    <form v-else @submit.prevent="editDepartment" novalidate>
      <div class="mb-3">
        <label class="form-label" for="name">Name: <span class="text-danger">*</span></label>
        <input
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          type="text"
          id="name"
          v-model.trim="form.name"
          maxlength="100"
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
          rows="3"
          maxlength="400"
        ></textarea>
        <div class="invalid-feedback" v-if="errors.description">{{ errors.description }}</div>
        <div class="form-text text-end">{{ form.description.length }} / 400</div>
      </div>

      <hr />
      <p class="text-muted">Are you sure you want to save these changes?</p>

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
  name: "DeptEdit",

  data() {
    return {
      form: {
        name: "",
        description: ""
      },
      errors: { name: "", description: "" },
      errorMessage: "",
      loading: true,
      submitting: false
    };
  },

  async mounted() {
    await this.fetchDepartment();
  },

  methods: {

    async fetchDepartment() {
      this.loading = true;
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { this.$router.push("/login"); return; }

        const res = await axios.get(
          `http://127.0.0.1:5000/departments/edit/${this.$route.params.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.form.name = res.data.department?.name || "";
        this.form.description = res.data.department?.description || "";

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
        } else {
          this.errorMessage = err.response?.data?.message || "Failed to load department.";
        }
      } finally {
        this.loading = false;
      }
    },

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

    async editDepartment() {
      this.errorMessage = "";
      if (!this.validate()) return;

      this.submitting = true;
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { this.$router.push("/login"); return; }

        await axios.put(
          `http://127.0.0.1:5000/departments/edit/${this.$route.params.id}`,
          {
            name: this.form.name,
            description: this.form.description
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        sessionStorage.setItem("flashMessage", "Department updated successfully!");
        this.$router.push("/admin");

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          this.$router.push("/login");
        } else {
          this.errorMessage = err.response?.data?.message || "Failed to update department.";
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