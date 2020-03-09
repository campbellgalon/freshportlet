//Refreshes all NetSuite/NetLedger pages after installing the extension, so that the content script will be injected into any already open pages.
chrome.runtime.onInstalled.addListener(function () {
	chrome.tabs.query({
		url: ('*://*.app.netsuite.com/app/center/*')
	}, function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
			chrome.tabs.update(tabs[i].id, {
				url: tabs[i].url
			});
		}
	});
});