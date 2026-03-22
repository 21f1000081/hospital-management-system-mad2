<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you are looking for doesn’t exist.</p>
    <router-link to="/">Go back to Home</router-link>
  </div>
</template>

<script>
export default {
  name: "NotFound"
}
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 100px;
  color: #333;
}
.not-found h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}
.not-found p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}
.not-found a {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}
.not-found a:hover {
  text-decoration: underline;
}
</style>
