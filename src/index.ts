import { ProductsController } from './components/controllers/productsController';
import { CatalogPage } from './components/view/CatalogPage/CatalogPage';
import { Page } from './helpers/Page';
import { CartPage } from './components/view/CartPage/CartPage';
import { ProductPage } from './components/view/ProductPage/ProductPage';
import { ErrorPage } from './components/view/ErrorPage/ErrorPage';
import { PageIds } from './helpers/constants';
import './components/view/CatalogPage/styles.css';
import './components/view/ErrorPage/error.css';
import { CartController } from './components/controllers/cartController';
import { Header } from './components/view/Header/Header';

class App {
    private static productsController = new ProductsController();
    private static headerView = new Header();
    private static cartController = new CartController(App.headerView);
    private static container: HTMLElement = document.querySelector('main') as HTMLElement;

    private header: HTMLElement;

    private enableRouteChange() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                App.renderNewPage(hash);
            }
        });
    }

    static renderNewPage(idPage: string) {
        let page: Page | null = null;

        if (idPage === PageIds.CatalogPage) {
            page = new CatalogPage(this.container, idPage, this.productsController, this.cartController);
        } else if (idPage === PageIds.CartPage) {
            page = new CartPage(this.container, idPage, this.cartController);
        } else if (idPage === PageIds.ProductPage) {
            page = new ProductPage(this.container, idPage, this.cartController);
        } else {
            page = new ErrorPage(this.container, PageIds.ErrorPage);
        }

        if (page) {
            page.render();
        }
    }

    constructor() {
        const header = new Header();
        this.header = header.createHeader();
    }

    run() {
        App.renderNewPage('catalog');
        App.container.before(this.header);
        this.enableRouteChange();
    }
}

const body = new App();
body.run();
