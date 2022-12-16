import { productsCollection } from '../products';
import { IProduct } from '../types';

export class ProductsController {
    products: IProduct[];
    private allFilters: Map<keyof IProduct, (x: IProduct) => boolean> = new Map();

    categoriesForFilter: string[] = [];
    brandsForFilter: string[] = [];
    priceRange: [number, number] = [0, Number.MAX_VALUE];
    stockRange: [number, number] = [0, Number.MAX_VALUE];

    filteredProducts: IProduct[];

    constructor() {
        this.products = productsCollection;
        this.filteredProducts = this.products;

        // add filters
        this.allFilters.set('category', this.filterByCategory);
        this.allFilters.set('brand', this.filterByBrand);
        this.allFilters.set('price', this.filterByPrice);
        this.allFilters.set('stock', this.filterByStock);
    }

    private toggleValue(filter: string[], newValue: string) {
        const index = filter.findIndex((value) => value === newValue);

        if (index === -1) {
            filter.push(newValue);
        } else {
            filter.splice(index, 1);
        }
    }

    private changeLimitOfRange(range: [number, number], newLimit: number) {
        console.log('change limit of range');
    }

    setFilterForField(field: keyof IProduct, filterValue: string & number) {
        if (field === 'brand') {
            this.toggleValue(this.brandsForFilter, filterValue);
        } else if (field === 'category') {
            this.toggleValue(this.categoriesForFilter, filterValue);
        } else if (field === 'price') {
            this.changeLimitOfRange(this.priceRange, filterValue);
        } else if (field === 'stock') {
            this.changeLimitOfRange(this.stockRange, filterValue);
        }

        this.filterProducts();
    }

    isProductInArray = (fieldOfProduct: string, filters: string[]): boolean => {
        if (filters.length === 0) {
            return true;
        }

        return this.loweredArrayValues(filters).includes(fieldOfProduct.toLowerCase());
    };

    isPropertyInRange = (propertyOfProduct: number, range: number[]): boolean => {
        if (range.length === 0) {
            return true;
        }

        return propertyOfProduct >= Math.min(...range) && propertyOfProduct <= Math.max(...range);
    };

    sortAsc(field: string) {
        return this.products.sort((a, b) => Number(a[field as keyof IProduct]) - Number(b[field as keyof IProduct]));
    }

    sortDesc(field: string) {
        return this.products.sort((a, b) => Number(b[field as keyof IProduct]) - Number(a[field as keyof IProduct]));
    }

    filterByCategory = (product: IProduct): boolean =>
        this.isProductInArray(product.category, this.categoriesForFilter);

    filterByBrand = (product: IProduct): boolean => this.isProductInArray(product.brand, this.brandsForFilter);

    filterByPrice = (product: IProduct): boolean => this.isPropertyInRange(product.price, this.priceRange);

    filterByStock = (product: IProduct): boolean => this.isPropertyInRange(product.stock, this.stockRange);

    filterProducts() {
        this.filteredProducts = this.products;

        for (const filterFunc of this.allFilters.values()) {
            this.filteredProducts = this.filteredProducts.filter(filterFunc);
        }
    }

    private loweredArrayValues(array: string[]) {
        return array.map((value) => value.toLowerCase());
    }
}
