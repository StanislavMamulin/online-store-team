import { IProduct } from '../types';
import { Header } from '../view/Header/Header';

export class CartController {
    private cart: Map<number, IProduct[]> = new Map();
    private moneyAmount: number;
    private totalProducts: number;

    constructor(private header: Header) {
        this.moneyAmount = 0;
        this.totalProducts = 0;
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
        this.header.updateHeader(this.moneyAmount, this.totalProducts);
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
                productItemsInCart.push(theProduct);
            }

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
    }

    /**
     * Get products from cart
     * @returns Products in Cart. Structure is "id: Array_of_product_items".
     */
    getAllProducts(): Map<number, IProduct[]> {
        return this.cart;
    }
}
