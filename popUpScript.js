checkBoxBtn = document.getElementById('requestTrackingCheckBox');
chrome.storage.sync.get('requestHistoryTrackingIsOn', function(result) {
    checkBoxBtn.checked = result.requestHistoryTrackingIsOn;
    checkBoxBtn.addEventListener('change', function() {
        chrome.storage.sync.set({requestHistoryTrackingIsOn: checkBoxBtn.checked}, function() {
        });
    });
})
