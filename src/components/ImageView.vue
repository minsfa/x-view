<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { settings } from '../scripts/settings'
import { loadImage, unloadImage, addRenderer, removeRenderer, updateImageEx, getScale, getMouseData } from '../scripts/cornerstone'
import { annotationMode } from '../scripts/annotations'
import { Point } from '../scripts/point'
import ImageOverlay from './ImageOverlay.vue'

const props = defineProps(['imageInfo', 'selected']);
const emits = defineEmits(['click', 'doubleClick', 'mouseUpdate']);
const view = ref(null);
let image;
const dataset = ref(null);

onMounted(async () => {
    if (!props.imageInfo) {
        return;
    }

    addRenderer(view.value);
    image = await loadImage(props.imageInfo, view.value);
    dataset.value = image.data;
});

onBeforeUnmount(() => {
    if (!props.imageInfo) {
        return;
    }

    removeRenderer(view.value);
    unloadImage(view.value);
});

function click() {
    if (!props.imageInfo) {
        return;
    }

    emits('click', props.imageInfo);
}

function doubleClick() {
    if (!props.imageInfo) {
        return;
    }

    emits('doubleClick', props.imageInfo);
}

let lastDragPoint = null;

function mouseDown(event) {
    if (!props.imageInfo) {
        return;
    }

    if (annotationMode.drawDesigner?.mouseDown(event)) {
        return;
    }

    lastDragPoint = new Point(event.clientX, event.clientY);
}

function mouseUp(event) {
    if (!props.imageInfo) {
        return;
    }

    if (annotationMode.drawDesigner?.mouseUp(event)) {
        return;
    }

    lastDragPoint = null;
}

function mouseMove(event) {
    if (!props.imageInfo) {
        return;
    }

    if (annotationMode.drawDesigner?.mouseMove(event)) {
        return;
    }

    if ((event.buttons & 3) == 0) {
        lastDragPoint = null;
    }

    if (lastDragPoint) {
        switch (event.buttons) {
            case 1:
                var scale = getScale(view.value);
                props.imageInfo.offsetX += (event.clientX - lastDragPoint.x) / scale;
                props.imageInfo.offsetY += (event.clientY - lastDragPoint.y) / scale;
                updateImageEx(props.imageInfo);
                break;
            case 2:
                props.imageInfo.windowWidth -= (event.clientX - lastDragPoint.x) * 10;
                props.imageInfo.windowCenter += (event.clientY - lastDragPoint.y) * 10;
                updateImageEx(props.imageInfo);

                emits('click', props.imageInfo);
                break;
        }
        lastDragPoint = new Point(event.clientX, event.clientY);
    }

    if (image) {
        const mouseData = getMouseData(view.value, image, event.clientX, event.clientY);
        if (mouseData) {
            mouseData.value = props.imageInfo.rescalePixelValue(mouseData.value);
        }
        emits('mouseUpdate', mouseData);
    }
}

function mouseLeave() {
    emits('mouseUpdate', null);
}

function wheel(event) {
    if (!props.imageInfo) {
        return;
    }

    props.imageInfo.zoom(event.deltaY < 0 ? settings.zoomInFactor : settings.zoomOutFactor);
    updateImageEx(props.imageInfo);

    emits('click', props.imageInfo);
}
</script>

<template>
    <div ref="view" class="image-view" :class="{ 'image-view-selected': selected }" style="position: relative;"
        oncontextmenu="return false" @click="click" @dblclick="doubleClick" @mousedown="mouseDown" @mouseup="mouseUp"
        @mousemove="mouseMove" @mouseleave="mouseLeave" @wheel="wheel">
        <ImageOverlay v-if="dataset" :imageInfo="imageInfo" :dataset="dataset" />
    </div>
</template>
