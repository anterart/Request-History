
const getHeadersMap = headers => {
    if (!headers) {
        return new Map();
    }
    return new Map(
        headers.map(header => [header.name, header.value])
    );
};


const processRequestHeadersListener = details => {
    console.log('Im running4!')
    const retObj = {
        requestHeaders: getHeadersMap(details.requestHeaders)
    };
};

const processResponseHeadersListener = details => {
    console.log('Im running5!')
    const retObj = {
        responseHeaders: getHeadersMap(details.responseHeaders)
    };
};


const processRequest = details => {
    console.log('Im running6!')
    const url = new URL(details.url);
    const retObj = {
        queryParams: new URLSearchParams(url.search)
    };
};


const registerRequestInterceptorListeners = () => {
    if (!chrome.webRequest.onBeforeRequest.hasListener(processRequest)) {
        console.log('Im running1!')
        chrome.webRequest.onBeforeRequest.addListener(
            processRequest,
            { urls: ['<all_urls>'] },
            ['blocking']
        );
    }

    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(processRequestHeadersListener)) {
        console.log('Im running2!')
        chrome.webRequest.onBeforeSendHeaders.addListener(
            processRequestHeadersListener,
            { urls: ['<all_urls>'] },
            ['blocking', 'requestHeaders', 'extraHeaders']
        );
    }

    if (!chrome.webRequest.onHeadersReceived.hasListener(processResponseHeadersListener)) {
        console.log('Im running3!')
        chrome.webRequest.onHeadersReceived.addListener(
            processResponseHeadersListener,
            { urls: ['<all_urls>'] },
            ['blocking', 'responseHeaders', 'extraHeaders']
        );
    }
};

const init  = () => {
    registerRequestInterceptorListeners();
};

console.log('Im running aaaaaaaaaaaa!')
init();
