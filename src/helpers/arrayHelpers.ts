export const loweredArrayValues = (array: string[]) => {
    return array.map((value) => value.toLowerCase());
};

export const toggleValueInArray = <T>(array: T[], value: T) => {
    const index = array.findIndex((arrayValue) => arrayValue === value);

    if (index === -1) {
        array.push(value);
    } else {
        array.splice(index, 1);
    }
};

export const getMinAndMaxNumberFromArray = (array: number[]): [number, number] => [
    Math.min(...array),
    Math.max(...array),
];
