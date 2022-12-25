import { Page } from '../../../helpers/Page';
import { ProductsController } from '../../controllers/productsController';

export class ProductPage extends Page {
    constructor(el: HTMLElement, id: string, productsController: ProductsController) {
        super(el, id, productsController);
    }

    render() {
        this.el.innerHTML = '';
    }
}
