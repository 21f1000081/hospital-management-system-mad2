<template>
  <div>
    <h1>List of Users</h1>
    <hr />
    <table class="table">
      <thead>
        <tr>
          <th>User ID</th>
          <th>Username</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.name }}</td>
          <td>
            <form @submit.prevent="deleteUser(user.id)">
              <button
                type="submit"
                class="btn btn-danger"
                :disabled="user.is_admin"
              >
                Delete
              </button>
            </form>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "UserList",
  props: {
    users: {
      type: Array,
      required: true,
    },
  },
  methods: {
    deleteUser(id) {
      fetch(`/delete_user/${id}`, {
        method: "POST",
      })
        .then((response) => {
          if (response.ok) {
            this.$emit("user-deleted", id);
          }
        })
        .catch((err) => console.error("Error deleting user:", err));
    },
  },
};
</script>
