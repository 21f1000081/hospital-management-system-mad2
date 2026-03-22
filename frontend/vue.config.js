const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/patient": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})