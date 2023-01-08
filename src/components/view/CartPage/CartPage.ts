import { Page } from '../../../helpers/Page';
import { CartController } from '../../controllers/cartController';
import { createDiv } from '../../../helpers/createHTMLElements';
import { IProduct } from '../../types';
import { ModalWindow } from '../ModalWindow/ModalWindow';
import { PageIds } from '../../../helpers/constants';

export class CartPage extends Page {
    private instanceOfModalWindow: ModalWindow = new ModalWindow();
    private modalWindowEl?: HTMLDivElement;

    constructor(el: HTMLElement, id: string, private cartController: CartController) {
        super(el, id);
    }

    render(): void {
        this.el.innerHTML = '';
        this.el.className = 'page';
        if (this.cartController.getAllProducts().size) {
            const cartWrapper = this.createCartWrapper();
            this.el.append(cartWrapper);
        } else {
            const emptyCart = this.createEmptyCart();
            this.el.append(emptyCart);
        }
    }

    private createEmptyCart(): HTMLElement {
        const emptyBlock = createDiv('cart-empty');
        const emptyTitle = document.createElement('h1');
        emptyTitle.innerText = 'Cart is Empty';
        emptyBlock.append(emptyTitle);
        return emptyBlock;
    }

    private createCartWrapper(): HTMLElement {
        const wrapper = createDiv('wrapper');
        const cartWrapper = createDiv('cart-wrapper');
        const products = this.createProductsInCart();
        const totalCart = this.createTotalCart();
        cartWrapper.append(products, totalCart);
        wrapper.append(cartWrapper);
        return wrapper;
    }

    private createProductsInCart(): HTMLElement {
        const productsBlock = createDiv('products-in-cart');
        const title = this.createCartProductsTitle();
        const items = createDiv('cart-items');

        let ind = this.cartController.startIndexForCurrentPage;
        const partOfProducts: Map<number, IProduct[]> | null = this.cartController.getProductsForPage();
        if (partOfProducts) {
            for (const products of partOfProducts.values()) {
                const product = products[0];
                const item = this.createProductInfo(ind, product, products);
                items.append(item);
                ind += 1;
            }
        }

        productsBlock.append(title, items);

        return productsBlock;
    }

    private createProductInfo(ind: number, product: IProduct, products: IProduct[]) {
        const itemWrapper = createDiv('cart-item-wrapper');
        const item = createDiv('cart-item');

        const itemIndex = createDiv('item-index');
        itemIndex.innerText = `${ind}`;
        const itemInfo = this.createItemInfoBlock(product);
        const itemControl = this.createItemAdditionBlock(product, products);

        item.append(itemIndex, itemInfo, itemControl);
        itemWrapper.append(item);

        return itemWrapper;
    }

    private createCartProductsTitle(): HTMLElement {
        const title = createDiv('title-and-page-control');
        const titleName = document.createElement('h2');
        titleName.innerText = 'Products In Cart';
        const pageControl = createDiv('page-control');
        const limit = createDiv('limit');
        limit.innerText = ' ITEMS: ';
        const limitInput = document.createElement('input');
        limitInput.value = '3';
        limit.append(limitInput);
        const pageNumbers = this.createPageNumbers();
        pageControl.append(limit, pageNumbers);
        title.append(titleName, pageControl);
        return title;
    }

    private createItemInfoBlock(product: IProduct): HTMLElement {
        const itemInfo = createDiv('item-info');
        const itemImage = document.createElement('img');
        itemImage.src = '#'; // product.thumbnail;
        itemImage.alt = product.title;
        const itemDetail = createDiv('item-detail-p');
        const itemTitle = this.createItemTitle(product);
        const itemDescription = createDiv('item-description');
        itemDescription.innerText = product.description;
        const itemOther = this.createItemOtherBlock(product);
        itemDetail.append(itemTitle, itemDescription, itemOther);
        itemInfo.append(itemImage, itemDetail);
        return itemInfo;
    }

    private createItemAdditionBlock(product: IProduct, products: IProduct[]): HTMLElement {
        const itemControl = createDiv('item-control');
        const stockControl = createDiv('stock-control');
        stockControl.innerText = ` Stock: ${product.stock} `;
        const incDecControl = createDiv('incDec-control');
        incDecControl.innerText = ` ${products.length} `;

        const buttonInc = this.createChangeQuantityButton('+', 1, product.id);
        const buttonDec = this.createChangeQuantityButton('-', -1, product.id);

        incDecControl.prepend(buttonInc);
        incDecControl.append(buttonDec);
        const amountControl = createDiv('amount-control');
        amountControl.innerText = ` €${product.price.toFixed(2)} `;
        itemControl.append(stockControl, incDecControl, amountControl);
        return itemControl;
    }

    private createChangeQuantityButton(text: string, step: number, id: number): HTMLButtonElement {
        const button = document.createElement('button');
        button.innerText = text;
        button.addEventListener('click', () => {
            this.cartController.changeQuantityById(id, step);
            this.render();
        });

        return button;
    }

    private createItemTitle(product: IProduct): HTMLElement {
        const itemTitle = createDiv('item-title');
        const itemTitleName = document.createElement('h3');
        itemTitleName.innerText = product.title;
        itemTitle.append(itemTitleName);
        return itemTitle;
    }

    private createItemOtherBlock(product: IProduct): HTMLElement {
        const itemOther = createDiv('item-other');
        const itemRating = createDiv('item-rating');
        itemRating.innerText = `Rating: ${product.rating}`;
        const itemDiscount = createDiv('item-discount');
        itemDiscount.innerText = `Discount: ${product.discountPercentage}%`;
        itemOther.append(itemRating, itemDiscount);
        return itemOther;
    }

    private createPageNumbers(): HTMLElement {
        const pageNumbers = createDiv('page-numbers');
        pageNumbers.innerText = ' PAGE: ';

        const buttonBack = this.createChangePageButton(' < ', -1);

        const numberPage = document.createElement('span');
        numberPage.innerText = String(this.cartController.currentCartPage);

        const buttonForward = this.createChangePageButton(' > ', 1);

        pageNumbers.append(buttonBack, numberPage, buttonForward);
        return pageNumbers;
    }

    private createChangePageButton(text: string, step: number) {
        const button = document.createElement('button');
        button.innerText = text;
        button.addEventListener('click', () => {
            this.cartController.incDecPageNumberBy(step);
            this.render();
        });

        return button;
    }

    private orderDoneHandler(): void {
        window.location.href = window.location.href.replace(window.location.hash.slice(1), PageIds.CatalogPage);
    }

    private submitDoneHandler(): void {
        this.cartController.clearCart();
        this.modalWindowEl?.remove();
        this.render();
        this.el.append(this.instanceOfModalWindow.createSubmitMessage(this.orderDoneHandler));
    }

    private createTotalCart(): HTMLElement {
        const total = createDiv('total-cart');
        const totalTitle = document.createElement('h2');
        totalTitle.innerText = 'Summary';
        const totalAmount = this.createTotalAmount();
        const totalPrices = this.createTotalPrices();
        const { promoCode, promoCodeExample: promoEx } = this.createPromoCodes();
        const buyButton = document.createElement('button');
        buyButton.innerText = 'BUY NOW';
        buyButton.addEventListener('click', () => {
            this.modalWindowEl = this.instanceOfModalWindow.createModalWindow(this.submitDoneHandler.bind(this));
            this.el.append(this.modalWindowEl);
        });
        total.append(totalTitle, totalAmount, totalPrices, promoCode, promoEx, buyButton);
        return total;
    }

    private createPromoCodes(): {
        promoCode: HTMLElement;
        promoCodeExample: HTMLElement;
    } {
        const promoCode = createDiv('promo-code');
        const promoCodeInput = document.createElement('input');
        promoCodeInput.type = 'search';
        const correctPromoCode = this.createCorrectPromoCodesResponse();
        promoCodeInput.addEventListener('input', () => {
            if (promoCodeInput.value === 'RS' || promoCodeInput.value === 'EPM') {
                promoCode.after(correctPromoCode);
            } else {
                correctPromoCode.remove();
            }
        });
        promoCodeInput.placeholder = 'Enter promo code';
        promoCode.append(promoCodeInput);
        const promoEx = document.createElement('span');
        promoEx.className = 'promo-ex';
        promoEx.innerText = `Promo for test: 'RS', 'EPM'`;
        return { promoCode, promoCodeExample: promoEx };
    }

    private createCorrectPromoCodesResponse(): HTMLElement {
        const response = createDiv('res-promo');
        response.innerText = 'Rolling Scopes School - 10% ';
        const responseValue = document.createElement('span');
        responseValue.innerText = 'ADD';
        response.append(responseValue);
        return response;
    }

    private createTotalPrices(): HTMLElement {
        const totalPrices = createDiv('total-price');
        totalPrices.innerText = ` €${this.cartController.getMoneyAmount().toFixed(2)} `;
        const totalPricesSpan = document.createElement('span');
        totalPricesSpan.innerText = 'Total:';
        totalPrices.prepend(totalPricesSpan);
        return totalPrices;
    }

    private createTotalAmount(): HTMLElement {
        const totalAmount = createDiv('total-price');
        totalAmount.innerText = ` ${this.cartController.getTotalProductsInCart()} `;
        const totalAmountSpan = document.createElement('span');
        totalAmountSpan.innerText = 'Products:';
        totalAmount.prepend(totalAmountSpan);
        return totalAmount;
    }
}
