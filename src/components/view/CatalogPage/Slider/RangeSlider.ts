import 'nouislider/dist/nouislider.css';
import { createDiv } from '../../../../helpers/createHTMLElements';
import * as noUiSlider from 'nouislider';

export type SliderValues = (string | number)[];

export class RangeSlider {
    public sliderElement: noUiSlider.target;
    constructor(from: number, to: number, className: string) {
        const dualSlider = createDiv(className);

        noUiSlider.create(dualSlider, {
            start: [from, to],
            range: {
                min: from,
                max: to,
            },
        });

        this.sliderElement = dualSlider as noUiSlider.target;
    }

    public value() {
        return this.sliderElement.noUiSlider?.get();
    }

    public setValues(min: number, max: number) {
        this.sliderElement.noUiSlider?.set([min, max]);
    }

    public addHandler(onChange: (values: SliderValues) => void): void {
        this.sliderElement.noUiSlider?.on('update', onChange);
    }
}
