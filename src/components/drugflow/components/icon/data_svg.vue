<template>
  <svg :width="width" :height="height" :fill="color" viewBox="128 128 768 768" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M954.88 337.92l-451.584-224.256L64 337.92l439.296 213.504L954.88 337.92z m-450.56-179.2l357.888 177.664-357.888 168.96-348.16-168.96 348.16-177.664z" p-id="8989" />
    <path d="M862.208 503.296h0.512l-358.4 169.472-348.16-169.472h0.512H66.56l-2.56 1.536 439.296 212.992 451.584-212.992-2.56-1.536z" p-id="8990" />
    <path d="M862.208 654.848h0.512l-358.4 169.472-348.16-169.472h0.512H66.56l-2.56 1.536 439.296 212.992 451.584-212.992-2.56-1.536z" p-id="8991" />
  </svg>
</template>

<script>
export default {
  name: "data_svg",
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
