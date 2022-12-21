/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ProductsController } from './components/controllers/productsController';
import { CatalogPage } from './components/view/CatalogPage/CatalogPage';
import './components/view/CatalogPage/styles.css';

//@ts-ignore
window.createGame = () => new ProductsController();

const main = document.querySelector('main') as HTMLElement;
const body = new CatalogPage(main);
body.render();
