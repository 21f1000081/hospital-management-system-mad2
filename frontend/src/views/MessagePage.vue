<template>
  <div>
    <!-- Success messages -->
    <div
      v-for="(msg, index) in successMessages"
      :key="'success-' + index"
      class="alert alert-success"
      role="alert"
    >
      {{ msg }}
    </div>

    <!-- Error messages -->
    <div
      v-for="(msg, index) in errorMessages"
      :key="'error-' + index"
      class="alert alert-danger"
      role="alert"
    >
      {{ msg }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    successMessages() {
      return this.messages
        .filter(m => m.category === "success")
        .map(m => m.message);
    },
    errorMessages() {
      return this.messages
        .filter(m => m.category !== "success")
        .map(m => m.message);
    }
  }
};
</script>
