import 'nouislider/dist/nouislider.css';
import { createDiv } from '../../../../helpers/createHTMLElements';
import * as noUiSlider from 'nouislider';

export type SliderValues = (string | number)[];

export class RangeSlider {
    public sliderElement: noUiSlider.target;

    constructor(values: number[], className: string) {
        const rangeSlider = createDiv(className);
        const from = values[0];
        const to = values[values.length - 1];

        const format = {
            to: function (value: number) {
                return values[Math.round(value)];
            },
            from: function (value: string) {
                return values.indexOf(Number(value));
            },
        };

        noUiSlider.create(rangeSlider, {
            start: [from, to],
            range: {
                min: 0,
                max: values.length - 1,
            },
            step: 1,
            format: format,
        });

        this.sliderElement = rangeSlider as noUiSlider.target;
    }

    public value() {
        return this.sliderElement.noUiSlider?.get();
    }

    public setValues(min: number, max: number) {
        this.sliderElement.noUiSlider?.set([min, max]);
    }

    public addHandler(onChange: (values: SliderValues) => void): void {
        this.sliderElement.noUiSlider?.on('slide', onChange);
    }
}
