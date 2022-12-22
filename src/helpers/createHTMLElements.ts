export function createDiv(className: string): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add(className);
    return div;
}

export function createHeaderContent() {
    const headerBlock = document.querySelector('header');
    const logoContainer = createDiv('logo-container');
    const logo = createDiv('logo');
    logo.innerText = '🛍';
    const brandName = document.createElement('h2');
    brandName.className = 'brand-name';
    brandName.innerText = 'Online Store';
    logoContainer.append(logo, brandName);

    const totalPrice = createDiv('total-price');
    totalPrice.innerText = ' €0.00';
    const priceSpan = document.createElement('span');
    priceSpan.innerText = 'Cart total:';
    totalPrice.prepend(priceSpan);

    const shoppingCart = createDiv('shopping-cart');
    const cartItems = createDiv('cart-items');
    const cartItemsCounter = createDiv('cart-items-counter');
    cartItemsCounter.innerText = '0';
    cartItems.append(cartItemsCounter);
    shoppingCart.append(cartItems);

    headerBlock?.append(logoContainer, totalPrice, shoppingCart);
}
