export function createDiv(className: string): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add(className);
    return div;
}

export function createSpan(className: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.classList.add(className);
    return span;
}
