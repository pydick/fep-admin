<template>
  <svg :width="width" :height="height" :fill="color" viewBox="128 128 768 768" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M738.82 445.08V215.4L526 94.76 313.24 215.4v231l-208.19 118v233.08L317.84 924l209.32-124.45L736.48 924l212.78-126.52V564.4zM123.37 564.59l194.47-110.26 112.71 63.9 79.86 47.49-192.57 114.49z m398.06 227.66L327 907.82V696.15l194.43-115.58z m4.6-461L331.56 215.59 526 105.33l194.5 110.26z m203.59-99.63v211.63l-159.1 94.59-35.29 20V347.15zM542.78 565l32.36-19.24 161.34-91.47 194.46 110.3-194.46 115.62z m397.28 227.25L745.68 907.82V696.15l194.38-115.58z" p-id="3246" />
  </svg>
</template>

<script>
export default {
  name: "modeler_svg",
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
