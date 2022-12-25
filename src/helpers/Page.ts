import { CartController } from '../components/controllers/cartController';
import { ProductsController } from '../components/controllers/productsController';

export abstract class Page {
    constructor(
        protected el: HTMLElement,
        id: string,
        protected productsController: ProductsController,
        protected cartController: CartController
    ) {
        this.el.id = id;
    }

    render() {
        this.el.innerHTML = '';
    }
}
