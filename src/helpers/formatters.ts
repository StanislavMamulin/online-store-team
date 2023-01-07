export function CardNumberFormatter(el: HTMLInputElement) {
    const num = [4, 10, 16];
    {
        if (num.includes(el.value.length)) {
            el.value += '  ';
        }
    }
}

export function CardDateFormatter(value: string) {
    return value
        .replace(
            /[^0-9]/g,
            '' // To allow only numbers
        )
        .replace(
            /^([2-9])$/g,
            '0$1' // To handle 3 > 03
        )
        .replace(
            /^(1{1})([3-9]{1})$/g,
            '0$1/$2' // 13 > 01/3
        )
        .replace(
            /^0{1,}/g,
            '0' // To handle 00 > 0
        )
        .replace(
            /^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g,
            '$1/$2' // To handle 113 > 11/3
        );
}

export function ccFormat(value: string) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v === '') {
        return v;
    }
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

export function cvvFormat(value: string) {
    return value.replace(/[^0-9]/g, ''); // To allow only numbers
}
