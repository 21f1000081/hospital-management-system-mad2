<template>
  <div>
    <h1>Delete Department: {{ form.name }}</h1>
    <hr />
    <form @submit.prevent="deleteDepartment">
      <label class="form-label" for="name">Name:</label>
      <input
        class="form-control"
        type="text"
        id="name"
        v-model="form.name"
        maxlength="15"
        disabled
      />

      <label class="form-label" for="description">Description:</label>
      <textarea
        class="form-control"
        id="description"
        v-model="form.description"
        rows="3"
        disabled
      ></textarea>

      <br />
      <hr />
      <b>Are you sure you want to delete this department?</b>
      <br /><br />

      <button type="submit" class="btn btn-danger">
        <i class="fa fa-trash" aria-hidden="true"></i>
        Confirm Delete
      </button>

      <button type="button" class="btn btn-secondary" @click="cancel">
        <i class="fa fa-times" aria-hidden="true"></i>
        Cancel
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: "DeleteDepartmentForm",
  props: {
    department: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {
        name: this.department.name,
        description: this.department.description,
      },
    };
  },
  methods: {
    deleteDepartment() {
      fetch(`/departments/${this.department.id}/delete`, {
        method: "POST",
      })
        .then((response) => {
          if (response.ok) {
            alert("Department deleted successfully!");
            this.$router.push({ name: "home" });
          }
        })
        .catch((err) => console.error("Error deleting department:", err));
    },
    cancel() {
      this.$router.push({ name: "home" });
    },
  },
};
</script>
