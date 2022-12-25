import { productsCollection } from '../products';
import { IProduct } from '../types';
import { Header } from '../view/Header/Header';

interface CartProduct extends IProduct {
    quantity: number;
}

let instanceOfCart: CartController;

export class CartController {
    private cart: Map<number, CartProduct> = new Map();

    constructor(private header: Header) {
        if (instanceOfCart) {
            throw new Error('New instance cannot be created!!');
        }

        this.cart = new Map();
    }

    getActualCart() {
        return this.cart;
    }

    getActualCartCount() {
        return this.cart.size;
    }

    addProductToCartByID(id: number, product: IProduct): void {
        if (this.cart.has(id)) {
            this.cart.delete(id); // the product is already in the cart - delete it
        } else {
            this.cart.set(id, {
                ...product,
                quantity: 1,
            });
        }
        this.header.updateHeader(100, this.cart.size);
    }

    addToCartByID(id: number): void {
        if (this.cart.has(id)) {
            this.cart.delete(id); // the product is already in the cart - delete it
        } else {
            const product: IProduct | undefined = productsCollection.find((product) => product.id === id);

            if (product) {
                this.cart.set(id, {
                    ...product,
                    quantity: 1,
                });
            }
        }
    }

    /**
     * Change the quantity of the product in the cart
     * @param id - Product ID
     * @param quantity - How much to change the amount
     */
    changeQuantityById(id: number, quantity: number): void {
        const product = this.cart.get(id);

        if (product) {
            this.cart.set(id, {
                ...product,
                quantity: product.quantity + quantity,
            });
        }
    }
}

// export const Cart = Object.freeze(new CartController());
