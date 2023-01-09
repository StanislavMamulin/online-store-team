import { getMinAndMaxNumberFromArray, loweredArrayValues, toggleValueInArray } from '../../helpers/arrayHelpers';
import { isNumberInRange, isStringInArray } from '../../helpers/checkers';
import { AND_SYMBOL, ParametersFromQuery, getParametersFromQuery, setUrlParameter } from '../../helpers/routeHelper';
import { productsCollection } from '../products';
import { IProduct } from '../types';

export enum SortDirection {
    asc = 'asc',
    desc = 'desc',
}

export type FilterRange = [number, number];

export class ProductsController {
    private readonly products: IProduct[];
    private allFilters: Map<keyof IProduct, (x: IProduct) => boolean> = new Map();

    private categoriesForFilter: string[] = [];
    private brandsForFilter: string[] = [];
    private priceRange: FilterRange = [0, Number.MAX_VALUE];
    private stockRange: FilterRange = [0, Number.MAX_VALUE];
    private sort = '';
    private searchString = '';

    filteredProducts: IProduct[];

    constructor() {
        this.products = productsCollection;
        this.filteredProducts = this.products;

        this.addFilters();
        this.setRanges();
        this.applyFiltersFromQueryString();
    }

    private addFilters(): void {
        this.allFilters.set('category', this.filterByCategory);
        this.allFilters.set('brand', this.filterByBrand);
        this.allFilters.set('price', this.filterByPrice);
        this.allFilters.set('stock', this.filterByStock);
    }

    setFilterForField(field: keyof IProduct, filterValue: string | [number, number]) {
        if (typeof filterValue === 'string') {
            if (field === 'brand') {
                toggleValueInArray<string>(this.brandsForFilter, filterValue);
            } else if (field === 'category') {
                toggleValueInArray<string>(this.categoriesForFilter, filterValue);
            }
        }

        if (Array.isArray(filterValue)) {
            if (field === 'price') {
                this.priceRange = filterValue;
            } else if (field === 'stock') {
                this.stockRange = filterValue;
            }
        }

        this.filterProducts();
    }

    public isFilterActive(field: string): boolean {
        const isCategoryFilter = this.categoriesForFilter.includes(field);
        const isBrandFilter = this.brandsForFilter.includes(field);

        return isCategoryFilter || isBrandFilter;
    }

    private normalizeField(field: string): string {
        let searchField: string = field;
        if (field.includes('discount')) {
            searchField = 'discountPercentage';
        }

        return searchField;
    }

    sortAsc(field: string) {
        const searchField: string = this.normalizeField(field);

        const sort = `${field}-asc`;
        this.sort = sort;
        setUrlParameter('sort', sort);

        return this.filteredProducts.sort(
            (a, b) => Number(a[searchField as keyof IProduct]) - Number(b[searchField as keyof IProduct])
        );
    }

    sortDesc(field: string) {
        const searchField: string = this.normalizeField(field);

        const sort = `${field}-desc`;
        this.sort = sort;
        setUrlParameter('sort', sort);

        return this.filteredProducts.sort(
            (a, b) => Number(b[searchField as keyof IProduct]) - Number(a[searchField as keyof IProduct])
        );
    }

    private filterByCategory = (product: IProduct): boolean =>
        isStringInArray(product.category, this.categoriesForFilter);

    private filterByBrand = (product: IProduct): boolean => isStringInArray(product.brand, this.brandsForFilter);

    private filterByPrice = (product: IProduct): boolean => isNumberInRange(product.price, this.priceRange);

    private filterByStock = (product: IProduct): boolean => isNumberInRange(product.stock, this.stockRange);

    private filterProducts() {
        let filteredProducts: IProduct[] = productsCollection;

        filteredProducts = this.getFilteredProducts(filteredProducts);

        if (this.searchString) {
            filteredProducts = this.searchInProducts(this.searchString, filteredProducts);
        }

        this.filteredProducts = filteredProducts;

        if (this.sort) {
            const [typeOfSort, direction] = this.sort.split('-');
            if (direction.toLowerCase() === SortDirection.asc) {
                this.sortAsc(typeOfSort);
            } else {
                this.sortDesc(typeOfSort);
            }
        }
    }

    private getFilteredProducts(products: IProduct[]) {
        let filteredProducts = products;

        for (const filterFunc of this.allFilters.values()) {
            filteredProducts = filteredProducts.filter(filterFunc);
        }

        return filteredProducts;
    }

    getAllValuesFromField(field: string, filtered = false): Set<number | string> {
        const valuesFromArray: IProduct[] = filtered ? this.filteredProducts : this.products;

        const values = valuesFromArray.map((product) => product[field as keyof IProduct]);
        let result: (number | string)[] = [];

        if (typeof values[0] === 'string') {
            result = loweredArrayValues(values as Array<string>);
        } else if (typeof values[0] === 'number') {
            result = (values as Array<number>).sort((a, b) => a - b);
        }

        return new Set(result);
    }

    getCountValuesFromProduct(field: string, value: string, filtered: boolean) {
        let counter;
        if (filtered) {
            counter = this.filteredProducts.filter((product) => {
                return String(product[field as keyof IProduct]).toLowerCase() === value.toLowerCase();
            });
        } else {
            counter = this.products.filter((product) => {
                return String(product[field as keyof IProduct]).toLowerCase() === value.toLowerCase();
            });
        }
        return counter.length;
    }

    searchProduct(searchRequest: string) {
        this.searchString = searchRequest;
        this.filterProducts();
    }

    private searchInProducts(searchRequest: string, products: IProduct[]) {
        let filteredProducts: IProduct[] = products;

        filteredProducts = filteredProducts.filter((product) => {
            // skip unnecessary fields
            const excludeField = new Set(['id', 'thumbnail', 'images']);
            const searchableFields = { ...Object.entries(product).filter((e) => !excludeField.has(e[0])) };

            // array of all product values
            const productValues: string[] = Object.values(searchableFields).map((value) => String(value).toLowerCase());

            return productValues.some((value: string) => value.includes(searchRequest.toLowerCase()));
        });

        return filteredProducts;
    }

    private applyFiltersFromQueryString(): void {
        const filtersObject: ParametersFromQuery = getParametersFromQuery();

        for (const [filterName, value] of Object.entries(filtersObject)) {
            if (filterName === 'category' || filterName === 'brand') {
                const filterValues = value.split(AND_SYMBOL);
                filterValues.forEach((filterValue) => {
                    this.setFilterForField(filterName, filterValue);
                });
            } else if (filterName === 'price' || filterName === 'stock') {
                const [from, to] = value.split(AND_SYMBOL);
                this.setFilterForField(filterName, [Number(from), Number(to)]);
            } else if (filterName === 'sort') {
                this.sort = value;
                const [typeOfSort, direction] = value.split('-');
                if (direction.toLowerCase() === SortDirection.asc) {
                    this.sortAsc(typeOfSort);
                } else {
                    this.sortDesc(typeOfSort);
                }
            } else if (filterName === 'search') {
                this.searchProduct(value);
            }
        }
    }

    getRangeForField(field: string): FilterRange {
        if (field === 'price') {
            return this.priceRange;
        }

        return this.stockRange;
    }

    private setRanges() {
        const prices = Array.from(this.getAllValuesFromField('price')) as Array<number>;
        const priceRange = getMinAndMaxNumberFromArray(prices);
        this.priceRange = priceRange;

        const stocks = Array.from(this.getAllValuesFromField('stock')) as Array<number>;
        const stockRange = getMinAndMaxNumberFromArray(stocks);
        this.stockRange = stockRange;
    }

    /**
     * Get current sort options
     * @returns "Sort-string": sort field before "-", sort direction after "-"
     */
    getCurrentSort(): string {
        return this.sort;
    }

    getSearchString(): string {
        return this.searchString;
    }

    resetFilters() {
        this.categoriesForFilter = [];
        this.brandsForFilter = [];
        this.sort = '';
        this.searchString = '';
        this.setRanges();

        this.filteredProducts = productsCollection;
    }
}
