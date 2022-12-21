import { productsCollection } from '../products';
import { IProduct } from '../types';

export class ProductsController {
    private readonly products: IProduct[];
    private allFilters: Map<keyof IProduct, (x: IProduct) => boolean> = new Map();

    private categoriesForFilter: string[] = [];
    private brandsForFilter: string[] = [];
    private priceRange: [number, number] = [0, Number.MAX_VALUE];
    private stockRange: [number, number] = [0, Number.MAX_VALUE];

    filteredProducts: IProduct[];

    constructor() {
        this.products = productsCollection;
        this.filteredProducts = this.products;

        this.addFilters();
    }

    private addFilters(): void {
        this.allFilters.set('category', this.filterByCategory);
        this.allFilters.set('brand', this.filterByBrand);
        this.allFilters.set('price', this.filterByPrice);
        this.allFilters.set('stock', this.filterByStock);
    }

    private toggleFilter(filter: string[], newValue: string) {
        const index = filter.findIndex((value) => value === newValue);

        if (index === -1) {
            filter.push(newValue);
        } else {
            filter.splice(index, 1);
        }
    }

    private changeLimitOfRange(range: [number, number], newLimit: [number, number]) {
        console.log('change limit of range');
    }

    setFilterForField(field: keyof IProduct, filterValue: string | [number, number]) {
        if (typeof filterValue === 'string') {
            if (field === 'brand') {
                this.toggleFilter(this.brandsForFilter, filterValue);
            } else if (field === 'category') {
                this.toggleFilter(this.categoriesForFilter, filterValue);
            }
        }

        if (Array.isArray(filterValue)) {
            if (field === 'price') {
                this.changeLimitOfRange(this.priceRange, filterValue);
            } else if (field === 'stock') {
                this.changeLimitOfRange(this.stockRange, filterValue);
            }
        }

        this.filterProducts();
    }

    private isProductInArray = (fieldOfProduct: string, filters: string[]): boolean => {
        if (filters.length === 0) {
            return true;
        }

        return this.loweredArrayValues(filters).includes(fieldOfProduct.toLowerCase());
    };

    private isPropertyInRange = (propertyOfProduct: number, range: number[]): boolean => {
        if (range.length === 0) {
            return true;
        }

        return propertyOfProduct >= Math.min(...range) && propertyOfProduct <= Math.max(...range);
    };

    private normalizeField(field: string): string {
        let searchField: string = field;
        if (field.includes('discount')) {
            searchField = 'discountPercentage';
        }

        return searchField;
    }

    sortAsc(field: string) {
        const searchField: string = this.normalizeField(field);

        return this.filteredProducts.sort(
            (a, b) => Number(a[searchField as keyof IProduct]) - Number(b[searchField as keyof IProduct])
        );
    }

    sortDesc(field: string) {
        const searchField: string = this.normalizeField(field);

        return this.filteredProducts.sort(
            (a, b) => Number(b[searchField as keyof IProduct]) - Number(a[searchField as keyof IProduct])
        );
    }

    private filterByCategory = (product: IProduct): boolean =>
        this.isProductInArray(product.category, this.categoriesForFilter);

    private filterByBrand = (product: IProduct): boolean => this.isProductInArray(product.brand, this.brandsForFilter);

    private filterByPrice = (product: IProduct): boolean => this.isPropertyInRange(product.price, this.priceRange);

    private filterByStock = (product: IProduct): boolean => this.isPropertyInRange(product.stock, this.stockRange);

    private filterProducts() {
        this.filteredProducts = Array(...this.products);

        for (const filterFunc of this.allFilters.values()) {
            this.filteredProducts = this.filteredProducts.filter(filterFunc);
        }
    }

    private loweredArrayValues(array: string[]) {
        return array.map((value) => value.toLowerCase());
    }

    getAllValuesFromField(field: string) {
        const values = this.products.map((product) => product[field as keyof IProduct]);
        return new Set(this.loweredArrayValues(values as Array<string>));
    }

    public getAllValuesAndTotalAmountFromField(field: keyof IProduct) {
        const counter: Map<string, number> = new Map();

        this.products.forEach((product: IProduct) => {
            const fieldValue = String(product[field]).trim().toLowerCase();
            const currentAmount: number | undefined = counter.get(fieldValue);

            const newAmount = currentAmount ? currentAmount + 1 : 1;
            counter.set(String(fieldValue).toLowerCase(), newAmount);
        });

        return counter;
    }

    searchProduct(searchRequest: string) {
        this.filteredProducts = Array(...this.products);
        this.filterProducts();

        this.filteredProducts = this.filteredProducts.filter((product) => {
            // skip unnecessary fields
            const excludeField = new Set(['id', 'thumbnail', 'images']);
            const searchableFields = { ...Object.entries(product).filter((e) => !excludeField.has(e[0])) };

            // array of all product values
            const productValues = Object.values(searchableFields).map((value) => String(value).toLowerCase());

            return productValues.some((value) => value.includes(searchRequest.toLowerCase()));
        });
        console.log(this.filteredProducts);
    }
}
