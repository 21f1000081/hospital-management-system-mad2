<template>
  <div class="card mb-4 shadow-sm">
    <div class="card-body">
      <h4 class="card-title">{{ doctor.name }}</h4>
      <p class="card-subtitle text-muted mb-2">{{ doctor.specialization }}</p>
      <p class="mb-1">{{ doctor.qualification }}</p>
      <p class="mb-1">{{ doctor.experience_years }} years</p>
      <p class="mb-3">{{ doctor.description }}</p>
      <div class="d-flex justify-content-start gap-2">
        <button
          class="btn btn-sm btn-outline-primary"
          @click="checkAvailability(doctor.id)"
        >
          Check availability
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="goBack(doctor.department_id)"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DoctorCard",
  props: {
    doctor: {
      type: Object,
      required: true
    }
  },
  methods: {
    checkAvailability(doctorId) {
      // Navigate to availability page
      this.$router.push({ name: "Appointment", params: { doctorId } });
    },
    goBack(departmentId) {
      // Navigate back to department view
      this.$router.push({ name: "DepartmentView", params: { id: departmentId } });
    }
  }
};
</script>
