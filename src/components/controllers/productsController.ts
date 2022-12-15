import { productsCollection } from '../products';
import { IProduct } from '../types';

export class ProductsController {
    products: IProduct[];
    filteredArray: IProduct[][] = [];

    constructor() {
        this.products = productsCollection;
    }

    sortAsc(field: string) {
        return this.products.sort((a, b) => Number(a[field as keyof IProduct]) - Number(b[field as keyof IProduct]));
    }

    sortDesc(field: string) {
        return this.products.sort((a, b) => Number(b[field as keyof IProduct]) - Number(a[field as keyof IProduct]));
    }

    filterByField(fields: string[], values: string[]) {
        const loweredValues = this.loweredArrayValues(values);
        for (let i = 0; i < fields.length; i++) {
            if (i === 0) {
                this.filteredArray.push(
                    this.products.filter((product) => {
                        const checkedValue = String(product[fields[i] as keyof IProduct]).toLowerCase();
                        return loweredValues.includes(checkedValue);
                    })
                );
            } else {
                this.filteredArray.push(
                    this.filteredArray.flat().filter((product) => {
                        const checkedValue = String(product[fields[i] as keyof IProduct]).toLowerCase();
                        return loweredValues.includes(checkedValue);
                    })
                );
            }
        }

        return new Set(this.filteredArray.flat());
    }

    private loweredArrayValues(array: string[]) {
        return array.map((value) => value.toLowerCase());
    }
}
