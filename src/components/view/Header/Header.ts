import { PageIds } from '../../../helpers/constants';
import { createDiv } from '../../../helpers/createHTMLElements';
import { resetQueryParams } from '../../../helpers/routeHelper';
import { HEADER_INFO } from './constants';

export class Header {
    private headerInfo = HEADER_INFO;

    public updateHeader(totalPrice: number, totalCount: number) {
        const totalCountEl = document.querySelector(`.${this.headerInfo.cartItemsCounter}`) as HTMLElement;
        this.updateTotalPrice(totalPrice);

        if (totalCountEl) {
            totalCountEl.innerText = String(totalCount);
        }
    }

    private updateTotalPrice(price: number) {
        let totalPriceEl = document.querySelector(`.${this.headerInfo.totalPrice}`) as HTMLElement;

        if (totalPriceEl) {
            totalPriceEl.innerHTML = '';
        } else {
            totalPriceEl = createDiv(this.headerInfo.totalPrice);
        }

        totalPriceEl.innerText = ` €${price.toFixed(2)}`;

        const priceSpan = document.createElement('span');
        priceSpan.innerText = 'Cart total:';
        totalPriceEl.prepend(priceSpan);

        return totalPriceEl;
    }

    public createHeader() {
        const [moneyAmount, totalProducts] = this.loadCartStateFromLocalStorage();

        const headerBlock = document.createElement('header');
        const logoContainer = document.createElement('a');
        logoContainer.href = `#${PageIds.CatalogPage}`;
        logoContainer.className = 'logo-container';
        const logo = createDiv('logo');
        logo.innerText = '🛍';
        const brandName = document.createElement('h2');
        brandName.className = 'brand-name';
        brandName.innerText = 'Online Store';
        logoContainer.addEventListener('click', () => {
            resetQueryParams();
        });
        logoContainer.append(logo, brandName);

        const totalPrice = this.updateTotalPrice(moneyAmount);

        const shoppingCart = document.createElement('a');
        shoppingCart.href = `#${PageIds.CartPage}`;
        shoppingCart.className = 'shopping-cart';
        const cartItems = createDiv('cart-items');
        const cartItemsCounter = createDiv(this.headerInfo.cartItemsCounter);
        cartItemsCounter.innerText = `${totalProducts}`;
        cartItems.append(cartItemsCounter);
        shoppingCart.append(cartItems);

        headerBlock?.append(logoContainer, totalPrice, shoppingCart);

        return headerBlock;
    }

    private loadCartStateFromLocalStorage(): [number, number] {
        const moneyAmount: string | null = localStorage.getItem('moneyAmount');
        const totalProducts: string | null = localStorage.getItem('totalProducts');

        return [Number(moneyAmount), Number(totalProducts)];
    }
}
