import { loweredArrayValues } from './arrayHelpers';

export const isStringInArray = (value: string, array: string[]): boolean => {
    if (array.length === 0) {
        return true;
    }

    return loweredArrayValues(array).includes(value.toLowerCase());
};

export const isNumberInRange = (number: number, range: number[]): boolean => {
    if (range.length === 0) {
        return true;
    }

    return number >= Math.min(...range) && number <= Math.max(...range);
};
