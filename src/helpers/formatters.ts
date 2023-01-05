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

export function ccFormat(value: string) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
        return parts.join(' ');
    } else {
        return value;
    }
}
