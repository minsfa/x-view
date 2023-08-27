<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { loadImage, unloadImage } from '../scripts/cornerstone'

const props = defineProps(['imageInfo', 'selected']);
const emits = defineEmits(['click']);
const view = ref(null);

onMounted(async () => {
    await loadImage(props.imageInfo, view.value);
});

onBeforeUnmount(() => {
    unloadImage(view.value);
});

function click() {
    emits('click', props.imageInfo);
}
</script>

<template>
    <div ref="view" class="image-view thumbnail" :class="{ 'image-view-selected': selected }" @click="click">
    </div>
</template>
