<template>
  <div class="container">
    <h1>Delete Doctor Profile: {{ doctor.name }}</h1>
    <hr />
    <form @submit.prevent="deleteDoctor">
      <div class="mb-3">
        <label class="form-label" for="name">Doctor Name:</label>
        <input
          class="form-control"
          type="text"
          id="name"
          v-model="doctor.name"
          maxlength="15"
          disabled
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="specialization">Specialization:</label>
        <input
          class="form-control"
          type="text"
          id="specialization"
          v-model="doctor.specialization"
          maxlength="15"
          disabled
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="experience_years">Experience:</label>
        <input
          class="form-control"
          type="text"
          id="experience_years"
          v-model="doctor.experience_years"
          maxlength="15"
          disabled
        />
      </div>

      <div class="mb-3">
        <label class="form-label" for="phone">Phone:</label>
        <input
          class="form-control"
          type="text"
          id="phone"
          v-model="doctor.phone"
          maxlength="15"
          disabled
        />
      </div>

      <hr />
      <b>Are you sure you want to delete this doctor profile?</b>
      <br /><br />

      <button type="submit" class="btn btn-danger">
        <i class="fa fa-trash" aria-hidden="true"></i> Confirm Delete
      </button>

      <button type="button" class="btn btn-secondary" @click="cancel">
        <i class="fa fa-times" aria-hidden="true"></i> Cancel
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: "DeleteDoctorForm",
  props: {
    initialDoctor: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      doctor: { ...this.initialDoctor }
    };
  },
  methods: {
    deleteDoctor() {
      // Handle delete action
      console.log("Deleting doctor:", this.doctor);
    },
    cancel() {
      // Navigate back to home or reset
      this.$router.push({ name: "home" });
    }
  }
};
</script>
