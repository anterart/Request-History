// Module that collects requests fired in the browser and stores them in Chrome IndexedDB.

// Reference to IndexedDB
const db = new Dexie('requestHistoryDB');
db.version(1).stores({
    requests: '++id, initiator, method, timeStampStarted, timeStampCompleted, type, url, requestHeaders, responseHeaders, statusCode, isSuccessful'
});

// Intermediate requests storing map
const requestMap = new Map();

/**
 * If requestHistoryTrackingIsOn key in storage is true, or the request was already partially parsed,
 * proceed processing the request by calling the callback with the request details.
 * @param {CallableFunction} callback 
 * @param {object} details 
 */
function proceedProcessingRequest(callback, details) {
    chrome.storage.sync.get('requestHistoryTrackingIsOn', function(result) {
        if (result.requestHistoryTrackingIsOn || requestMap.has(details.requestId)){
            callback(details);
        }
    });
}

/**
 * Handler of onBeforeRequest event.
 * @param {object} details 
 */
const processBeforeRequest = details => {
    callback = function (arg) {
        const requestId = arg.requestId;
        const requestDetails = {timeStampStarted: null,
                                initiator: null,
                                method: null,
                                type: null,
                                url: null,
                                requestHeaders: null,
                                responseHeaders: null,
                                statusCode: null,
                                timeStampComplete: null,
                                isSuccessful: false};
        requestDetails.timeStampStarted = arg.timeStamp;
        requestDetails.initiator = arg.initiator;
        requestDetails.method = arg.method;
        requestDetails.type = arg.type;
        requestDetails.url = arg.url;
        requestMap.set(requestId, requestDetails);
    }
    proceedProcessingRequest(callback, details);
};

/**
 * Handler of onRequestHeaders event.
 * @param {object} details 
 */
const processRequestHeadersListener = details => {
    callback = function (arg) {
        requestMap.get(details.requestId).requestHeaders = arg.requestHeaders;
    }
    proceedProcessingRequest(callback, details);
};

/**
 * Handler of onResponseHeaders event.
 * @param {object} details 
 */
const processResponseHeadersListener = details => {
    callback = function (arg) {
        const requestDetails = requestMap.get(arg.requestId);
        requestDetails.responseHeaders = arg.responseHeaders;
        requestDetails.statusCode = arg.statusCode;
    }
    proceedProcessingRequest(callback, details);
};

/**
 * Stores the request
 * @param {object} details : request details
 * @param {boolean} isSuccessful : if the request is successful or not
 */
function storeRequestDetails(details, isSuccessful) {
    callback = function (arg) {
        const requestDetails = requestMap.get(arg.requestId);
        requestDetails.timeStampComplete = arg.timeStamp;
        requestDetails.isSuccessful = isSuccessful;
        db.requests.put(requestDetails);
    }
    proceedProcessingRequest(callback, details);
}

/**
 * onCompleted handler.
 * @param {object} details 
 */
const processCompletedListener = details => {
    callback = function (arg) {
        storeRequestDetails(arg, true);
    }
    proceedProcessingRequest(callback, details);
};

/**
 * onErrorOccured handler.
 * @param {object} details 
 */
const processErrorOccurredListener = details => {
    callback = function (arg) {
        storeRequestDetails(arg, false);
    }
    proceedProcessingRequest(callback, details);
}

/**
 * Registers event listeners for request related events.
 */
const registerRequestInterceptorListeners = () => {
    console.log('creating listeners')
    if (!chrome.webRequest.onBeforeRequest.hasListener(processBeforeRequest)) {
        chrome.webRequest.onBeforeRequest.addListener(
            processBeforeRequest,
            { urls: ['<all_urls>'] }
        );
    }

    if (!chrome.webRequest.onBeforeSendHeaders.hasListener(processRequestHeadersListener)) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            processRequestHeadersListener,
            { urls: ['<all_urls>'] },
            ['requestHeaders', 'extraHeaders']
        );
    }

    if (!chrome.webRequest.onHeadersReceived.hasListener(processResponseHeadersListener)) {
        chrome.webRequest.onHeadersReceived.addListener(
            processResponseHeadersListener,
            { urls: ['<all_urls>'] },
            ['responseHeaders', 'extraHeaders']
        );
    }

    if (!chrome.webRequest.onErrorOccurred.hasListener(processErrorOccurredListener)) {
        chrome.webRequest.onErrorOccurred.addListener(
            processErrorOccurredListener,
            { urls: ['<all_urls>'] }
        );
    }

    if (!chrome.webRequest.onCompleted.hasListener(processCompletedListener)) {
        chrome.webRequest.onCompleted.addListener(
            processCompletedListener,
            { urls: ['<all_urls>'] }
        );
    }
};

/**
 * Initializes request storing mechanisms.
 */
const init = async () => {
    console.log('Starting init');
    chrome.storage.sync.get({requestHistoryTrackingIsOn: true}, function(data) {
        chrome.storage.sync.set({requestHistoryTrackingIsOn: data.requestHistoryTrackingIsOn}, function() {
  });
});
    registerRequestInterceptorListeners();
};

init();
