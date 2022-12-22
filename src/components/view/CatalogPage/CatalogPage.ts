import { getSortDirectionAndFieldName } from '../../controllers/catalogPageController';
import { ProductsController } from '../../controllers/productsController';
import { IProduct } from '../../types';

export class CatalogPage {
    private HEADER_OPTION = 'Sort options:';
    private FIELDS_FOR_SORT = ['price', 'rating', 'discount'];
    private SORT_DIRECTION = ['ASC', 'DESC'];

    constructor(private el: HTMLElement) {}
    productsController: ProductsController = new ProductsController();

    public render() {
        this.el.innerHTML = '';
        const cardsBlock = this.createCardsBlock();
        const filtersBlock = this.createFiltersBlock();

        this.el.append(filtersBlock, cardsBlock);
        this.foundCounter();
        this.createHeaderContent();
    }

    private createHeaderContent() {
        const headerBlock = document.querySelector('header');
        const logoContainer = this.createDiv('logo-container');
        const logo = this.createDiv('logo');
        logo.innerText = '🛍';
        const brandName = document.createElement('h2');
        brandName.className = 'brand-name';
        brandName.innerText = 'Online Store';
        logoContainer.append(logo, brandName);

        const totalPrice = this.createDiv('total-price');
        totalPrice.innerText = ' €0.00';
        const priceSpan = document.createElement('span');
        priceSpan.innerText = 'Cart total:';
        totalPrice.prepend(priceSpan);

        const shoppingCart = this.createDiv('shopping-cart');
        const cartItems = this.createDiv('cart-items');
        const cartItemsCounter = this.createDiv('cart-items-counter');
        cartItemsCounter.innerText = '0';
        cartItems.append(cartItemsCounter);
        shoppingCart.append(cartItems);

        headerBlock?.append(logoContainer, totalPrice, shoppingCart);
    }

    private createFiltersBlock(): HTMLElement {
        const block = this.createDiv('filters');
        const filtersButtons = this.createDiv('filter-buttons');
        const resetButton = document.createElement('button');
        resetButton.innerText = 'Reset Filters';
        const copyButton = document.createElement('button');
        copyButton.innerText = 'Copy Link';
        filtersButtons.append(resetButton, copyButton);

        const categoryList = this.createDiv('category-list');
        const categoryHeader = document.createElement('h3');
        categoryHeader.innerText = 'Category';
        const filtersCategory = this.createFilters('category');
        categoryList.append(categoryHeader, filtersCategory);

        const brandList = this.createDiv('brand-list');
        const brandHeader = document.createElement('h3');
        brandHeader.innerText = 'Brand';
        const filtersBrand = this.createFilters('brand');
        brandList.append(brandHeader, filtersBrand);

        block.append(filtersButtons, categoryList, brandList);
        return block;
    }

    private filterHandler = (event: Event, typeOfFilter: string) => {
        const clickedFilter = (event.target as HTMLInputElement).id;
        this.productsController.setFilterForField(typeOfFilter as keyof IProduct, clickedFilter);
        this.renderCards();

        this.createFilters('brand');
        this.createFilters('category');
        this.foundCounter();
    };

    private createFilter(
        value: string,
        typeOfFilter: string,
        totalCount: number,
        currentCount: number,
        active: boolean
    ) {
        const filterLine: HTMLElement = this.createDiv('filter-line');

        const check: HTMLInputElement = document.createElement('input');
        check.type = 'checkbox';
        check.id = value;
        check.checked = active;
        check.addEventListener('change', (ev) => {
            this.filterHandler(ev, typeOfFilter);
        });

        const label: HTMLLabelElement = document.createElement('label');
        label.htmlFor = value;
        label.appendChild(document.createTextNode(value));

        const totalElement: HTMLSpanElement = document.createElement('span');
        totalElement.innerHTML = `(${currentCount}/${totalCount})`;
        filterLine.append(check, label, totalElement);
        return filterLine;
    }

    private createFilters(field: string) {
        const actualFilters = this.productsController.getAllValuesFromField(field);
        let filterList: HTMLElement;

        if (document.querySelector(`.filter-list-${field}`)) {
            filterList = document.querySelector(`.filter-list-${field}`) as HTMLElement;
            filterList.innerHTML = '';
        } else {
            filterList = this.createDiv(`filter-list-${field}`);
        }

        actualFilters.forEach((value) => {
            const totalCount = this.productsController.getCountValuesFromProduct(field, value, false);
            const currentCount = this.productsController.getCountValuesFromProduct(field, value, true);
            const isFilterActive = this.productsController.isFilterActive(value);

            filterList.append(this.createFilter(value, field, totalCount, currentCount, isFilterActive));
        });

        return filterList;
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
        const productItem = this.createDiv('product-item');
        const div = document.createElement('div');
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
        div.append(cardWrapper);
        productItem.append(div);
        return productItem;
    }

    private createOption(optionValue: string): HTMLOptionElement {
        const option = document.createElement('option');
        option.text = optionValue;
        return option;
    }

    private addHeaderForSortOptions(text: string): HTMLOptionElement {
        const headerOption = this.createOption(text);
        headerOption.disabled = true;
        headerOption.defaultSelected = true;

        return headerOption;
    }

    private addSortOptions(selectEl: HTMLSelectElement) {
        const headerOp = this.addHeaderForSortOptions(this.HEADER_OPTION);
        selectEl.add(headerOp);

        this.FIELDS_FOR_SORT.forEach((field) => {
            this.SORT_DIRECTION.forEach((direction) => {
                const option: HTMLOptionElement = this.createOption(`Sort by ${field} ${direction}`);
                selectEl.add(option);
            });
        });
    }

    private createSortOptionsBar(): HTMLElement {
        const sortOptionsBar = this.createDiv('sort-bar');
        const barSelection = document.createElement('select');
        this.addSortOptions(barSelection);

        barSelection.addEventListener('change', () => {
            const selectedValues: string = barSelection.options[barSelection.selectedIndex].value;
            const [direction, field]: [string, string] = getSortDirectionAndFieldName(selectedValues);

            if (direction === 'ASC') {
                this.productsController.sortAsc(field);
            } else if (direction === 'DESC') {
                this.productsController.sortDesc(field);
            }
            this.renderCards();
        });

        sortOptionsBar.append(barSelection);

        return sortOptionsBar;
    }

    private foundCounter(): void {
        const count = document.querySelector('.found-counter') as HTMLElement;
        count.innerText = String(document.querySelector('.products-items')?.children.length);
    }

    private createFoundCount(): HTMLElement {
        const found = this.createDiv('found-count');
        found.innerText = 'Found: ';
        const foundCount = document.createElement('span');
        foundCount.classList.add('found-counter');
        found.append(foundCount);

        return found;
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
            this.createFilters('brand');
            this.createFilters('category');
            this.foundCounter();
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
