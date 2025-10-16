<script setup lang="ts">
import { getToken, setToken } from "@/utils/auth";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { getMe } from "@/api/user";
import { ref, onMounted } from "vue";
defineOptions({
  name: "Welcome"
});
const handleClick = () => {
  let data = getToken();
  let deepData = JSON.parse(JSON.stringify(data));
  const newexpires = dayjs(data.expires).subtract(3, "hour").valueOf();
  data.expires = newexpires;
  Cookies.set("authorized-token", JSON.stringify(data));
  const test = Cookies.get("authorized-token");
  expires.value = dayjs(JSON.parse(test).expires).format("YYYY-MM-DD HH:mm:ss");
};
const testGetMe = async () => {
  const res = await getMe({});
  console.log(res);
};
const expires = ref("");
onMounted(() => {
  expires.value = dayjs(getToken().expires).format("YYYY-MM-DD HH:mm:ss");
});
</script>

<template>
  <div>
    <h1>FEP Welcome</h1>
    <el-button @click="handleClick">过期时间-3小时</el-button>
    <el-button @click="testGetMe">在过期后,刷新token后获取当前用户</el-button>
    过期时间:{{ expires }}
    <!-- <el-button type="success">拥有code：'btn_add' 权限可见</el-button> -->
  </div>
</template>
