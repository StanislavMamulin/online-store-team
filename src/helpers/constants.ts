export const enum PageIds {
    CatalogPage = 'catalog',
    CartPage = 'cart',
    ProductPage = 'product-details',
    ErrorPage = 'error',
}

export const enum InputPatterns {
    Name = '(([a-zA-Z]{3,})+\\s){1,}(([a-zA-Z]{3,})+)',
    PhoneNumber = '^\\+([0-9]{8,})+$',
    Address = '(([a-zA-Z]{5,})+\\s){2,}(([a-zA-Z]{5,})+)',
    Email = '^([a-zA-Z0-9_\\-.]{3,})@([a-zA-Z0-9_\\-.]{4,}).([a-zA-Z]{2,4})$',
    CardNumber = '[0-9]{4}\\s{1}[0-9]{4}\\s{1}[0-9]{4}\\s{1}[0-9]{4}',
    CardDate = '(0[1-9]|1[0-2])/[0-9]{2}',
    CardCvv = '[0-9]{3}',
}
