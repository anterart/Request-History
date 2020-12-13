// Popup scripts

checkBoxBtn = document.getElementById('requestTrackingCheckBox');
chrome.storage.sync.get('requestHistoryTrackingIsOn', function(result) {
    checkBoxBtn.checked = result.requestHistoryTrackingIsOn;
    checkBoxBtn.addEventListener('change', function() {
        chrome.storage.sync.set({requestHistoryTrackingIsOn: checkBoxBtn.checked}, function() {
        });
    });
})

showCollectedResultsBtn = document.getElementById('showCollectedRequests');
showCollectedResultsBtn.addEventListener('click', function () {
    // Opens a new tab with ../pages/showCollectedRequests.html
    chrome.tabs.create({url: "../pages/showCollectedRequests.html"});
});

showQuickStatsBtn = document.getElementById('showQuickStats');
showQuickStatsBtn.addEventListener('click', function () {
    // Opens a new tab with ../pages/showQuickStats.html
    chrome.tabs.create({url: "../pages/showQuickStats.html"});
});

// reference to Chrome IndexedDB
const db = new Dexie('requestHistoryDB');
db.version(1).stores({
    requests: '++id, initiator, method, timeStampStarted, timeStampCompleted, type, url, requestHeaders, responseHeaders, statusCode, isSuccessful'
});


/**
 * Exports the DB content to memory.
 */
function exportDB() {
    return db.transaction('r', db.tables, ()=>{
        return Promise.all(
            db.tables.map(table => table.toArray()
                .then(rows => ({table: table.name, rows: rows}))));
    });
}

/**
 * Downloads a file containing text and names the file with filename
 * @param {string} filename 
 * @param {string} text 
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

exportCollectedRequestsBtn = document.getElementById('exportCollectedRequests');
exportCollectedRequestsBtn.addEventListener('click', async function () {
    // Exports the DB to memory, serializing it and downloads it
    const allData = await exportDB();
    const serialized = JSON.stringify(allData);
    download('requestHistory.json', serialized);
})




