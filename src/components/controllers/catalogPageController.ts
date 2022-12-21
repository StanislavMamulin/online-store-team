export const getSortDirectionAndFieldName = (selectedValue: string): [string, string] => {
    const select = selectedValue.split(' ');
    const direction = select[select.length - 1].trim();
    const field = select[select.length - 2].trim();
    return [direction, field];
};
