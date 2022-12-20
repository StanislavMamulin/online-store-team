import { ProductsController } from '../controllers/productsController';
import { IProduct } from '../types';

export class CatalogPage {
    constructor(private el: HTMLElement) {}
    productsController: ProductsController = new ProductsController();

    public render() {
        this.el.innerHTML = '';
        const cardsBlock = this.createCardsBlock();
        this.el.append(cardsBlock);
    }

    private createDiv(className: string): HTMLElement {
        const div = document.createElement('div');
        div.classList.add(className);
        return div;
    }

    private createCardInfoText(field: string, value: string): HTMLElement {
        const p = document.createElement('p');
        p.innerText = `${field}:`;
        const span = document.createElement('span');
        span.innerText = ` ${value}`;
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

    private createCardButtons(): HTMLElement {
        const block = this.createDiv('card-buttons');
        const buttonAdd = document.createElement('button');
        buttonAdd.innerText = 'ADD TO CART';
        const buttonDetails = document.createElement('button');
        buttonDetails.innerText = 'DETAILS';
        block.append(buttonAdd, buttonDetails);
        return block;
    }

    private renderCard(obj: IProduct): HTMLElement {
        const cardWrapper = this.createDiv('card-wrapper');
        cardWrapper.style.background = `url("${obj.thumbnail}") 0% 0% / cover`;
        const cardButtons = this.createCardButtons();
        const cardText = this.createDiv('card-text');
        const cardTitle = this.createDiv('card-title');
        cardTitle.innerText = obj.title;
        const cardInfo = this.createDiv('card-info');
        const cardInfoItem = this.createCardInfoTexts(obj);
        cardInfo.append(cardInfoItem);
        cardText.append(cardTitle, cardInfo);
        cardWrapper.append(cardText, cardButtons);
        return cardWrapper;
    }

    private createSortOptionsBar(): HTMLElement {
        const sortOptionsBar = this.createDiv('sort-bar');
        const barSelection = document.createElement('select');
        sortOptionsBar.append(barSelection);

        return sortOptionsBar;
    }

    private createFoundCount(): HTMLElement {
        const foundCount = this.createDiv('found-count');
        foundCount.innerText = 'Found:';

        return foundCount;
    }

    private createSearchBar(): HTMLElement {
        const searchBar = this.createDiv('search-bar');
        const searchInput = document.createElement('input');
        searchInput.type = 'search';
        searchInput.placeholder = 'Search product';
        searchBar.append(searchInput);

        searchInput.addEventListener('input', (e: Event) => {
            this.productsController.searchProduct((e.target as HTMLInputElement).value);
            this.renderCards();
        });

        return searchBar;
    }

    private createViewMode(): HTMLElement {
        const viewMode = this.createDiv('view-mode');

        const smallV = this.createDiv('small-v');
        for (let i = 0; i < 36; i++) {
            const smallDot = this.createDiv('small-dot');
            smallDot.innerText = '.';
            smallV.append(smallDot);
        }

        const bigV = this.createDiv('big-v');
        for (let i = 0; i < 16; i++) {
            const bigDot = this.createDiv('big-dot');
            bigDot.innerText = '.';
            bigV.append(bigDot);
        }
        viewMode.append(smallV, bigV);

        return viewMode;
    }

    private createCardsSortRow(): HTMLElement {
        const block = this.createDiv('products-sort');

        const sortOptionsBar = this.createSortOptionsBar();
        const foundCount = this.createFoundCount();
        const searchBar = this.createSearchBar();
        const viewMode = this.createViewMode();

        block.append(sortOptionsBar, foundCount, searchBar, viewMode);
        return block;
    }

    private createCardsBlock(): HTMLElement {
        const block = this.createDiv('products');
        const productsSort = this.createCardsSortRow();
        const productsItems = this.renderCards();
        block.append(productsSort, productsItems);
        return block;
    }

    private renderCards(): HTMLElement {
        let productsItems: HTMLElement;

        const productsItemsCheck = document.querySelector('.products-items');
        if (productsItemsCheck && productsItemsCheck instanceof HTMLElement) {
            productsItemsCheck.innerHTML = '';
            productsItems = productsItemsCheck;
        } else {
            productsItems = this.createDiv('products-items');
        }

        for (const product of this.productsController.filteredProducts) {
            const card = this.renderCard(product);
            productsItems.append(card);
        }
        return productsItems;
    }
}
