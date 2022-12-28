import { Page } from '../../../helpers/Page';
import { CartController } from '../../controllers/cartController';
import { createDiv } from '../../../helpers/createHTMLElements';
import { IProduct } from '../../types';

export class CartPage extends Page {
    constructor(el: HTMLElement, id: string, private cartController: CartController) {
        super(el, id);
    }

    render(): void {
        this.el.innerHTML = '';
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
        const products = createDiv('products-in-cart');
        const title = this.createCartProductsTitle();
        const items = createDiv('cart-items');
        let ind = 0;
        for (const key of this.cartController.getAllProducts().keys()) {
            const products = this.cartController.getAllProducts().get(key);
            if (products) {
                const product = products[0];
                const itemWrapper = createDiv('cart-item-wrapper');
                const item = createDiv('cart-item');
                const itemIndex = createDiv('item-index');
                ind++;
                itemIndex.innerText = `${ind}`;
                const itemInfo = this.createItemInfoBlock(product);
                const itemControl = this.createItemAdditionBlock(product, products);
                item.append(itemIndex, itemInfo, itemControl);
                itemWrapper.append(item);
                items.append(itemWrapper);
            }
        }
        products.append(title, items);
        return products;
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
        incDecControl.innerText = ` ${products.length} `; // will be changed
        const buttonInc = document.createElement('button');
        buttonInc.innerText = '+';
        buttonInc.addEventListener('click', () => {
            this.cartController.changeQuantityById(product.id, 1);
            this.render();
        });
        const buttonDec = document.createElement('button');
        buttonDec.innerText = '-';
        buttonDec.addEventListener('click', () => {
            this.cartController.changeQuantityById(product.id, -1);
            this.render();
        });
        incDecControl.prepend(buttonInc);
        incDecControl.append(buttonDec);
        const amountControl = createDiv('amount-control');
        amountControl.innerText = ` €${product.price.toFixed(2)} `; // will be changed
        itemControl.append(stockControl, incDecControl, amountControl);
        return itemControl;
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
        const buttonBack = document.createElement('button');
        buttonBack.innerText = ' < ';
        const numberPage = document.createElement('span');
        numberPage.innerText = '1'; // will be changed
        const buttonForward = document.createElement('button');
        buttonForward.innerText = ' > ';
        pageNumbers.append(buttonBack, numberPage, buttonForward);
        return pageNumbers;
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
                if (correctPromoCode) {
                    correctPromoCode.remove();
                }
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
