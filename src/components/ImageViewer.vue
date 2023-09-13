<script setup>
import { ref, computed, onMounted, onUpdated } from 'vue'
import { getImageUrls } from '../scripts/services'
import { clamp } from '../scripts/math'
import { settings } from '../scripts/settings'
import { updateImageEx, resizeViews } from '../scripts/cornerstone'
import { annotationMode } from '../scripts/annotations'
import { ImageInfo } from '../scripts/imageInfo'
import LayoutDropdown from './LayoutDropdown.vue'
import ImageView from './ImageView.vue'
import ThumbnailView from './ThumbnailView.vue'

const imageInfos = ref([]);

onMounted(async () => {
    const urlParams = new URLSearchParams(window.location.search.toLowerCase());
    const studyId = urlParams.get('studyid');
    if (studyId) {
        const imageUrls = await getImageUrls(studyId);
        imageInfos.value = imageUrls.map(imageUrl => new ImageInfo(imageUrl));
    }
});

let toResizeViews;

onUpdated(() => {
    if (toResizeViews) {
        resizeViews();
        toResizeViews = false;
    }
});

const startImageIndex = ref(0);
const layout = ref([1, 1]);
const layoutCount = computed(() => layout.value[0] * layout.value[1]);
const gridTemplate = n => ((100 / n) + '% ').repeat(n);

function clickLayout(value) {
    layout.value = value;
    startImageIndex.value = clamp(startImageIndex.value, 0, Math.max(imageInfos.value.length - layoutCount.value, 0));
    validateStartImageIndex();
    restoreData = null;
    toResizeViews = true;
}

function* fullscaleImageInfos() {
    for (let i = 0; i < layoutCount.value; ++i) {
        yield imageInfos.value[startImageIndex.value + i];
    }
}

function thumbnailImageInfos() {
    return imageInfos.value;
}

const selectedImageIndex = ref(0);
const selectedImageInfo = computed(() => imageInfos.value[selectedImageIndex.value]);

function clickImage(value) {
    selectedImageIndex.value = imageInfos.value.indexOf(value);
}

function clickThumbnail(value) {
    selectedImageIndex.value = imageInfos.value.indexOf(value);
    validateStartImageIndex();
}

let restoreData = null;

function doubleClickImage(value) {
    if (!restoreData) {
        restoreData = [layout.value, startImageIndex.value];
        layout.value = [1, 1];
    }
    else {
        layout.value = restoreData[0];
        startImageIndex.value = restoreData[1];
        restoreData = null;
    }
    validateStartImageIndex();
    toResizeViews = true;
}

function validateStartImageIndex() {
    startImageIndex.value = clamp(startImageIndex.value, Math.max(selectedImageIndex.value - layoutCount.value + 1, 0), selectedImageIndex.value);
}

const mouseData = ref(null);

function updateMouseData(value) {
    mouseData.value = value;
}

function flipImageHorizontally() {
    transformImage(imageInfo => imageInfo.flip(true));
}

function flipImageVertically() {
    transformImage(imageInfo => imageInfo.flip(false));
}

function rotateImageLeft() {
    transformImage(imageInfo => imageInfo.rotate(-1));
}

function rotateImageRight() {
    transformImage(imageInfo => imageInfo.rotate(1));
}

function zoomImageIn() {
    transformImage(imageInfo => imageInfo.zoom(settings.zoomInFactor));
}

function zoomImageOut() {
    transformImage(imageInfo => imageInfo.zoom(settings.zoomOutFactor));
}

function resetImage() {
    transformImage(imageInfo => imageInfo.reset());
}

function transformImage(transformFunc) {
    transformFunc(selectedImageInfo.value);
    updateImageEx(selectedImageInfo.value);
}

function setAnnotationMode(name) {
    const propertyName = annotationMode.name != name ? 'set' + name : 'reset';
    annotationMode[propertyName]();
}

function clearAnnotations() {
    if (confirm('Clear annotations?')) {
        selectedImageInfo.value.annotations.length = 0;
        updateImageEx(selectedImageInfo.value);
    }
}
</script>

<template>
    <div>
        <div class="control-bar p-1">
            <LayoutDropdown @click="clickLayout" />
            <button class="btn" @click="flipImageHorizontally">
                <img src="../assets/flip-horz.png" />
            </button>
            <button class="btn" @click="flipImageVertically">
                <img src="../assets/flip-vert.png" />
            </button>
            <button class="btn" @click="rotateImageLeft">
                <img src="../assets/rotate-left.png" />
            </button>
            <button class="btn" @click="rotateImageRight">
                <img src="../assets/rotate-right.png" />
            </button>
            <button class="btn" @click="zoomImageIn">
                <img src="../assets/zoom-in.png" />
            </button>
            <button class="btn" @click="zoomImageOut">
                <img src="../assets/zoom-out.png" />
            </button>
            <button class="btn" @click="resetImage">
                <img src="../assets/home.png" />
            </button>
            <button class="btn" :class="{ active: annotationMode.name == 'Line' }" @click="setAnnotationMode('Line')">
                <img src="../assets/line.png" />
            </button>
            <button class="btn" :class="{ active: annotationMode.name == 'Rectangle' }"
                @click="setAnnotationMode('Rectangle')">
                <img src="../assets/rectangle.png" />
            </button>
            <button class="btn" @click="clearAnnotations">
                <img src="../assets/delete-pen.png" />
            </button>
            <div class="mouse-data">
                <div>X: {{ mouseData?.x }}</div>
                <div>Y: {{ mouseData?.y }}</div>
                <div>{{ mouseData?.value ?? '&nbsp;' }}</div>
            </div>
        </div>
        <div class="image-grid"
            :style="{ gridTemplateRows: gridTemplate(layout[0]), gridTemplateColumns: gridTemplate(layout[1]) }">
            <ImageView v-for="imageInfo in fullscaleImageInfos()" :key="imageInfo?.url" :imageInfo="imageInfo"
                :selected="imageInfo && imageInfo == selectedImageInfo" @click="clickImage" @doubleClick="doubleClickImage"
                @mouseUpdate="updateMouseData" />
        </div>
        <div class="thumbnail-bar">
            <ThumbnailView v-for="imageInfo in thumbnailImageInfos()" :key="imageInfo.url" :imageInfo="imageInfo"
                :selected="imageInfo == selectedImageInfo" @click="clickThumbnail" />
        </div>
    </div>
</template>

<style scoped>
.control-bar {
    float: left;
    width: v-bind('settings.controlBarWidth');
}

.mouse-data {
    position: absolute;
    bottom: 0px;
    user-select: none;
}

.thumbnail-bar {
    float: left;
    width: v-bind('settings.thumbnailBarWidth');
    height: 100vh;
    padding: v-bind('settings.imagePadding');
    overflow-x: hidden;
    overflow-y: scroll;
}

.image-grid {
    float: left;
    width: v-bind('settings.imageGridWidth');
    height: 100vh;
    padding: v-bind('settings.imagePadding');
    display: grid;
}

.image-view {
    background-color: black;
    border-color: white;
    border-style: solid;
    border-width: v-bind('settings.selectionBorderWidth');
}

.image-view-selected {
    border-color: aqua;
}

.thumbnail {
    width: v-bind('settings.thumbnailSize');
    height: v-bind('settings.thumbnailSize');
}
</style>
