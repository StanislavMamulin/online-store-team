export abstract class Page {
    constructor(protected el: HTMLElement, id: string) {
        this.el.id = id;
    }

    render() {
        this.el.innerHTML = '';
    }
}
