import { getFiltersFromQuery } from '../../helpers/routeHelper';

export const getSortDirectionAndFieldName = (selectedValue: string): [string, string] => {
    const select = selectedValue.split(' ');
    const direction = select[select.length - 1].trim();
    const field = select[select.length - 2].trim();
    return [direction, field];
};

export const enum ViewMode {
    big = 'big',
    small = 'small',
}

export const getCurrentViewModeFromQuery = (): ViewMode => {
    const viewMode: string | undefined = getFiltersFromQuery().viewmode;
    if (viewMode && viewMode === ViewMode.small) {
        return ViewMode.small;
    }
    return ViewMode.big;
};
