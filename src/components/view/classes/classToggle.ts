export function addClass(elems: NodeListOf<Element>, classname: string): void {
    for (let i = 0; i < elems.length; i++) {
        elems[i].classList.add(classname);
    }
}

export function removeClass(elems: NodeListOf<Element>, classname: string): void {
    for (let i = 0; i < elems.length; i++) {
        elems[i].classList.remove(classname);
    }
}
