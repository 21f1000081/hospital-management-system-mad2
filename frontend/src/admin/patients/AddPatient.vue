<template>
  <div>
    <h1>New Patient</h1>
    <hr />
    <form @submit.prevent="submitForm">
      <!-- Name -->
      <label class="form-label" for="name">Name:</label>
      <input
        class="form-control"
        type="text"
        v-model="form.name"
        id="name"
        maxlength="120"
        required
      />
      <br />

      <!-- Date of Birth -->
      <div class="mb-3">
        <label class="form-label" for="dob">Date of Birth:</label>
        <input
          class="form-control"
          type="date"
          v-model="form.dob"
          id="dob"
          required
          min="1900-01-01"
          max="2025-12-31"
        />
        <div class="form-text">Select a valid birth date.</div>
      </div>
      <br />

      <!-- Phone -->
      <label class="form-label" for="phone">Phone:</label>
      <input
        class="form-control"
        type="text"
        v-model="form.phone"
        id="phone"
        maxlength="20"
        required
      />
      <br />

      <!-- Address -->
      <label class="form-label" for="address">Address:</label>
      <textarea
        class="form-control"
        v-model="form.address"
        id="address"
        cols="30"
        rows="3"
        maxlength="150"
        required
      ></textarea>
      <br /><br />

      <!-- Buttons -->
      <button type="submit" class="btn btn-success">
        <i class="fa fa-plus" aria-hidden="true"></i>
        Add
      </button>

      <button type="button" class="btn btn-secondary" @click="cancelForm">
        <i class="fa fa-times" aria-hidden="true"></i>
        Cancel
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NewPatientForm",
  data() {
    return {
      form: {
        name: "",
        dob: "",
        phone: "",
        address: "",
      },
    };
  },
  methods: {
    async submitForm() {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/patient/add",
          {
            name: this.form.name,
            dob: this.form.dob,
            phone: this.form.phone,
            address: this.form.address,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        alert(response.data.message);
      } catch (error) {
        if (error.response) {
          alert(error.response.data.message);
        } else {
          alert("An error occurred while adding patient");
        }
      } finally {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        this.$router.push("/login");
      }
    },
    cancelForm() {
      this.form = { name: "", dob: "", phone: "", address: "" };
      console.log("Form cancelled");
    },
  },
};
</script>