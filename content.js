//(Triggered on pageload) Looks up stored milliFinal value. If doesn't exist, sets it to 1 minute. If exists and is greater than zero, refreshes portlets. Then, proceeds to initialization function.
function addZeroBefore(n) {
	return (n < 10 ? '0' : '') + n;
}

const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];


function penguin() {
	chrome.storage.local.get(["milliFinal"], function (result) {
		if (result.milliFinal == null) {
			chrome.storage.local.set({
				"milliFinal": 60000
			});
		} else if (result.milliFinal > 0) {
			refreshPortlets();
		} else if (result.milliFinal == 0) {
			chrome.storage.local.get(["printTimeStamp"], function (result) {
				if (result.printTimeStamp == 1) {
					chrome.storage.local.get(["mostRecentRefresh"], function (result) {
						document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:grey; display:inline;">     Portlet refreshing is stopped — last refreshed ' + result.mostRecentRefresh) + '</h4>'
					});
				}
			});
		}
	});
	initialize();
}

chrome.storage.local.get(["printTimeStamp"], function (result) {
	if (result.printTimeStamp == null) {
		chrome.storage.local.set({
			"printTimeStamp": 1
		}, function () {});
	}
});

chrome.storage.onChanged.addListener(function (changes, local) {
	if (changes.printTimeStamp == null) {} else if (changes.printTimeStamp.newValue == 0) {
		if (document.getElementById('ns-dashboard-heading-panel').innerHTML.includes('Home')) {
			document.getElementById('ns-dashboard-heading-panel').innerHTML = '<h1>Home</h1>'
		}
	} else if (changes.printTimeStamp.newValue == 1) {
		chrome.storage.local.get(["milliFinal"], function (result) {
			if (result.milliFinal > 0) {
				chrome.storage.local.get(["currentIntToPersist", "mostRecentRefresh"], function (result) {
					var choppedInt = (result.currentIntToPersist.substr(26));
					if (choppedInt.length > 3) {
						document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:green; display:inline;">     Portlets are refreshing every ' + choppedInt + ' —  last refreshed ' + result.mostRecentRefresh) + '</h4>'
					} else {
						document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:green; display:inline;">     Portlet refreshing is enabled — last refreshed ' + result.mostRecentRefresh) + '</h4>'
					}
				});
			} else {
				chrome.storage.local.get(["mostRecentRefresh"], function (result) {
					document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:grey; display:inline;">     Portlet refreshing is stopped — last refreshed ' + result.mostRecentRefresh) + '</h4>'
				});
			}
		})
	}
});


function homepageUpdate() {
	chrome.storage.onChanged.addListener(function (changes, local) {
		if (document.getElementById('ns-dashboard-heading-panel').innerHTML.includes('Home')) {
			chrome.storage.local.get(["printTimeStamp"], function (result) {
				if (result.printTimeStamp == 0) {} else if (result.printTimeStamp == 1) {
					if (changes.milliFinal == null) {} else if (changes.milliFinal.newValue == 0) {
						chrome.storage.local.get(["mostRecentRefresh"], function (result) {
							document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:grey; display:inline;">     Portlet refreshing is stopped — last refreshed ' + result.mostRecentRefresh) + '</h4>'
						});
					} else if (changes.milliFinal.newValue > 0) {
						chrome.storage.local.get(["currentIntToPersist", "mostRecentRefresh"], function (result) {
							var choppedInt = (result.currentIntToPersist.substr(26));
							if (choppedInt.length > 3) {
								document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:green; display:inline;">     Portlets are refreshing every ' + choppedInt + ' —  last refreshed ' + result.mostRecentRefresh) + '</h4>'
							} else {
								document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:green; display:inline;">     Portlet refreshing is enabled — last refreshed ' + result.mostRecentRefresh) + '</h4>'
							}
						});
					}
				}
			})
		}
	})
}

//Looks for portlet refresh and maximize icons. If present, clicks them.
function refreshPortlets() {
	if (jQuery(".ns-portlet-icon-refresh").length > 0) {
		jQuery(".ns-portlet-icon-refresh").click();
		if (document.getElementById('ns-dashboard-heading-panel').innerHTML.includes('Home')) {
			chrome.storage.local.get(["printTimeStamp"], function (result) {
				if (result.printTimeStamp == 0) {
					var ahora = new Date()
					chrome.storage.local.set({
						"mostRecentRefresh": "at " + addZeroBefore(ahora.getHours()) + ":" + addZeroBefore(ahora.getMinutes()) + ":" + addZeroBefore(ahora.getSeconds()) + " on " + monthNames[ahora.getMonth()] + " " + ahora.getDate() + ", " + ahora.getFullYear()
					}, function () {});
				} else if (result.printTimeStamp == 1) {
					var ahora = new Date();
					chrome.storage.local.set({
						"mostRecentRefresh": "at " + addZeroBefore(ahora.getHours()) + ":" + addZeroBefore(ahora.getMinutes()) + ":" + addZeroBefore(ahora.getSeconds()) + " on " + monthNames[ahora.getMonth()] + " " + ahora.getDate() + ", " + ahora.getFullYear()
					}, function () {});
					chrome.storage.local.get(["currentIntToPersist", "mostRecentRefresh"], function (result) {
						if (result.currentIntToPersist != null) {
							var choppedInt = (result.currentIntToPersist.substr(26));
							if (choppedInt.length > 3) {
								document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:green; display:inline;">     Portlets are refreshing every ' + choppedInt + ' —  last refreshed ' + result.mostRecentRefresh) + '</h4>'
							} else {
								document.getElementById('ns-dashboard-heading-panel').innerHTML = ('<h1 style="display:inline;">Home</h1><h4 style="color:green; display:inline;">     Portlet refreshing is enabled — last refreshed ' + result.mostRecentRefresh) + '</h4>'
							}
						}
					});
				}
			});
		}
	}
}

//Checks for the value of milliFinal and sets the correct initial state (three possibilities: milliFinal = null, zero, or greater than zero) before setting up a listener that will handle future changes.
function initialize() {
	chrome.storage.local.get(["milliFinal"], function (result) {
		if (result.milliFinal == null) {
			var theInt = setInterval(function () {
				refreshPortlets();
			}, 60000);
			chrome.storage.local.set({
				"milliFinal": 60000
			}, function () {});
			chrome.storage.onChanged.addListener(function (changes, local) {
				if (changes.milliFinal == null) {} else if (changes.milliFinal.newValue == 0) {
					if (theInt != (null || undefined)) {
						clearInterval(theInt);
					}
				} else if (changes.milliFinal.newValue > 0) {
					refreshPortlets();
					if (theInt != (null || undefined)) {
						clearInterval(theInt);
					}
					theInt = setInterval(function () {
						refreshPortlets();
					}, changes.milliFinal.newValue);
				}
			});
			chrome.storage.local.set({
				"currentIntToPersist": 'Running with interval:<br>1 minute'
			}, function () {});
		} else if (result.milliFinal == 0) {
			chrome.storage.onChanged.addListener(function (changes, local) {
				if (changes.milliFinal == null) {} else if (changes.milliFinal.newValue == 0) {
					if (theInt != (null || undefined)) {
						clearInterval(theInt);
					}
				} else if (changes.milliFinal.newValue > 0) {
					refreshPortlets();
					if (theInt != (null || undefined)) {
						clearInterval(theInt);
					}
					theInt = setInterval(function () {
						refreshPortlets();
					}, changes.milliFinal.newValue);
				}
			});
			chrome.storage.local.get(["mostRecentRefresh"], function (result) {
				if (result.mostRecentRefresh == null) {
					refreshPortlets()
				}
			});
		} else if (result.milliFinal > 0) {
			refreshPortlets();
			theInt = setInterval(function () {
				refreshPortlets();
			}, result.milliFinal);
			chrome.storage.onChanged.addListener(function (changes, local) {
				if (changes.milliFinal == null) {} else if (changes.milliFinal.newValue == 0) {
					if (theInt != (null || undefined)) {
						clearInterval(theInt);
					}
				} else if (changes.milliFinal.newValue > 0) {
					refreshPortlets();
					if (theInt != (null || undefined)) {
						clearInterval(theInt)
					}
					theInt = setInterval(function () {
						refreshPortlets();
					}, changes.milliFinal.newValue);
				}
			});
		}
	});
	homepageUpdate();
}

//Calls the penguin function upon window load.
window.onload = penguin();