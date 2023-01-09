import { Page } from '../../../helpers/Page';
import { CartController } from '../../controllers/cartController';
import { createDiv } from '../../../helpers/createHTMLElements';
import { IProduct } from '../../types';
import { ModalWindow } from '../ModalWindow/ModalWindow';
import { PageIds, PromoCodes } from '../../../helpers/constants';

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
        productsBlock.append(title, items);
        return productsBlock;
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
        amountControl.innerText = ` €${product.price.toFixed(2)} `;
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
        const newPrices = this.createNewTotalPrices();
        const { promoCode, promoCodesBlock, promoCodeExample: promoEx } = this.createPromoCodes();
        const buyButton = document.createElement('button');
        buyButton.innerText = 'BUY NOW';
        buyButton.addEventListener('click', () => {
            this.modalWindowEl = this.instanceOfModalWindow.createModalWindow(this.submitDoneHandler.bind(this));
            this.el.append(this.modalWindowEl);
        });
        const appliedPromoCodes = this.createAppliedPromoCodesBlock();
        total.append(
            totalTitle,
            totalAmount,
            totalPrices,
            appliedPromoCodes,
            promoCode,
            promoCodesBlock,
            promoEx,
            buyButton
        );
        if (this.cartController.checkPromoCodes()) {
            totalPrices.style.textDecoration = 'line-through';
            totalPrices.after(newPrices);
        }
        return total;
    }

    private createPromoCodes(): {
        promoCode: HTMLElement;
        promoCodesBlock: HTMLElement;
        promoCodeExample: HTMLElement;
    } {
        const promoCode = createDiv('promo-code');
        const promoCodeInput = document.createElement('input');
        promoCodeInput.type = 'search';
        const promoCodesBlock = createDiv('promo-codes');
        const RSPromoCode = this.createCorrectPromoCodesResponse('RS');
        const EPMPromoCode = this.createCorrectPromoCodesResponse('EPM');
        promoCodeInput.addEventListener('input', () => {
            promoCodesBlock.innerHTML = '';
            const addBtn = this.createaddPromoBtn(promoCodeInput.value);
            if (promoCodeInput.value === 'RS') {
                RSPromoCode.append(addBtn);
                promoCodesBlock.append(RSPromoCode);
            } else if (promoCodeInput.value === 'EPM') {
                EPMPromoCode.append(addBtn);
                promoCodesBlock.append(EPMPromoCode);
            }
        });
        promoCodeInput.placeholder = 'Enter promo code';
        promoCode.append(promoCodeInput);
        const promoEx = document.createElement('span');
        promoEx.className = 'promo-ex';
        promoEx.innerText = `Promo for test: 'RS', 'EPM'`;
        return { promoCode, promoCodesBlock, promoCodeExample: promoEx };
    }

    private createCorrectPromoCodesResponse(value: string): HTMLElement {
        const response = createDiv('res-promo');
        if (value === 'RS') {
            response.innerText = `${PromoCodes.RS} - 10% `;
        } else if (value === 'EPM') {
            response.innerText = `${PromoCodes.EPM} - 10% `;
        }
        return response;
    }

    private createaddPromoBtn(value: string) {
        const btn = document.createElement('span');
        btn.innerText = 'ADD';
        btn.addEventListener('click', () => {
            if (this.cartController.noPromoCode(value)) {
                this.cartController.addPromoCode(value);
                this.render();
            }
        });
        if (this.cartController.noPromoCode(value)) {
            btn.style.display = 'inline-block';
        } else {
            btn.style.display = 'none';
        }
        return btn;
    }

    private createDeletePromoBtn(value: string) {
        const btn = document.createElement('span');
        btn.innerText = 'DROP';
        btn.addEventListener('click', () => {
            this.cartController.deletePromoCode(value);
            this.render();
        });
        return btn;
    }

    private createAppliedPromoCodesBlock() {
        const block = createDiv('appl-codes');
        const title = document.createElement('h3');
        title.innerText = 'Applied codes';
        block.append(title);
        for (let i = 0; i < this.cartController.promoCodes.length; i++) {
            const promoCode = this.createCorrectPromoCodesResponse(this.cartController.promoCodes[i]);
            const deleteBtn = this.createDeletePromoBtn(this.cartController.promoCodes[i]);
            promoCode.append(deleteBtn);
            block.append(promoCode);
        }
        if (this.cartController.checkPromoCodes()) {
            block.style.display = 'block';
        } else {
            block.style.display = 'none';
        }
        return block;
    }

    private createTotalPrices(): HTMLElement {
        const totalPrices = createDiv('total-price');
        totalPrices.innerText = ` €${this.cartController.getMoneyAmount().toFixed(2)} `;
        const totalPricesSpan = document.createElement('span');
        totalPricesSpan.innerText = 'Total:';
        totalPrices.prepend(totalPricesSpan);
        return totalPrices;
    }

    private createNewTotalPrices() {
        const newPrices = this.createTotalPrices();
        const substr = newPrices.innerHTML.split('€')[1];
        newPrices.innerHTML = newPrices.innerHTML.replace(substr, `${this.cartController.getNewPrice().toFixed(2)} `);
        return newPrices;
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
