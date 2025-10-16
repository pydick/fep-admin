<script setup lang="ts">
import { getToken, setToken } from "@/utils/auth";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { getMe } from "@/api/user";

defineOptions({
  name: "Welcome"
});
const handleClick = () => {
  let data = getToken();
  let deepData = JSON.parse(JSON.stringify(data));
  const newexpires = dayjs(data.expires).subtract(3, "hour").valueOf();
  console.log(333, newexpires);
  data.expires = newexpires;
  console.log(222, data);
  Cookies.set("authorized-token", JSON.stringify(data));
  const test = Cookies.get("authorized-token");
  console.log(test);
};
const testGetMe = async () => {
  const res = await getMe({});
  console.log(res);
};
</script>

<template>
  <div>
    <h1>FEP Welcome</h1>
    <el-button @click="handleClick">更新过期时间</el-button>
    <el-button @click="testGetMe">获取当前用户</el-button>
    <!-- <el-button type="success">拥有code：'btn_add' 权限可见</el-button> -->
  </div>
</template>
