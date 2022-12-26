import { IProduct } from '../types';
import { Header } from '../view/Header/Header';

interface CartProduct extends IProduct {
    quantity: number;
}

export class CartController {
    private static instance: CartController;

    private cart: Map<number, CartProduct> = new Map();
    private moneyAmount: number;
    private totalProducts: number;

    constructor(private header: Header) {
        this.moneyAmount = 0;
        this.totalProducts = 0;
    }

    addProductToCart(product: IProduct): void {
        const { id } = product;
        if (this.cart.has(id)) {
            // the product is already in the cart - delete it
            this.quantityHasChangedByPcs(-1, this.cart.get(id) as CartProduct);
            this.cart.delete(id);
        } else {
            const newProductInCart = {
                ...product,
                quantity: 1,
            };

            this.cart.set(id, newProductInCart);
            this.quantityHasChangedByPcs(1, newProductInCart);
        }
        this.header.updateHeader(this.moneyAmount, this.totalProducts);
    }

    private quantityHasChangedByPcs(pcs: number, product: CartProduct) {
        this.moneyAmount += product.price * pcs;
        this.totalProducts += pcs;
    }

    /**
     * Change the quantity of the product in the cart
     * @param id - Product ID
     * @param quantity - How much to change the amount (-1/+1)
     */
    changeQuantityById(id: number, quantity: number): void {
        const product: CartProduct | undefined = this.cart.get(id);

        if (product) {
            const currentProductsStock: number = product.stock;
            const newQuantity: number = product.quantity + quantity;
            if (newQuantity > currentProductsStock) {
                return;
            }

            this.quantityHasChangedByPcs(quantity, product);

            if (newQuantity <= 0) {
                this.cart.delete(id); // delete the product
            } else {
                // change the quantity
                this.cart.set(id, {
                    ...product,
                    quantity: newQuantity,
                });
            }
        }
    }

    public getTotalProductsInCart(): number {
        return this.totalProducts;
    }

    public getMoneyAmount(): number {
        return this.moneyAmount;
    }
}
