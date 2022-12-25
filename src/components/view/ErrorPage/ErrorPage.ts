import { createDiv } from '../../../helpers/createHTMLElements';
import { Page } from '../../../helpers/Page';
import { ProductsController } from '../../controllers/productsController';

export class ErrorPage extends Page {
    constructor(el: HTMLElement, id: string, productsController: ProductsController) {
        super(el, id, productsController);
    }

    render() {
        this.el.innerHTML = '';
        const errorContainer = createDiv('error-container');
        const errorTitle = document.createElement('h1');
        errorTitle.innerText = 'PAGE NOT FOUND (404)';
        errorContainer.append(errorTitle);
        this.el.append(errorContainer);
    }
}
