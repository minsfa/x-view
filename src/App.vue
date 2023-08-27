<script setup>
import { resizeViews } from './scripts/cornerstone'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import * as dicomParser from 'dicom-parser'
import ImageViewer from './components/ImageViewer.vue'

cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;

window.addEventListener('resize', () => resizeViews());
</script>

<template>
    <ImageViewer />
</template>
