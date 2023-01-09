import { SliderValues } from '../components/view/CatalogPage/Slider/RangeSlider';

const parameterType = {
    singleChoice: ['sort', 'search', 'viewmode', 'limit', 'page'],
    multipleChoice: ['category', 'brand'],
    range: ['price', 'stock'],
};

export const AND_SYMBOL = '↕';

export const setUrlParameter = (key: string, value: string | SliderValues) => {
    const currentUrl: URL = new URL(window.location.href);
    const currentSearch: URLSearchParams = currentUrl.searchParams;

    if (parameterType.singleChoice.includes(key)) {
        currentSearch.set(key, value as string);
        if (value === '') {
            currentSearch.delete(key);
        }
    } else if (parameterType.multipleChoice.includes(key)) {
        if (currentSearch.has(key)) {
            const currentValueString = currentSearch.get(key) as string;
            const values = currentValueString.split(AND_SYMBOL);
            const existValueIndex = values.indexOf(value as string);
            if (existValueIndex !== -1) {
                // the value exist in the query - delete it
                values.splice(existValueIndex, 1);
            } else {
                values.push(value as string);
            }
            currentSearch.set(key, values.join(AND_SYMBOL));
        } else {
            currentSearch.append(key, value as string);
        }
    } else if (parameterType.range.includes(key)) {
        if (Array.isArray(value)) {
            currentSearch.set(key, value.join(AND_SYMBOL));
        }
    }

    window.history.replaceState({ path: currentUrl.toString() }, '', currentUrl);
};

export const resetQueryParams = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.search = '';
    window.history.replaceState({ path: currentUrl.toString() }, '', currentUrl);
};

export function getLastSubstring(str: string): string {
    const arr = str.split('/');
    return arr[arr.length - 1];
}

export type ParametersFromQuery = {
    [filterType: string]: string;
};

export const getParametersFromQuery = (): ParametersFromQuery => {
    const currentUrl: URL = new URL(window.location.href);
    const currentSearch: URLSearchParams = currentUrl.searchParams;

    const searchObj: ParametersFromQuery = {};
    for (const [key, value] of currentSearch) {
        searchObj[key] = value;
    }

    return searchObj;
};
