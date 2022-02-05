<template>
  <div id="shape-dropdown" class="absolute top-11 overflow-hidden medium-gray-border dark-medium-gray-bg z-10 py-1">
    <a v-for="(shape, index) in navbarShapes" :key="index" class="block text-white hover:text-switchRed p-1 px-2">
        <span @click="emitShape(shape as string)">
            {{shape}}
        </span>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
  props: {
    shapes: {
      type: Array,
      required: true
    }
  },
  emits: ['closeMenu', 'selectedShape'],
  setup(props, {emit}) {
    
    const navbarShapes = toRef(props, 'shapes').value
    
    const selectedShape = ref('Cube')

    function emitShape(shape: string) {
        selectedShape.value = shape
        emit('selectedShape', selectedShape.value)
    }

    function close(event: Event) {
      if ((event.target as HTMLElement).id !== 'shape-dropdown') {
        emit('closeMenu')
      }
    }

    // This eventListener handling is the whole reason for the component
    onMounted(() => {
      document.addEventListener('click', close, true)
      console.log('ns: ', navbarShapes)
    })

    onUnmounted(() => {
      document.removeEventListener('click', close, true)
    })

    return {
      navbarShapes,
      selectedShape,
      emitShape
    }
  },
})
</script>
