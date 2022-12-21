export function createDiv(className: string): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add(className);
    return div;
}
