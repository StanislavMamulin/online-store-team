import { Page } from '../../../helpers/Page';
import { CartController } from '../../controllers/cartController';

export class ProductPage extends Page {
    selectedProduct?: IProduct;

    constructor(el: HTMLElement, id: string, private cartController: CartController, productID: number) {
        super(el, id);
        this.selectedProduct = productsCollection.find((product: IProduct) => product.id === productID);
    }

    render(): void {
        if (this.selectedProduct) {
            this.el.innerHTML = '';
            this.el.classList.add('product-details');
            const productWrapper = this.createProductWrapper();
            this.el.append(productWrapper);
        }
    }

    private createProductWrapper(): HTMLElement {
        const wrapper = createDiv('product-wrapper');
        const linkNavigation = this.createLinkNavigation();
        const productDetail = this.createProductDetail();
        wrapper.append(linkNavigation, productDetail);
        return wrapper;
    }

    private createLinkNavigation(): HTMLElement {
        const linkContainer = createDiv('link-navigation');
        if (this.selectedProduct) {
            const storeLink = document.createElement('a');
            storeLink.href = `#${PageIds.CatalogPage}`;
            storeLink.innerText = 'STORE';
            storeLink.classList.add('store-link');
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.innerText = this.selectedProduct.category.toUpperCase();
            const brandLink = document.createElement('a');
            brandLink.href = '#';
            brandLink.innerText = this.selectedProduct.brand.toUpperCase();
            const productNameLink = document.createElement('a');
            productNameLink.href = '#';
            productNameLink.innerText = this.selectedProduct.title.toUpperCase();
            linkContainer.append(storeLink, ' >> ', categoryLink, ' >> ', brandLink, ' >> ', productNameLink);
        }
        return linkContainer;
    }

    private createProductDetail(): HTMLElement {
        const detailContainer = createDiv('product-detail');

        if (this.selectedProduct) {
            const titleContainer = createDiv('product-title');
            const titleBlock = document.createElement('h1');
            titleBlock.innerText = this.selectedProduct.title;
            titleContainer.append(titleBlock);
            const dataContainer = createDiv('product-data');
            const photosBlock = this.createProductPhotos();
            const infoBlock = this.createProductInfo();
            const buttonBlock = this.createAddToCart();
            dataContainer.append(photosBlock, infoBlock, buttonBlock);
            detailContainer.append(titleContainer, dataContainer);
        }

        return detailContainer;
    }

    private createProductPhotos(): HTMLElement {
        const photosContainer = createDiv('product-photos');
        if (this.selectedProduct) {
            const slides = createDiv('slides');
            const grandPhoto = createDiv('grand-photo');
            const grandImg = document.createElement('img');
            grandImg.src = this.selectedProduct.thumbnail;
            grandImg.alt = 'Photo';
            grandPhoto.append(grandImg);
            for (let i = 0; i < this.selectedProduct.images.length; i++) {
                const productImg = document.createElement('img');
                productImg.src = this.selectedProduct.images[i];
                productImg.alt = 'Slide';
                productImg.addEventListener('click', () => {
                    grandImg.src = productImg.src;
                });
                slides.append(productImg);
            }
            photosContainer.append(slides, grandPhoto);
        }

        return photosContainer;
    }

    private createProductInfo(): HTMLElement {
        const infoContainer = createDiv('product-info');

        if (this.selectedProduct) {
            const descriptionBlock = this.createProductDetailItem('Description', this.selectedProduct.description);
            const discountBlock = this.createProductDetailItem(
                'Discount Percentage',
                `${this.selectedProduct.discountPercentage}`
            );
            const ratingBlock = this.createProductDetailItem('Rating', `${this.selectedProduct.rating}`);
            const stockBlock = this.createProductDetailItem('Stock', `${this.selectedProduct.stock}`);
            const brandBlock = this.createProductDetailItem('Brand', this.selectedProduct.brand);
            const categoryBlock = this.createProductDetailItem('Category', this.selectedProduct.category);
            infoContainer.append(descriptionBlock, discountBlock, ratingBlock, stockBlock, brandBlock, categoryBlock);
        }

        return infoContainer;
    }

    private createAddToCart(): HTMLElement {
        const addContainer = createDiv('add-to-cart');

        if (this.selectedProduct) {
            const buttonsBlock = createDiv('cart-button');
            buttonsBlock.innerText = ` €${this.selectedProduct.price.toFixed(2)} `;
            const addButton = document.createElement('button');
            addButton.innerText = this.cartController.isProductInCart(this.selectedProduct)
                ? 'DROP FROM CART'
                : 'ADD TO CART';
            addButton.addEventListener('click', () => {
                if (this.selectedProduct) {
                    this.cartController.addProductToCart(this.selectedProduct);
                    this.render();
                }
            });
            const buyButton = document.createElement('button');
            buyButton.innerText = 'BUY NOW';
            buttonsBlock.append(addButton, buyButton);
            addContainer.append(buttonsBlock);
        }
        return addContainer;
    }

    private createProductDetailItem(title: string, description: string): HTMLElement {
        const item = createDiv('product-detail-item');
        const itemHeader = document.createElement('h3');
        itemHeader.innerText = `${title}:`;
        const itemInfo = document.createElement('p');
        itemInfo.innerText = description;
        item.append(itemHeader, itemInfo);
        return item;
    }
}
