<template>
    <header class="flow-root w-screen h-12 bg-white items-center justify-between px-6 z-10">
        <div class="float-left justify-left font-bold">
            LAVAMAP
        </div>
        <!-- left -->
        <!-- MODES -->
        <div class="float-right justify-right">
            <!-- MENU -->
            <div class="flex pt-2 pb-4" @click="modeOpen = !modeOpen">
                <!-- mode Name -->            
                <div class="vertical-divider m-3">Current Mode: {{ selectedMode }}</div>
                <!-- mode Dropdown -->
                <mode-dropdown :modes="modes" v-if="modeOpen" @closeMenu="closeMenus" @selectedMode="setMode"></mode-dropdown>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 m-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <button class="bg-transparent hover:bg-black text-black font-semibold hover:text-white h-7 px-2 border border-blue-500 hover:border-transparent rounded" 
                        v-if="isEdit" 
                        @click="saveEdit">
                    Save
                </button>     
            </div>
        </div>
        <!-- right -->
        <!-- SHAPES -->
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
        <div class="float-right justify-left text-black h-6 pt-5 mr-3">a=add, e=edit, d=delete, t=translate, r=rotate, s=scale</div>
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
import ModeDropdown from './ModeDropdown.vue'

export default defineComponent({
    components: {
        ShapeDropdown,
        ModeDropdown
    },
    emits: ['setMode', 'setShape', 'saveEdit'],
    setup(props, {emit}) {
        // MODES
        const modes = [
            'Add',
            'Edit',
            'Delete'            
        ]
        const modeOpen = ref(false);        
        let isEdit = ref(inject('isEdit'))
        const selectedMode = ref(inject('selectedMode') as string)
        function setMode(val: string) {
            console.log('val: ', val)
            if (val === 'Edit') {
                isEdit.value = true
            }
            selectedMode.value = val
            emit('setMode', selectedMode)
        }
        // SHAPES
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

        function saveEdit() {
            console.log('in Navbar and saving')
            emit('saveEdit')
        }

        onMounted(() => {
            isEdit.value = false
            setMode(selectedMode.value = modes[0])
            setShape(shapeName.value = shapes[0])
        })

        return {
            selectedMode,
            modes,
            modeOpen,
            setMode,
            shapeName,
            shapes,
            shapeOpen,
            setShape,
            closeMenus,
            isEdit,
            saveEdit
        }
    },
})
</script>
