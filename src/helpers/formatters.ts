export function CardNumberFormatter(el: HTMLInputElement) {
    const num = [4, 10, 16];
    {
        if (num.includes(el.value.length)) {
            el.value += '  ';
        }
    }
}

export function CardDateFormatter(el: HTMLInputElement) {
    if (el.value.length === 2) {
        el.value += '/';
    }
}
