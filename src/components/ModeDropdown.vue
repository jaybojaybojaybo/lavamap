<template>
  <div id="mode-dropdown" class="absolute top-11 overflow-hidden medium-gray-border dark-medium-gray-bg z-10 py-1">
    <a v-for="(mode, index) in navbarModes" :key="index" class="block text-white hover:text-switchRed p-1 px-2">
        <span @click="emitMode(mode as string)">
            {{mode}}
        </span>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRef, onMounted, onUnmounted, ref } from 'vue'

export default defineComponent({
  props: {
    modes: {
      type: Array,
      required: true
    }
  },
  emits: ['closeMenu', 'selectedMode'],
  setup(props, {emit}) {
    
    const navbarModes = toRef(props, 'modes').value
    
    const selectedMode = ref('Cube')

    function emitMode(mode: string) {
        selectedMode.value = mode
        emit('selectedMode', selectedMode.value)
    }

    function close(event: Event) {
      if ((event.target as HTMLElement).id !== 'mode-dropdown') {
        emit('closeMenu')
      }
    }

    // This eventListener handling is the whole reason for the component
    onMounted(() => {
      document.addEventListener('click', close, true)
      console.log('ns: ', navbarModes)
    })

    onUnmounted(() => {
      document.removeEventListener('click', close, true)
    })

    return {
      navbarModes,
      selectedMode,
      emitMode
    }
  },
})
</script>
