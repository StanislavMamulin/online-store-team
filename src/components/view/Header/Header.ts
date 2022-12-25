import { PageIds } from '../../../helpers/constants';
import { createDiv } from '../../../helpers/createHTMLElements';
import { HEADER_INFO } from './constants';

export class Header {
    private headerInfo = HEADER_INFO;
    public updateHeader(totalPrice: number, totalCount: number) {
        const totalCountEl = document.querySelector(`.${this.headerInfo.cartItemsCounter}`) as HTMLElement;
        const totalPriceEl = document.querySelector(`.${this.headerInfo.totalPrice}`) as HTMLElement;

        if (totalCountEl && totalPriceEl) {
            totalCountEl.innerText = String(totalCount);
            totalPriceEl.innerText = ` €${totalPrice.toFixed(2)}`;
        }
    }

    public createHeader() {
        const headerBlock = document.createElement('header');
        const logoContainer = document.createElement('a');
        logoContainer.href = `#${PageIds.CatalogPage}`;
        logoContainer.className = 'logo-container';
        const logo = createDiv('logo');
        logo.innerText = '🛍';
        const brandName = document.createElement('h2');
        brandName.className = 'brand-name';
        brandName.innerText = 'Online Store';
        logoContainer.append(logo, brandName);

        const totalPrice = createDiv(this.headerInfo.totalPrice);
        totalPrice.innerText = '0'; //` €${carttotal.toFixed(2)}`;
        const priceSpan = document.createElement('span');
        priceSpan.innerText = 'Cart total:';
        totalPrice.prepend(priceSpan);

        const shoppingCart = document.createElement('a');
        shoppingCart.href = `#${PageIds.CartPage}`;
        shoppingCart.className = 'shopping-cart';
        const cartItems = createDiv('cart-items');
        const cartItemsCounter = createDiv(this.headerInfo.cartItemsCounter);
        cartItemsCounter.innerText = `0`;
        cartItems.append(cartItemsCounter);
        shoppingCart.append(cartItems);

        headerBlock?.append(logoContainer, totalPrice, shoppingCart);

        return headerBlock;
    }
}
