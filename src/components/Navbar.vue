<template>
    <header class="flow-root w-screen h-12 bg-white items-center justify-between px-6 z-10">
        <div class="float-left justify-left font-bold">
            LAVAMAP
        </div>
        <!-- right -->
        <!-- Accounts Button & Dropdown -->
        <div class="float-right justify-right">
            <!-- MENU -->
            <div class="flex pt-2 pb-4" @click="shapeOpen = !shapeOpen">
                <!-- shape Name -->            
                <div class="vertical-divider m-3">Current Shape: {{ shapeName }}</div>
                <!-- shape Dropdown -->
                <shape-dropdown :shapes="shapes" v-if="shapeOpen" @closeMenu="closeMenus" @selectedShape="setShape"></shape-dropdown>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 m-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>        
        </div>
    </header>
</template>

<script lang="ts">
import {
    defineComponent,
    ref,
    inject,
    watch,
    Ref,
onMounted,
} from 'vue'
import ShapeDropdown from './ShapeDropdown.vue'

export default defineComponent({
    components: {
        ShapeDropdown
    },
    emits: ['setShape'],
    setup(props, {emit}) {        
        const shapes = [
            'Cube',
            'Tetrahedron',
            'Sphere'            
        ]
        let shapeName = ref('')
        
        const shapeOpen = ref(false);        

        function setShape(val: string) {
            console.log('val: ', val)
            shapeName.value = val
            emit('setShape', shapeName)
        }

        function closeMenus() {
            // un-highlight buttons
            document.getElementById('shape-dropdown-button')?.blur()
        }

        onMounted(() => {
            shapeName.value = shapes[0]
        })

        return {
            shapeName,
            shapes,
            shapeOpen,
            closeMenus,
            setShape
        }
    },
})
</script>
