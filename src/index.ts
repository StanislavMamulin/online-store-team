/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ProductsController } from './components/controllers/productsController';
import { CatalogPage } from './components/view/CatalogPage';
import './components/view/styles.css';

//@ts-ignore
window.createGame = () => new ProductsController();

const main = document.querySelector('main') as HTMLElement;
const body = new CatalogPage(main);
body.render();
