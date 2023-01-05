import { getMinAndMaxNumberFromArray, loweredArrayValues, toggleValueInArray } from '../../helpers/arrayHelpers';
import { isNumberInRange, isStringInArray } from '../../helpers/checkers';
import { AND_SYMBOL, FiltersFromQuery, getFiltersFromQuery, setUrlParameter } from '../../helpers/routeHelper';
import { productsCollection } from '../products';
import { IProduct } from '../types';

export enum SortDirection {
    asc = 'ASC',
    desc = 'DESC',
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
        this.filteredProducts = Array(...this.products);

        for (const filterFunc of this.allFilters.values()) {
            this.filteredProducts = this.filteredProducts.filter(filterFunc);
        }
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
        this.searchString = searchRequest;
    }

    private applyFiltersFromQueryString(): void {
        const filtersObject: FiltersFromQuery = getFiltersFromQuery();

        for (const [filterName, value] of Object.entries(filtersObject)) {
            if (value.includes(AND_SYMBOL)) {
                // multiple choice or range filter
                if (filterName === 'category' || filterName === 'brand') {
                    const filterValues = value.split(AND_SYMBOL);
                    filterValues.forEach((filterValue) => {
                        this.setFilterForField(filterName, filterValue);
                    });
                } else if (filterName === 'price' || filterName === 'stock') {
                    const [from, to] = value.split(AND_SYMBOL);
                    this.setFilterForField(filterName, [Number(from), Number(to)]);
                }
            } else {
                // single choice filter
                if (filterName === 'sort') {
                    this.sort = value;
                    const [typeOfSort, direction] = value.split('-');
                    if (direction === SortDirection.asc) {
                        this.sortAsc(typeOfSort);
                    } else {
                        this.sortDesc(typeOfSort);
                    }
                } else if (filterName === 'search') {
                    this.searchProduct(value);
                }
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
}
