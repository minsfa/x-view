export class ImageInfo {
    constructor(url) {
        this.url = url;
        this.annotations = [];
        this.reset();
    }

    reset() {
        this.flipX = false;
        this.flipY = false;
        this.rotation = 0;
        this.zoomFactor = 1;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    flip(horizontal) {
        if (this.rotation % 2 != 0) {
            horizontal ^= true;
        }

        if (horizontal) {
            this.flipX ^= true;
        }
        else {
            this.flipY ^= true;
        }
    }

    rotate(direction) {
        this.rotation = (this.rotation + direction + 4) % 4;
    }

    zoom(factor) {
        this.zoomFactor = Math.max(this.zoomFactor * factor, 1);
    }

    rescalePixelValue = value => value * this.rescaleSlope + this.rescaleIntercept;
}
