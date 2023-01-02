export const enum PageIds {
    CatalogPage = 'catalog',
    CartPage = 'cart',
    ProductPage = 'product-details',
    ErrorPage = 'error',
}

export const enum InputPatterns {
    Name = '(([a-zA-Z]{3,})+\\s){1,}(([a-zA-Z]{3,})+)', //'/^[^\\s@]+@[^\\s@]+/\.[^\\s@]+$/',
    PhoneNumber = '^\\+([0-9]{8,})+$',
    Address = '(([a-zA-Z]{5,})+\\s){2,}(([a-zA-Z]{5,})+)',
}
