import { Page } from '../../../helpers/Page';
import { CartController } from '../../controllers/cartController';

export class ProductPage extends Page {
    constructor(el: HTMLElement, id: string, private cartController: CartController) {
        super(el, id);
    }

    render() {
        this.el.innerHTML = '';
    }
}
