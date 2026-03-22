<template>
  <div>
    <NavBar />
    <div class="container py-4">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from "@/views/NavBar.vue";

export default {
  name: "app",
  components: { NavBar }
};
</script>

<style>
body {
  background-color: #f8f9fa;
}
</style>
