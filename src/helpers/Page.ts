import { ProductsController } from '../components/controllers/productsController';

export abstract class Page {
    constructor(protected el: HTMLElement, id: string, protected productsController: ProductsController) {
        this.el.id = id;
    }

    render() {
        this.el.innerHTML = '';
    }
}
