<script setup lang="ts">
import AuthLayout from "../components/AuthLayout.vue";
import Regist from "./components/Regist.vue";

defineOptions({
  name: "Signup"
});
</script>

<template>
  <AuthLayout>
    <Regist />
  </AuthLayout>
</template>

<style lang="scss" scoped>
@import url("@/style/login.css");
</style>
