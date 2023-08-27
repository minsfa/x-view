<script setup>
import { settings } from '../scripts/settings'

const props = defineProps(['imageInfo', 'dataset']);

function renderTag(tag, format) {
    let text = props.dataset?.string(tag);
    if (format && text) {
        text = format(text);
    }
    return text ? text + ' <br />' : '';
}

const dateFormat = text => new Date(text.substr(0, 4) + '-' + text.substr(4, 2) + '-' + text.substr(6, 2)).toLocaleDateString();
</script>

<template>
    <div class="overlay left-top">
        <span v-html="renderTag('x00080080')"></span>
        <span v-html="renderTag('x00100010')"></span>
        <span v-html="renderTag('x00100020')"></span>
        <span v-html="renderTag('x00080090')"></span>
    </div>
    <div class="overlay right-top">
        <span v-html="renderTag('x00081090')"></span>
        <span v-html="renderTag('x00080020', dateFormat)"></span>
        <span v-html="renderTag('x00081030')"></span>
        <span v-html="renderTag('x00081070')"></span>
        <span v-html="renderTag('x00200010')"></span>
        <span v-html="renderTag('x00080050')"></span>
    </div>
    <div class="overlay left-bottom">
        <span v-html="renderTag('x00080060')"></span>
        <span v-html="renderTag('x0008103e')"></span>
        <span v-html="renderTag('x00181030')"></span>
        {{ Math.round(imageInfo.zoomFactor * 100) }}%
        <br />
        W {{ Math.round(imageInfo.windowWidth) }} L {{ Math.round(imageInfo.windowCenter) }}
    </div>
</template>

<style scoped>
.overlay {
    position: absolute;
    color: yellow;
    text-shadow: 1px 1px black;
    user-select: none;
}

.left-top {
    left: v-bind('settings.imagePadding');
    top: v-bind('settings.imagePadding');
}

.right-top {
    right: v-bind('settings.imagePadding');
    top: v-bind('settings.imagePadding');
    text-align: right;
}

.left-bottom {
    left: v-bind('settings.imagePadding');
    bottom: v-bind('settings.imagePadding');
}

.right-bottom {
    right: v-bind('settings.imagePadding');
    bottom: v-bind('settings.imagePadding');
    text-align: right;
}
</style>
