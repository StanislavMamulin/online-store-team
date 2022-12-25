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

// export function addToCart(elems: NodeListOf<Element>, counter: HTMLElement) {
//     for (let i = 0; i < elems.length; i++) {
//         elems[i].addEventListener('click', () => {
//             elems[i].classList.toggle('added');
//             let count = Number(counter.innerHTML);

//             if (elems[i].classList.contains('added')) {
//                 count++;
//                 elems[i].innerHTML = 'DROP FROM CART';
//             } else {
//                 count--;
//                 elems[i].innerHTML = 'ADD TO CART';
//             }

//             counter.innerHTML = `${count}`;
//             console.log(count);
//         });
//     }
// }
