import { IProduct } from '../types';
import { Header } from '../view/Header/Header';

const INIT_SHOWED_ON_PAGE = 3;
const INIT_CURRENT_PAGE = 1;

export class CartController {
    private cart: Map<number, IProduct[]> = new Map();
    private moneyAmount: number;
    private totalProducts: number;
    private currentPage: number;
    private showedOnPage: number;

    constructor(private header: Header) {
        this.moneyAmount = 0;
        this.totalProducts = 0;
        this.loadCartStateFromLocalStorage();

        this.currentPage = INIT_CURRENT_PAGE;
        this.showedOnPage = INIT_SHOWED_ON_PAGE;
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
    }
}
