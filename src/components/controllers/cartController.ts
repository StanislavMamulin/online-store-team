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
     */
    changeQuantityById(id: number, quantity: number): void {
        const productItemsInCart: IProduct[] | undefined = this.cart.get(id);

        if (productItemsInCart) {
            const theProduct: IProduct = productItemsInCart[0];
            const productQuantity: number = productItemsInCart.length;
            const currentProductStock: number = theProduct.stock;

            const newQuantity: number = productQuantity + quantity;
            if (newQuantity > currentProductStock) {
                return;
            }

            this.quantityHasChangedByPcs(quantity, theProduct);

            if (newQuantity <= 0) {
                this.cart.delete(id); // delete the product
            } else {
                // change the quantity
                productItemsInCart.push(theProduct);
            }
        }
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
}
