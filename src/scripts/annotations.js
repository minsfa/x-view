import { reactive } from 'vue'
import { settings } from './settings'
import * as cornerstone from 'cornerstone-core'
import { Point } from './point'

export const annotationMode = reactive({
    name: null,
    reset() {
        this.name = null;
        this.drawDesigner = null;
    },
    setLine() {
        this.name = 'Line';
        this.drawDesigner = new LineDrawDesigner(() => new Line());
    },
    setRectangle() {
        this.name = 'Rectangle';
        this.drawDesigner = new LineDrawDesigner(() => new Rectangle());
    }
});

class Line {
    draw(context, pixelSpacing) {
        const v = Point.subtract(this.endPoint, this.startPoint);

        context.beginPath();
        context.moveTo(this.startPoint.x, this.startPoint.y);
        context.lineTo(this.endPoint.x, this.endPoint.y);
        context.stroke();

        context.textBaseline = v.x * v.y > 0 ? 'bottom' : 'top';
        context.textAlign = 'left';
        const distance = v.distance * pixelSpacing;
        const textPoint = Point.middle(this.startPoint, this.endPoint);
        context.fillText(distance.toFixed(2) + ' mm', textPoint.x, textPoint.y);
    }
}

class Rectangle {
    draw(context, pixelSpacing) {
        const v = Point.subtract(this.endPoint, this.startPoint);

        context.beginPath();
        context.rect(this.startPoint.x, this.startPoint.y, v.x, v.y);
        context.stroke();

        context.textBaseline = 'middle';
        context.textAlign = 'center';
        const area = Math.abs(v.x) * Math.abs(v.y) * pixelSpacing * pixelSpacing;
        const textPoint = Point.middle(this.startPoint, this.endPoint);
        context.fillText(area.toFixed(2) + ' mm\xb2', textPoint.x, textPoint.y);
    }
}

class LineDrawDesigner {
    constructor(createAnnotation) {
        this.createAnnotation = createAnnotation;
        this.clickPoint = null;
    }

    mouseDown(event) {
        if ((event.buttons & 1) == 0) {
            return;
        }

        this.clickPoint = new Point(event.clientX, event.clientY);
        return true;
    }

    mouseUp(event) {
        if (!this.clickPoint) {
            return;
        }

        this.annotation = undefined;
        return true;
    }

    mouseMove(event) {
        if ((event.buttons & 1) == 0) {
            this.clickPoint = null;
            this.annotation = undefined;
        }

        if (!this.clickPoint) {
            return;
        }

        const view = event.currentTarget;

        const movePoint = new Point(event.clientX, event.clientY);
        if (!this.annotation) {
            if (Point.subtract(movePoint, this.clickPoint).distance < settings.annotationMinDragDistance) {
                return true;
            }
            this.annotation = this.createAnnotation();
            view.imageInfo.annotations.push(this.annotation);
            this.annotation.startPoint = this.pageToPoint(view, this.clickPoint);
        }
        this.annotation.endPoint = this.pageToPoint(view, movePoint);

        cornerstone.invalidate(view);
        return true;
    }

    pageToPoint(view, point) {
        const pixel = cornerstone.pageToPixel(view, point.x, point.y);
        return new Point(pixel.x, pixel.y);
    }
}
