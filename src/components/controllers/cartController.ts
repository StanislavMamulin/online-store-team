import { IProduct } from '../types';
import { Header } from '../view/Header/Header';
import { setUrlParameter, getParametersFromQuery } from '../../helpers/routeHelper';

const INIT_SHOWED_ON_PAGE = 3;
const INIT_CURRENT_PAGE = 1;

export class CartController {
    private cart: Map<number, IProduct[]> = new Map();
    private moneyAmount: number;
    private totalProducts: number;
    promoCodes: string[];
    private currentPage: number;
    private showedOnPage: number;

    constructor(private header: Header) {
        this.moneyAmount = 0;
        this.totalProducts = 0;
        this.loadCartStateFromLocalStorage();
        this.promoCodes = [];

        this.currentPage = INIT_CURRENT_PAGE;
        this.showedOnPage = INIT_SHOWED_ON_PAGE;
        this.applySettingsFromQueryString();
    }

    addPromoCode(value: string): void {
        this.promoCodes.push(value);
    }

    deletePromoCode(value: string): void {
        const ind = this.promoCodes.indexOf(value);
        this.promoCodes.splice(ind, 1);
    }

    checkPromoCodes(): boolean {
        return this.promoCodes.length !== 0;
    }

    noPromoCode(value: string): boolean {
        const ind = this.promoCodes.indexOf(value);
        return ind === -1;
    }

    getNewPrice() {
        let count = this.promoCodes.length;
        const dec = this.moneyAmount / 10;
        let newPrice = this.moneyAmount;
        while (count) {
            newPrice -= dec;
            count--;
        }
        return newPrice;
    }

    getProductId(product: IProduct): number {
        return product.id;
    }

    addProductToCart(product: IProduct): void {
        const { id } = product;
        const productItemsInCart: IProduct[] | undefined = this.cart.get(id);

        if (productItemsInCart) {
            // the product is already in the cart - delete it
            this.dropProductFromCart(product);
        } else {
            this.cart.set(id, [product]);
            this.quantityHasChangedByPcs(1, product);
        }
        this.cartDidUpdate();
    }

    isProductInCart(product: IProduct): boolean {
        return this.cart.has(product.id);
    }

    private quantityHasChangedByPcs(pcs: number, product: IProduct) {
        this.moneyAmount += product.price * pcs;
        this.totalProducts += pcs;
    }

    /**
     * Change the quantity of the product in the cart
     * @param id - Product ID
     * @param quantity - How much to change the amount (-1/+1)
     * @returns Actual product quantity or -1 if product not found
     */
    changeQuantityById(id: number, quantity: number): number {
        const productItemsInCart: IProduct[] | undefined = this.cart.get(id);

        if (productItemsInCart) {
            const theProduct: IProduct = productItemsInCart[0];
            const productQuantity: number = productItemsInCart.length;
            const currentProductStock: number = theProduct.stock;

            const newQuantity: number = productQuantity + quantity;
            if (newQuantity > currentProductStock) {
                return currentProductStock;
            }

            this.quantityHasChangedByPcs(quantity, theProduct);

            if (newQuantity <= 0) {
                this.cart.delete(id); // delete the product
                this.actualizeCurrentPage();
            } else {
                // change the quantity
                if (quantity > 0) {
                    productItemsInCart.push(theProduct);
                } else {
                    productItemsInCart.pop();
                }
            }

            this.cartDidUpdate();

            return newQuantity;
        }

        return -1;
    }

    public getTotalProductsInCart(): number {
        return this.totalProducts;
    }

    public getMoneyAmount(): number {
        return this.moneyAmount;
    }

    dropProductFromCart(product: IProduct): void {
        const { id } = product;
        const productItemsInCart: IProduct[] | undefined = this.cart.get(id);

        if (productItemsInCart) {
            this.quantityHasChangedByPcs(-productItemsInCart.length, productItemsInCart[0]);
            this.cart.delete(id);
            this.actualizeCurrentPage();
        }
        this.cartDidUpdate();
    }

    /**
     * Get products from cart
     * @returns Products in Cart. Structure is "id: Array_of_product_items".
     */
    getAllProducts(): Map<number, IProduct[]> {
        return this.cart;
    }

    private saveCartStateToLocalStorage() {
        const objFromMap = Object.fromEntries(this.cart);
        localStorage.setItem('cart', JSON.stringify(objFromMap));
        localStorage.setItem('moneyAmount', String(this.moneyAmount));
        localStorage.setItem('totalProducts', String(this.totalProducts));
    }

    private loadCartStateFromLocalStorage() {
        const cartString: string | null = localStorage.getItem('cart');
        const moneyAmount: string | null = localStorage.getItem('moneyAmount');
        const totalProducts: string | null = localStorage.getItem('totalProducts');

        if (cartString) {
            const jsonCart: { [id: string]: IProduct[] } = JSON.parse(cartString);

            for (const [id, product] of Object.entries(jsonCart)) {
                this.cart.set(Number(id), product);
            }
            console.log(this.cart);
        }

        if (moneyAmount) {
            this.moneyAmount = Number(moneyAmount);
        }
        if (totalProducts) {
            this.totalProducts = Number(totalProducts);
        }
    }

    private cartDidUpdate(): void {
        this.header.updateHeader(this.moneyAmount, this.totalProducts);
        this.saveCartStateToLocalStorage();
    }

    clearCart(): void {
        this.cart.clear();
        this.totalProducts = 0;
        this.moneyAmount = 0;
        this.cartDidUpdate();
    }

    private get totalPage(): number {
        return Math.ceil(this.cart.size / this.showedOnPage);
    }

    public get startIndexForCurrentPage(): number {
        return (this.currentPage - 1) * this.showedOnPage + 1;
    }

    private getIdsForPage(page: number): number[] {
        const idsInCart: number[] = [...this.cart.keys()];

        const startProductOffset = (page - 1) * this.showedOnPage;
        const endProductOffset = startProductOffset + this.showedOnPage;

        const neededProductsIDs = idsInCart.slice(startProductOffset, endProductOffset);

        return neededProductsIDs;
    }

    public getProductsForPage(page: number = this.currentPage): Map<number, IProduct[]> | null {
        if (page > this.totalPage) {
            return null;
        }

        const resultProducts: Map<number, IProduct[]> = new Map();

        const neededProductsIDs = this.getIdsForPage(page);
        neededProductsIDs.forEach((id) => {
            const productFromCart: IProduct[] | undefined = this.cart.get(id);
            if (productFromCart) {
                resultProducts.set(id, productFromCart);
            }
        });

        return resultProducts;
    }

    public get currentCartPage(): number {
        return this.currentPage;
    }

    public incDecPageNumberBy(step: number) {
        const newPage = this.currentPage + step;

        if (newPage < 1 || newPage > this.totalPage) {
            return;
        }

        this.currentPage = newPage;
        setUrlParameter('page', String(this.currentPage));
    }

    public get productLimitPerPage() {
        return this.showedOnPage;
    }

    public set productLimitPerPage(newLimit) {
        if (newLimit < 1) {
            return;
        }

        this.showedOnPage = newLimit;
        this.actualizeCurrentPage();

        setUrlParameter('limit', String(newLimit));
    }

    private actualizeCurrentPage(): void {
        if (this.currentPage > this.totalPage && this.totalPage !== 0) {
            this.currentPage = this.totalPage;
            setUrlParameter('page', String(this.currentPage));
        }
    }

    private applySettingsFromQueryString(): void {
        const parametersObject = getParametersFromQuery();

        for (const [parameter, value] of Object.entries(parametersObject)) {
            if (parameter === 'limit') {
                this.productLimitPerPage = Number(value);
            } else if (parameter === 'page') {
                this.currentPage = Number(value);
            }
        }
    }
}
