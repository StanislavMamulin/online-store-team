export const insertUrlParameter = (key: string, value: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, value);

    const newurl = window.location.origin + '?' + searchParams.toString();

    window.history.pushState({ path: newurl }, '', newurl);
};

export const removeUrlParameter = (key: string) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    const newUrl = url.href;

    window.history.pushState({ path: newUrl }, '', newUrl);
};
