import { createDiv } from '../../../../helpers/createHTMLElements';

type Callback = (event: Event, typeOfFilter: string) => void;

const createCheckbox = (
    name: string,
    isActive: boolean,
    callback: Callback,
    typeOfFilter: string
): HTMLInputElement => {
    const check: HTMLInputElement = document.createElement('input');
    check.type = 'checkbox';
    check.id = name;
    check.checked = isActive;

    check.addEventListener('change', (ev) => {
        callback(ev, typeOfFilter);
    });

    return check;
};

const createLabel = (name: string): HTMLLabelElement => {
    const label: HTMLLabelElement = document.createElement('label');
    label.htmlFor = name;
    label.appendChild(document.createTextNode(name));

    return label;
};

const createTotalSpan = (total: number) => {
    const totalElement: HTMLSpanElement = document.createElement('span');
    totalElement.innerText = `(${total}/${total})`;

    return totalElement;
};

const FilterRow = (
    name: string,
    total: number,
    callback: Callback,
    typeOfFilter: string,
    isActive = false
): HTMLElement => {
    const filterLine: HTMLDivElement = createDiv('filter-line');

    const check = createCheckbox(name, isActive, callback, typeOfFilter);
    const label = createLabel(name);
    const totalElement = createTotalSpan(total);

    filterLine.append(check, label, totalElement);

    return filterLine;
};

export const FilterList = (typeOfFilter: string, filters: Map<string, number>, callback: Callback): HTMLElement => {
    const filterList: HTMLDivElement = createDiv('filter-list');

    filters.forEach((totalItem, itemName) => {
        filterList.append(FilterRow(itemName, totalItem, callback, typeOfFilter));
    });

    return filterList;
};
