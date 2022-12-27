import { Page } from '../../../helpers/Page';
import { CartController } from '../../controllers/cartController';
import { IProduct } from '../../types';
import { createDiv } from '../../../helpers/createHTMLElements';

export class CartPage extends Page {
    private productsMap: Map<number, IProduct[]>;

    constructor(el: HTMLElement, id: string, private cartController: CartController) {
        super(el, id);
        this.productsMap = this.cartController.getAllProducts();
    }

    render() {
        this.el.innerHTML = '';
        if (this.productsMap.size) {
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

    private createCartWrapper() {
        const wrapper = createDiv('wrapper');
        const cartWrapper = createDiv('cart-wrapper');
        const products = this.createProductsInCart();
        const totalCart = this.CreateTotalCart();
        cartWrapper.append(products, totalCart);
        wrapper.append(cartWrapper);
        return wrapper;
    }

    private createProductsInCart(): HTMLElement {
        const products = createDiv('products-in-cart');

        const title = createDiv('title-and-page-control');
        const titleName = document.createElement('h2');
        titleName.innerText = 'Products In Cart';
        const pageControl = createDiv('page-control');
        const limit = createDiv('limit');
        limit.innerText = ' ITEMS: ';
        const limitInput = document.createElement('button');
        limitInput.innerText = '3';
        limitInput.disabled = true;
        limit.append(limitInput);
        const pageNumbers = createDiv('page-numbers');
        pageNumbers.innerText = ' PAGE: ';
        const buttonBack = document.createElement('button');
        buttonBack.innerText = ' < ';
        const numberPage = document.createElement('span');
        numberPage.innerText = '1'; // will be changed
        const buttonForward = document.createElement('button');
        buttonForward.innerText = ' > ';
        pageNumbers.append(buttonBack, numberPage, buttonForward);
        pageControl.append(limit, pageNumbers);
        title.append(titleName, pageControl);

        const items = createDiv('cart-items');
        let ind = 0;
        for (const key of this.productsMap.keys()) {
            const product = this.productsMap.get(key);
            if (product) {
                const itemWrapper = createDiv('cart-item-wrapper');
                const item = createDiv('cart-item');

                const itemIndex = createDiv('item-index');
                ind++;
                itemIndex.innerText = `${ind}`;

                const itemInfo = createDiv('item-info');
                const itemImage = document.createElement('img');
                itemImage.src = '#'; // product[0].thumbnail;
                itemImage.alt = product[0].title;
                const itemDetail = createDiv('item-detail-p');
                const itemTitle = createDiv('item-title');
                const itemTitleName = document.createElement('h3');
                itemTitleName.innerText = product[0].title;
                itemTitle.append(itemTitleName);
                const itemDescription = createDiv('item-description');
                itemDescription.innerText = product[0].description;
                const itemOther = createDiv('item-other');
                const itemRating = createDiv('item-rating');
                itemRating.innerText = `Rating: ${product[0].rating}`;
                const itemDiscount = createDiv('item-discount');
                itemDiscount.innerText = `Discount: ${product[0].discountPercentage}%`;
                itemOther.append(itemRating, itemDiscount);
                itemDetail.append(itemTitle, itemDescription, itemOther);
                itemInfo.append(itemImage, itemDetail);

                const itemControl = createDiv('item-control');
                const stockControl = createDiv('stock-control');
                stockControl.innerText = ` Stock: ${product[0].stock} `;
                const incDecControl = createDiv('incDec-control');
                incDecControl.innerText = ' 1 '; // will be changed
                const buttonInc = document.createElement('button');
                buttonInc.innerText = '+';
                const buttonDec = document.createElement('button');
                buttonDec.innerText = '-';
                incDecControl.prepend(buttonInc);
                incDecControl.append(buttonDec);
                const amountControl = createDiv('amount-control');
                amountControl.innerText = ` €${product[0].price.toFixed(2)} `; // will be changed
                itemControl.append(stockControl, incDecControl, amountControl);

                item.append(itemIndex, itemInfo, itemControl);
                itemWrapper.append(item);
                items.append(itemWrapper);
            }
        }
        products.append(title, items);
        return products;
    }

    private CreateTotalCart(): HTMLElement {
        const total = createDiv('total-cart');
        const totalTitle = document.createElement('h2');
        totalTitle.innerText = 'Summary';
        const totalAmount = createDiv('total-price');
        totalAmount.innerText = ` ${this.productsMap.size} `; // will be changed
        const totalAmountSpan = document.createElement('span');
        totalAmountSpan.innerText = 'Products:';
        totalAmount.prepend(totalAmountSpan);
        const totalPrices = createDiv('total-price');
        let sumPrice = 0; // will be changed
        for (const key of this.productsMap.keys()) {
            const product = this.productsMap.get(key);
            if (product) {
                sumPrice += product[0].price;
            }
        }
        totalPrices.innerText = ` €${sumPrice.toFixed(2)} `;
        const totalPricesSpan = document.createElement('span');
        totalPricesSpan.innerText = 'Total:';
        totalPrices.prepend(totalPricesSpan);
        const promoCode = createDiv('promo-code');
        const promoCodeInput = document.createElement('input');
        promoCodeInput.type = 'search';
        promoCodeInput.placeholder = 'Enter promo code';
        promoCode.append(promoCodeInput);
        const promoEx = document.createElement('span');
        promoEx.className = 'promo-ex';
        promoEx.innerText = `Promo for test: 'RS', 'EPM'`;
        const buyButton = document.createElement('button');
        buyButton.innerText = 'BUY NOW';
        total.append(totalTitle, totalAmount, totalPrices, promoCode, promoEx, buyButton);

        return total;
    }
}
