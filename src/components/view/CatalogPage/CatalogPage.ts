import { getSortDirectionAndFieldName } from '../../controllers/catalogPageController';
import { ProductsController } from '../../controllers/productsController';
import { IProduct } from '../../types';
import { addClass, removeClass } from '../../../helpers/classToggle';
import { createDiv, createHeader } from '../../../helpers/createHTMLElements';
import { RangeSlider, SliderValues } from './Slider/RangeSlider';

export class CatalogPage {
    private HEADER_OPTION = 'Sort options:';
    private FIELDS_FOR_SORT = ['price', 'rating', 'discount'];
    private SORT_DIRECTION = ['ASC', 'DESC'];
    private minPrice = 1;
    private maxPrice = 3000;
    private minStock = 1;
    private maxStock = 3000;

    constructor(private el: HTMLElement) {}
    productsController: ProductsController = new ProductsController();

    public render() {
        this.el.innerHTML = '';
        const cardsBlock = this.createCardsBlock();
        const filtersBlock = this.createFiltersBlock();
        const header = createHeader(0, 0);

        this.el.append(filtersBlock, cardsBlock);
        this.foundCounter();
        this.el.before(header);
    }

    private createSlider(type: string, range: [number, number]): HTMLElement {
        const minValue = range[0];
        const maxValue = range[1];
        const sliderWrapper = createDiv('slider-wrapper');
        const sliderHeader = document.createElement('h3');
        sliderHeader.innerText = type;

        const valuesWrapper = createDiv(`${type}-values-wrapper`);
        const minValueEl = document.createElement('span');
        minValueEl.classList.add(`${type}-min-value`);
        minValueEl.innerText = String(minValue);

        const maxValueEl = document.createElement('span');
        maxValueEl.classList.add(`${type}-max-value`);
        maxValueEl.innerText = String(maxValue);

        const arrow = createDiv('arrow');
        arrow.innerText = '⟷';

        valuesWrapper.append(minValueEl, arrow, maxValueEl);

        const rangeForField = Array.from(this.productsController.getAllValuesFromField(type)) as Array<number>;

        const slider = new RangeSlider(rangeForField, `${type}-slider`);
        slider.addHandler((values: SliderValues) => {
            const [minValue, maxValue] = values;

            if (typeof minValue === 'number' && typeof maxValue === 'number') {
                if (type === 'price') {
                    minValueEl.innerText = `€${String(minValue.toFixed(2))}`;
                    maxValueEl.innerText = `€${String(maxValue.toFixed(2))}`;
                } else {
                    minValueEl.innerText = String(minValue);
                    maxValueEl.innerText = String(maxValue);
                }

                this.productsController.setFilterForField(`${type as keyof IProduct}`, [minValue, maxValue]);

                this.renderCards();
                this.foundCounter();
                this.createFilters('brand');
                this.createFilters('category');
            }
        });

        sliderWrapper.append(sliderHeader, valuesWrapper, slider.sliderElement);

        return sliderWrapper;
    }

    private createFiltersBlock(): HTMLElement {
        const block = createDiv('filters');
        const filtersButtons = createDiv('filter-buttons');
        const resetButton = document.createElement('button');
        resetButton.innerText = 'Reset Filters';
        const copyButton = document.createElement('button');
        copyButton.innerText = 'Copy Link';
        filtersButtons.append(resetButton, copyButton);

        const categoryList = createDiv('category-list');
        const categoryHeader = document.createElement('h3');
        categoryHeader.innerText = 'Category';
        const filtersCategory = this.createFilters('category');
        categoryList.append(categoryHeader, filtersCategory);

        const brandList = createDiv('brand-list');
        const brandHeader = document.createElement('h3');
        brandHeader.innerText = 'Brand';
        const filtersBrand = this.createFilters('brand');
        brandList.append(brandHeader, filtersBrand);

        const priceSlider = this.createSlider('price', [this.minPrice, this.maxPrice]);
        const stockSlider = this.createSlider('stock', [this.minStock, this.maxStock]);

        block.append(filtersButtons, categoryList, brandList, priceSlider, stockSlider);
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
        const filterLine: HTMLElement = createDiv('filter-line');

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
            filterList = createDiv(`filter-list-${field}`);
        }

        actualFilters.forEach((value) => {
            const strValue = String(value);
            const totalCount = this.productsController.getCountValuesFromProduct(field, strValue, false);
            const currentCount = this.productsController.getCountValuesFromProduct(field, strValue, true);
            const isFilterActive = this.productsController.isFilterActive(strValue);

            filterList.append(this.createFilter(strValue, field, totalCount, currentCount, isFilterActive));
        });

        return filterList;
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
        const div = createDiv('card-info-item');
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
        const block = createDiv('card-buttons');
        const buttonAdd = document.createElement('button');
        buttonAdd.className = 'button-add';
        buttonAdd.innerText = 'ADD TO CART';
        const buttonDetails = document.createElement('button');
        buttonDetails.innerText = 'DETAILS';
        block.append(buttonAdd, buttonDetails);
        return block;
    }

    private renderCard(obj: IProduct): HTMLElement {
        const productItem = createDiv('product-item');
        const div = document.createElement('div');
        const cardWrapper = createDiv('card-wrapper');
        cardWrapper.style.background = `url("${obj.thumbnail}") 0% 0% / cover`;
        const cardButtons = this.createCardButtons();
        const cardText = createDiv('card-text');
        const cardTitle = createDiv('card-title');
        cardTitle.innerText = obj.title;
        const cardInfo = createDiv('card-info');
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
        const sortOptionsBar = createDiv('sort-bar');
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
        const count: HTMLElement | null = document.querySelector('.found-counter');

        if (count) {
            count.innerText = String(document.querySelector('.products-items')?.children.length);
        }
    }

    private createFoundCount(): HTMLElement {
        const found = createDiv('found-count');
        found.innerText = 'Found: ';
        const foundCount = document.createElement('span');
        foundCount.classList.add('found-counter');
        found.append(foundCount);

        return found;
    }

    private createSearchBar(): HTMLElement {
        const searchBar = createDiv('search-bar');
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
        const viewMode = createDiv('view-mode');

        const smallV = createDiv('small-v');
        for (let i = 0; i < 36; i++) {
            const smallDot = createDiv('small-dot');
            smallDot.innerText = '.';
            smallV.append(smallDot);
        }

        const bigV = createDiv('big-v');
        for (let i = 0; i < 16; i++) {
            const bigDot = createDiv('big-dot');
            bigDot.innerText = '.';
            bigV.append(bigDot);
        }
        viewMode.append(smallV, bigV);

        bigV.classList.add('active-mode');

        bigV.addEventListener('click', () => {
            smallV.classList.remove('active-mode');
            bigV.classList.add('active-mode');
            removeClass(document.querySelectorAll('.product-item'), 'small');
            removeClass(document.querySelectorAll('.card-info'), 'small');
        });

        smallV.addEventListener('click', () => {
            bigV.classList.remove('active-mode');
            smallV.classList.add('active-mode');
            addClass(document.querySelectorAll('.product-item'), 'small');
            addClass(document.querySelectorAll('.card-info'), 'small');
        });

        return viewMode;
    }

    private createCardsSortRow(): HTMLElement {
        const block = createDiv('products-sort');

        const sortOptionsBar = this.createSortOptionsBar();
        const foundCount = this.createFoundCount();
        const searchBar = this.createSearchBar();
        const viewMode = this.createViewMode();

        block.append(sortOptionsBar, foundCount, searchBar, viewMode);
        return block;
    }

    private createCardsBlock(): HTMLElement {
        const block = createDiv('products');
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
            productsItems = createDiv('products-items');
        }

        for (const product of this.productsController.filteredProducts) {
            const card = this.renderCard(product);
            productsItems.append(card);
        }
        return productsItems;
    }
}
