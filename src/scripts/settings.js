import { reactive, watch } from 'vue'
import VueCookies from 'vue-cookies'

export const settings = {
    storageUrl: 'http://localhost:5100',
    controlBarWidth: '65px',
    scrollBarWidth: '14px',
    imagePadding: '2px',
    thumbnailSize: '100px',
    get thumbnailBarWidth() {
        return `calc(${this.thumbnailSize} + ${this.imagePadding} * 2 + ${this.scrollBarWidth})`;
    },
    get imageGridWidth() {
        return `calc(100% - ${this.controlBarWidth} - ${this.thumbnailBarWidth})`;
    },
    selectionBorderWidth: '4px',
    zoomStep: 0.2,
    get zoomInFactor() {
        return 1 + this.zoomStep;
    },
    get zoomOutFactor() {
        return 1 / this.zoomInFactor;
    },
    annotationMinDragDistance: 5
};

export const cookieSettings = reactive(VueCookies.get('settings') ?? {
    showInfo: true
});

watch(cookieSettings, value => VueCookies.set('settings', value));
