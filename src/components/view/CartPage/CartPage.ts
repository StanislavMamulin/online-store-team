import { Page } from '../../../helpers/Page';
import { CartController } from '../../controllers/cartController';
import { ProductsController } from '../../controllers/productsController';

export class CartPage extends Page {
    constructor(el: HTMLElement, id: string, productsController: ProductsController, cartController: CartController) {
        super(el, id, productsController, cartController);
    }

    render() {
        this.el.innerHTML = '';
    }
}
