import { clamp } from './math'
import * as cornerstone from 'cornerstone-core'

export async function loadImage(imageInfo, view) {
    const image = await cornerstone.loadImage('wadouri:' + imageInfo.url);
    cornerstone.enable(view);
    cornerstone.displayImage(view, image);
    view.imageInfo = imageInfo;

    imageInfo.windowWidth ??= image.windowWidth;
    imageInfo.windowCenter ??= image.windowCenter;
    imageInfo.pixelSpacing ??= image.rowPixelSpacing;
    imageInfo.rescaleSlope ??= image.data.floatString('x00281053') ?? 1;
    imageInfo.rescaleIntercept ??= image.data.floatString('x00281052') ?? 0;

    updateImage(view);
    return image;
}

export function unloadImage(view) {
    cornerstone.disable(view);
}

export function resizeViews() {
    const views = cornerstone.getEnabledElements().map(view => view.element).filter(view => !isThumbnail(view) && view.imageInfo);
    views.forEach(view => {
        cornerstone.resize(view);
        updateImage(view);
    });
}

const isThumbnail = view => view.classList.contains('thumbnail');

export function updateImage(view) {
    const viewport = cornerstone.getViewport(view);

    viewport.hflip = view.imageInfo.flipX;
    viewport.vflip = view.imageInfo.flipY;
    viewport.rotation = view.imageInfo.rotation * 90;
    if (!isThumbnail(view)) {
        viewport.scale = view.imageInfo.zoomFactor * getMinScale(view);
        validateOffset(view, viewport);
        viewport.translation.x = view.imageInfo.offsetX;
        viewport.translation.y = view.imageInfo.offsetY;
    }
    viewport.voi.windowWidth = view.imageInfo.windowWidth;
    viewport.voi.windowCenter = view.imageInfo.windowCenter;

    cornerstone.setViewport(view, viewport);
}

function getMinScale(view) {
    const imageSize = getImageSize(view);
    return Math.min(view.clientWidth / imageSize.width, view.clientHeight / imageSize.height);
}

export function getScale(view) {
    const viewport = cornerstone.getViewport(view);
    return viewport.scale;
}

function validateOffset(view, viewport) {
    const imageSize = getImageSize(view);
    const limitX = (imageSize.width * viewport.scale - view.clientWidth) / 2 / viewport.scale;
    const limitY = (imageSize.height * viewport.scale - view.clientHeight) / 2 / viewport.scale;
    view.imageInfo.offsetX = limitX > 0 ? clamp(view.imageInfo.offsetX, -limitX, limitX) : 0;
    view.imageInfo.offsetY = limitY > 0 ? clamp(view.imageInfo.offsetY, -limitY, limitY) : 0;
}

function getImageSize(view) {
    const image = cornerstone.getImage(view);
    return {
        width: view.imageInfo.rotation % 2 == 0 ? image.width : image.height,
        height: view.imageInfo.rotation % 2 == 0 ? image.height : image.width
    };
}

export function updateImageEx(imageInfo) {
    const views = cornerstone.getEnabledElementsByImageId('wadouri:' + imageInfo.url).map(view => view.element);
    views.forEach(view => {
        updateImage(view);
    });
}

export function getMouseData(view, image, x, y) {
    const pixelData = image.getPixelData();
    const mouseData = cornerstone.pageToPixel(view, x, y);
    mouseData.x = Math.round(mouseData.x);
    mouseData.y = Math.round(mouseData.y);
    if (mouseData.x >= 0 && mouseData.x < image.width && mouseData.y >= 0 && mouseData.y < image.height) {
        mouseData.value = pixelData[x + y * image.width];
        return mouseData;
    }
    return null;
}

export function addRenderer(view) {
    view.addEventListener('cornerstoneimagerendered', imageRendered)
}

export function removeRenderer(view) {
    view.removeEventListener('cornerstoneimagerendered', imageRendered)
}

function imageRendered(event) {
    const view = event.target;
    const scale = getScale(view);

    const context = event.detail.canvasContext;
    context.strokeStyle = 'yellow';
    context.lineWidth = 1 / scale;
    context.fillStyle = 'yellow';
    context.font = `${16 / scale}px sans-serif`;
    context.shadowColor = 'black';
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 1;
    view.imageInfo.annotations.forEach(annotation => annotation.draw(context, view.imageInfo.pixelSpacing));
}
