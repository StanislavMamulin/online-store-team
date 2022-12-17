import { ProductsController } from '../controllers/productsController';
import { IProduct } from '../types';

export class CatalogPage {
    constructor(private el: HTMLElement) {}
    productsController: ProductsController = new ProductsController();

    public render() {
        this.el.innerHTML = '';
        const productsItems = this.renderCards();
        this.el.append(productsItems);
    }

    private createDiv(className: string): HTMLElement {
        const div = document.createElement('div');
        div.classList.add(className);
        return div;
    }

    private createCardInfoText(field: string, value: string): HTMLElement {
        const p = document.createElement('p');
        p.innerText = field;
        const span = document.createElement('span');
        span.innerText = value;
        p.appendChild(span);
        return p;
    }

    private createCardInfoTexts(obj: IProduct): HTMLElement {
        const div = this.createDiv('card-info-item');
        const categoryInfo = this.createCardInfoText('category', obj.category);
        const brandInfo = this.createCardInfoText('brand', obj.brand);
        const priceInfo = this.createCardInfoText('price', `€${obj.price}`);
        const discountInfo = this.createCardInfoText('discount', `${obj.discountPercentage}%`);
        const ratingInfo = this.createCardInfoText('rating', String(obj.rating));
        const stockInfo = this.createCardInfoText('stock', String(obj.stock));
        div.append(categoryInfo, brandInfo, priceInfo, discountInfo, ratingInfo, stockInfo);
        return div;
    }

    private renderCard(obj: IProduct): HTMLElement {
        const cardWrapper = this.createDiv('card-wrapper');
        const cardText = this.createDiv('card-text');
        const cardTitle = this.createDiv('card-title');
        const cardInfo = this.createDiv('card-info');
        const cardInfoItem = this.createCardInfoTexts(obj);
        cardInfo.append(cardInfoItem);
        cardText.append(cardTitle, cardInfo);
        cardWrapper.append(cardText);
        return cardWrapper;
    }

    private renderCards(): HTMLElement {
        const productsItems = this.createDiv('products-items');
        for (const product of this.productsController.filteredProducts) {
            const card = this.renderCard(product);
            productsItems.append(card);
        }
        return productsItems;
    }
}
