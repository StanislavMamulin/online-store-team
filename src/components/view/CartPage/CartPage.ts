import { Page } from '../../../helpers/Page';

export class CartPage extends Page {
    constructor(el: HTMLElement, id: string) {
        super(el, id);
    }

    render() {
        this.el.innerHTML = '';
    }
}
