<template>  
  <navbar id="navbar" @setShape="provideShape"></navbar>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, onMounted, provide, ref, Ref } from "vue";
import Navbar from '@/components/Navbar.vue'

export default defineComponent({
  components: {
    Navbar
  },
  setup() {
    function provideShape(val: Ref) {
      console.log('val on App: ', val)
      provide('selectedShape', val)
    }
    onMounted(() => {
      console.log('we out here')
      provideShape(ref('Cube'))
    })
    return {
      provideShape      
    }
  }
})
</script>

<style>
body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>