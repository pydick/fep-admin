<template>
  <svg :width="width" :height="height" :fill="color" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M597.333333 426.666667h85.333334v32.298666a192 192 0 0 1 298.666666 159.701334V853.333333h-85.333333v-234.666666c0-61.013333-50.133333-106.666667-106.666667-106.666667S682.666667 557.653333 682.666667 618.666667V853.333333h-85.333334V426.666667z m-85.333333-256v85.333333H170.666667v213.333333h341.333333v85.333334H170.666667v213.333333h341.333333v85.333333H85.333333V170.666667h426.666667z" p-id="2907" />
  </svg>
</template>

<script>
export default {
  name: "english_svg",
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
