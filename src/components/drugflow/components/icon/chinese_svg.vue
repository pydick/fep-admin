<template>
  <svg :width="width" :height="height" :fill="color" viewBox="128 128 768 768" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M555.231787 330.203429v-107.997284h-68.202727v108.038827H263.433935v273.457531H487.02906v210.976899h68.202727V603.70431h224.21827V330.203429H555.231787z m-68.202727 209.074952h-157.337694v-144.605675h157.335888v144.605675z m226.131053 0H555.195662v-144.605675h157.962645v144.605675z" p-id="5607" />
  </svg>
</template>

<script>
export default {
  name: "chinese_svg",
  components: {},
  props: {
    width: {
      type: String,
      default: "16"
    },
    height: {
      type: String,
      default: "16"
    },
    color: {
      type: String,
      default: "#666"
    }
  },
  setup() {
    return {};
  },
  mounted() {},
  methods: {}
};
</script>

<style lang="css" scoped></style>
