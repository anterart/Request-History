const db = new Dexie('requestHistoryDB');
db.version(1).stores({
    requests: '++id, initiator, method, timeStampStarted, timeStampCompleted, type, url, requestHeaders, responseHeaders, statusCode, isSuccessful'
});

const requestMap = new Map();

const processBeforeRequest = details => {
    console.log('processBeforeRequest');
    // const timestamp = moment(details.timestamp).local();
    // const dateTimeStarted = timestamp.format('YYYY-MM-DD hh:mm:ss');
    const requestId = details.requestId;
    const requestDetails = {};
    requestDetails.dateTimeStarted = details.timeStamp;
    requestDetails.initiator = details.initiator;
    requestDetails.method = details.method;
    requestDetails.type = details.type;
    requestDetails.url = details.url;
    requestMap.set(requestId, requestDetails);
};

const processRequestHeadersListener = details => {
    requestMap.get(details.requestId).requestHeaders = details.requestHeaders;
    console.log('processRequestHeadersListener');
};

const processResponseHeadersListener = details => {
    const requestDetails = requestMap.get(details.requestId);
    requestDetails.responseHeaders = details.responseHeaders;
    requestDetails.statusCode = details.statusCode;
    console.log('processResponseHeadersListener');
};

function storeRequestDetails(details, isSuccessful) {
    const requestDetails = requestMap.get(details.requestId);
    requestDetails.timeStampComplete = details.timeStamp;
    requestDetails.isSuccessful = isSuccessful;
    db.requests.put(requestDetails);
}

const processCompletedListener = details => {
    storeRequestDetails(details, true);
    console.log('processCompletedListener');
};

const processErrorOccurredListener = details => {
    storeRequestDetails(details, false);
    console.log('processErrorOccuredListener');
}


const registerRequestInterceptorListeners = () => {
    console.log('creating listeners')
    if (!chrome.webRequest.onBeforeRequest.hasListener(processBeforeRequest)) {
        console.log('register onBeforeRequest');
        chrome.webRequest.onBeforeRequest.addListener(
            processBeforeRequest,
            { urls: ['<all_urls>'] }
        );
    }

    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(processRequestHeadersListener)) {
        console.log('register onBeforeSendHeaders');
        chrome.webRequest.onBeforeSendHeaders.addListener(
            processRequestHeadersListener,
            { urls: ['<all_urls>'] },
            ['requestHeaders', 'extraHeaders']
        );
    }

    if (!chrome.webRequest.onHeadersReceived.hasListener(processResponseHeadersListener)) {
        console.log('register onHeadersReceived');
        chrome.webRequest.onHeadersReceived.addListener(
            processResponseHeadersListener,
            { urls: ['<all_urls>'] },
            ['responseHeaders', 'extraHeaders']
        );
    }

    if (!chrome.webRequest.onErrorOccurred.hasListener(processErrorOccurredListener)) {
        console.log('register onErrorOccured');
        chrome.webRequest.onErrorOccurred.addListener(
            processErrorOccurredListener,
            { urls: ['<all_urls>'] }
        );
    }

    if (!chrome.webRequest.onCompleted.hasListener(processCompletedListener)) {
        console.log('register onCompleted');
        chrome.webRequest.onCompleted.addListener(
            processCompletedListener,
            { urls: ['<all_urls>'] }
        );
    }
};

const init  = () => {
    console.log('Starting init');
    registerRequestInterceptorListeners();
};

init();
