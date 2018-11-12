<template>
  <button @click="increment">{{value}}</button>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import { increment } from "./reducer";

export default {
  computed: mapState({
    value: state => state.remote.value
  }),
  methods: {
    increment() {
      // this.$store.commit("dipatch$remote", increment());
      this.$store.commit(increment());
    }
  }
};
</script>