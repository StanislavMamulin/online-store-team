import { getSortDirectionAndFieldName } from '../../controllers/catalogPageController';
import { FilterRange, ProductsController } from '../../controllers/productsController';
import { IProduct } from '../../types';
import { addClass, removeClass } from '../../../helpers/classToggle';
import { createDiv } from '../../../helpers/createHTMLElements';
import { RangeSlider, SliderValues } from './Slider/RangeSlider';
import { getMinAndMaxNumberFromArray } from '../../../helpers/arrayHelpers';
import { Page } from '../../../helpers/Page';
import { CartController } from '../../controllers/cartController';
import { PageIds } from '../../../helpers/constants';
import { setUrlParameter } from '../../../helpers/routeHelper';

export class CatalogPage extends Page {
    private HEADER_OPTION = 'Sort options:';
    private FIELDS_FOR_SORT = ['price', 'rating', 'discount'];
    private SORT_DIRECTION = ['ASC', 'DESC'];
    private RANGE_SLIDER_FIELDS = ['price', 'stock'];
    private priceSlider?: RangeSlider;
    private stockSlider?: RangeSlider;

    constructor(
        el: HTMLElement,
        id: string,
        private productsController: ProductsController,
        private cartController: CartController
    ) {
        super(el, id);
    }

    public render() {
        this.el.innerHTML = '';
        const cardsBlock = this.createCardsBlock();
        const filtersBlock = this.createFiltersBlock();
        this.el.append(filtersBlock, cardsBlock);
        this.foundCounter();
    }

    private setSliderTextValue(slider: HTMLElement, type: string, value: number): void {
        if (type === 'price') {
            slider.innerText = `€${String(value.toFixed(2))}`;
        } else {
            slider.innerText = String(value);
        }
    }

    private createSlider(
        type: string,
        range: [number, number],
        rangeForField: number[],
        initialValue?: FilterRange
    ): HTMLElement {
        const minValue = initialValue ? initialValue[0] : range[0];
        const maxValue = initialValue ? initialValue[1] : range[1];
        const sliderWrapper = createDiv('slider-wrapper');
        const sliderHeader = document.createElement('h3');
        sliderHeader.innerText = type;

        const valuesWrapper = createDiv(`${type}-values-wrapper`);
        const minValueEl = document.createElement('span');
        minValueEl.classList.add(`${type}-min-value`);

        const maxValueEl = document.createElement('span');
        maxValueEl.classList.add(`${type}-max-value`);

        const arrow = createDiv('arrow');
        arrow.innerText = '⟷';

        valuesWrapper.append(minValueEl, arrow, maxValueEl);

        this.setSliderTextValue(minValueEl, type, minValue);
        this.setSliderTextValue(maxValueEl, type, maxValue);

        const slider = new RangeSlider(rangeForField, `${type}-slider`);
        if (initialValue) {
            slider.setValues(initialValue[0], initialValue[1]);
        }

        slider.addHandler((values: SliderValues) => {
            const [minValue, maxValue] = values;

            if (typeof minValue === 'number' && typeof maxValue === 'number') {
                this.setSliderTextValue(minValueEl, type, minValue);
                this.setSliderTextValue(maxValueEl, type, maxValue);

                this.productsController.setFilterForField(`${type as keyof IProduct}`, [minValue, maxValue]);

                this.filterDidUpdate(type);
                setUrlParameter(type, values);
            }
        });

        sliderWrapper.append(sliderHeader, valuesWrapper, slider.sliderElement);

        if (type === 'price') {
            this.priceSlider = slider;
        } else if (type === 'stock') {
            this.stockSlider = slider;
        }

        return sliderWrapper;
    }

    private createSliders(): HTMLElement[] {
        const sliders: HTMLElement[] = [];
        this.RANGE_SLIDER_FIELDS.forEach((field: string) => {
            const rangeForField = Array.from(this.productsController.getAllValuesFromField(field)) as Array<number>;
            const [minValue, maxValue]: number[] = getMinAndMaxNumberFromArray(rangeForField);
            const currentRange: FilterRange = this.productsController.getRangeForField(field);

            const slider = this.createSlider(field, [minValue, maxValue], rangeForField, currentRange);
            sliders.push(slider);
        });

        return sliders;
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

        const sliders = this.createSliders();

        block.append(filtersButtons, categoryList, brandList, ...sliders);
        return block;
    }

    private filterHandler = (event: Event, typeOfFilter: string) => {
        const clickedFilter = (event.target as HTMLInputElement).id;
        this.productsController.setFilterForField(typeOfFilter as keyof IProduct, clickedFilter);
        setUrlParameter(typeOfFilter, clickedFilter);

        this.filterDidUpdate();
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

    private createCardButtons(obj: IProduct): HTMLElement {
        const block = createDiv('card-buttons');
        const buttonAdd = document.createElement('button');
        buttonAdd.className = 'button-add';
        buttonAdd.innerText = this.cartController.isProductInCart(obj) ? 'DROP FROM CART' : 'ADD TO CART';
        buttonAdd.addEventListener('click', () => {
            this.cartController.addProductToCart(obj);
            this.renderCards();
        });

        const buttonDetails = document.createElement('button');
        buttonDetails.innerText = 'DETAILS';
        buttonDetails.addEventListener('click', () => {
            if (window.location.href.includes(PageIds.CatalogPage)) {
                window.location.href = window.location.href.replace(
                    PageIds.CatalogPage,
                    `${PageIds.ProductPage}/${obj.id}`
                );
            } else {
                window.location.href += `#${PageIds.ProductPage}/${obj.id}`;
            }
        });

        block.append(buttonAdd, buttonDetails);
        return block;
    }

    private renderCard(obj: IProduct): HTMLElement {
        const productItem = createDiv('product-item');
        this.cartController.isProductInCart(obj)
            ? productItem.classList.add('in-cart')
            : productItem.classList.remove('in-cart');
        const div = document.createElement('div');
        const cardWrapper = createDiv('card-wrapper');
        // cardWrapper.style.background = `url("${obj.thumbnail}") 0% 0% / cover`;
        const cardButtons = this.createCardButtons(obj);
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
            count.innerText = String(this.productsController.filteredProducts.length);
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
            const currentSearchString = (e.target as HTMLInputElement).value;
            this.productsController.searchProduct(currentSearchString);
            this.filterDidUpdate();
            setUrlParameter('search', currentSearchString);
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

    private filterDidUpdate(filter = '') {
        this.renderCards();
        this.createFilters('brand');
        this.createFilters('category');
        this.foundCounter();
        this.updateFilterRanges(filter);
    }

    private updateFilterRanges(filter: string) {
        this.RANGE_SLIDER_FIELDS.forEach((field: string) => {
            if (field !== filter) {
                const values = this.productsController.getAllValuesFromField(field, true) as Set<number>;
                const [minValue, maxValue] = getMinAndMaxNumberFromArray(Array.from(values));

                const slider: RangeSlider | undefined = field === 'price' ? this.priceSlider : this.stockSlider;
                slider?.setValues(minValue, maxValue);

                const minTextEl = document.querySelector(`.${field}-min-value`);
                const maxTextEl = document.querySelector(`.${field}-max-value`);
                if (minTextEl && minTextEl instanceof HTMLElement && maxTextEl instanceof HTMLElement) {
                    this.setSliderTextValue(minTextEl, field, minValue);
                    this.setSliderTextValue(maxTextEl, field, maxValue);
                }
                setUrlParameter(field, [minValue, maxValue]);
            }
        });
    }
}
