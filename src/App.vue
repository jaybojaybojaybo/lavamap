<template>  
  <navbar id="navbar" @setShape="provideShape" @setMode="provideMode" @saveEdit="saveEdit"></navbar>
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
    // MODES
    const selectedMode = ref<string>('')
    function provideMode(val: Ref<string>) {
      console.log('mode on App: ', val.value)
      selectedMode.value = val.value
    }   
    let isEdit = ref(false)
    function saveEdit() {
      console.log('edits have been saved, exit edit mode')
      isEdit.value = false
    }
    // SHAPES
    const selectedShape = ref<string>('')
    function provideShape(val: Ref<string>) {
      console.log('shape on App: ', val.value)
      selectedShape.value = val.value
    }
    provide('selectedShape', selectedShape)
    provide('selectedMode', selectedMode)
    provide('saveEdit', false)
    provide('isEdit', isEdit)
    return {
      provideShape,
      provideMode,
      saveEdit
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