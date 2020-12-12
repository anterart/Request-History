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
    chrome.tabs.create({url: "showCollectedRequests.html"});
});

showQuickStatsBtn = document.getElementById('showQuickStats');
showQuickStatsBtn.addEventListener('click', function () {
    chrome.tabs.create({url: "showQuickStats.html"});
});
