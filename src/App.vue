<template>  
  <router-view/>
</template>

<script lang="ts">
import { onMounted } from "vue";

export default {
  setup() {
    onMounted(() => {
      console.log('we out here')
    })
  }
}
</script>

<style>
body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>