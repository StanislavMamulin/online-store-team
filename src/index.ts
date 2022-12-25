/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ProductsController } from './components/controllers/productsController';
import { CatalogPage } from './components/view/CatalogPage/CatalogPage';
import { createHeader } from './helpers/createHTMLElements';
import { Page } from './helpers/Page';
import { CartPage } from './components/view/CartPage/CartPage';
import { ProductPage } from './components/view/ProductPage/ProductPage';
import { ErrorPage } from './components/view/ErrorPage/ErrorPage';
import { PageIds } from './helpers/constants';
import './components/view/CatalogPage/styles.css';
import './components/view/ErrorPage/error.css';

//@ts-ignore
window.createGame = () => new ProductsController();

// const main = document.querySelector('main') as HTMLElement;
// const body = new CatalogPage(main);
// body.render();

class App {
    private static container: HTMLElement = document.querySelector('main') as HTMLElement;

    private initialPage: CatalogPage;
    private header: HTMLElement;

    private enableRouteChange() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            App.renderNewPage(hash);
        });
        window.addEventListener('load', () => {
            const hash = window.location.hash.slice(1);
            App.renderNewPage(hash);
        });
    }

    static renderNewPage(idPage: string) {
        let page: Page | null = null;

        if (idPage === PageIds.CatalogPage) {
            page = new CatalogPage(this.container, idPage);
        } else if (idPage === PageIds.CartPage) {
            page = new CartPage(this.container, idPage);
        } else if (idPage === PageIds.ProductPage) {
            page = new ProductPage(this.container, idPage);
        } else {
            page = new ErrorPage(this.container, PageIds.ErrorPage);
        }

        if (page) {
            page.render();
        }
    }

    constructor() {
        this.header = createHeader(0, 0);
        this.initialPage = new CatalogPage(App.container, 'catalog');
    }

    run() {
        App.renderNewPage('catalog');
        App.container.before(this.header);
        this.enableRouteChange();
    }
}

const body = new App();
body.run();
