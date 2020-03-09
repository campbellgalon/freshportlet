//Listening for changes in the Chrome-locally-stored milliseconds refresh interval. Prints changes to the extension console so they are available in case troubleshooting is needed.
chrome.storage.onChanged.addListener(function (changes, local) {
	if (changes.milliFinal == null) {} else {
		if (changes.milliFinal.newValue == 0) {
			console.log("Refreshing stopped.");
		} else {
			console.log("Refresh interval changed to " + changes.milliFinal.newValue + " milliseconds.");
		}
	}
});

//Getting print refresh checkbox state
chrome.storage.local.get(["printTimeStamp"], function (result) {
	if (result.printTimeStamp == null) {
		chrome.storage.local.set({
			"printTimeStamp": 1
		}, function () {});
		document.getElementById('printtimestamp').checked = true;
	} else if (result.printTimeStamp == 1) {
		document.getElementById('printtimestamp').checked = true;
	} else if (result.printTimeStamp == 0) {
		document.getElementById('printtimestamp').checked = false;
	}
})


//Setting listener for print refresh status feature
document.addEventListener('DOMContentLoaded', function () {
	var checkbox = document.getElementById("printtimestamp");
	checkbox.addEventListener('change', function () {
		if (checkbox.checked == true) {
			chrome.storage.local.set({
				"printTimeStamp": 1
			}, function () {});
		} else {
			chrome.storage.local.set({
				"printTimeStamp": 0
			}, function () {});
		}
	})
})

//Checking for previously set intervals. If they exist, they are applied into the visible input fields and to the backend. If not, or if they are malformed, all fields will be set to default.
function grabPersisted() {
	var prefix = "Running with interval:<br>"
	chrome.storage.local.get(["secondsToPersist"], function (result) {
		if ((result.secondsToPersist != null) && (isNaN(result.secondsToPersist) == false)) {
			document.getElementById("userInputSeconds").value = result.secondsToPersist
		} else {
			document.getElementById("userInputSeconds").value = 0;
			chrome.storage.local.set({
				"secondsToPersist": 0
			}, function () {});
		};
	});
	chrome.storage.local.get(["minutesToPersist"], function (result) {
		if ((result.minutesToPersist != null) && (isNaN(result.minutesToPersist) == false)) {
			document.getElementById("userInputMinutes").value = result.minutesToPersist
		} else {
			document.getElementById("userInputMinutes").value = 1;
			chrome.storage.local.set({
				"minutesToPersist": 1
			}, function () {});
		};
	});
	chrome.storage.local.get(["hoursToPersist"], function (result) {
		if ((result.hoursToPersist != null) && (isNaN(result.hoursToPersist) == false)) {
			document.getElementById("userInputHours").value = result.hoursToPersist
		} else {
			document.getElementById("userInputHours").value = 0;
			chrome.storage.local.set({
				"hoursToPersist": 0
			}, function () {});
		};
	});
	chrome.storage.local.get(["currentIntToPersist"], function (result) {
		if (result.currentIntToPersist == ("Refreshing<br>Stopped")) {
			document.getElementById("currentint").innerHTML = "Refreshing<br>Stopped";
			document.getElementById("currentint").style = "color:red;";
		} else if (result.currentIntToPersist != null) {
			document.getElementById("currentint").innerHTML = result.currentIntToPersist;
			document.getElementById("currentint").style = "color:green;"
		} else {
			document.getElementById("currentint").innerHTML = prefix + "1 minute";
			document.getElementById("currentint").style = "color:green;"
		};
	});
	chrome.storage.local.get(["milliFinal"], function (result) {
		if (result.milliFinal == null) {
			chrome.storage.local.set({
				"milliFinal": 60000
			}, function () {
				chrome.storage.local.get(["milliFinal"], function (result) {})
			});
		}
	});
}

//Calling the grabPersisted function automatically.
window.onLoad = grabPersisted();

//Preventing right-clicking in the extension body.
window.onload = function () {
	document.addEventListener("contextmenu", function (e) {
		e.preventDefault();
	}, false);
}

//The main function which is triggered by the submit button.
function mainRefreshFunction() {
	var prefix = "Running with interval:<br>"
	if ((isNaN(document.getElementById("userInputSeconds").value) != false) || (document.getElementById("userInputSeconds").value < 0)) {
		var newSeconds = 0;
		var secerrtrack = 1;
		var minutesFromSeconds = 0;
		document.getElementById("userInputSeconds").value = 0;
	} else {
		if (Math.round(document.getElementById("userInputSeconds").value) >= 60) {
			var minutesFromSeconds = ((Math.round(document.getElementById("userInputSeconds").value)) - (Math.round(document.getElementById("userInputSeconds").value) % 60)) / 60;
			var newSeconds = Math.round(document.getElementById("userInputSeconds").value) % 60;
		} else {
			var minutesFromSeconds = 0;
			var newSeconds = Math.round(document.getElementById("userInputSeconds").value);
		}
		var secerrtrack = 0;
		document.getElementById("userInputSeconds").value = newSeconds;
	}
	if ((isNaN(document.getElementById("userInputMinutes").value) != false) || (document.getElementById("userInputMinutes").value < 0)) {
		var minerrtrack = 1;
		var newMinutes = 0 + minutesFromSeconds;
		var hoursFromMinutes = 0;
		document.getElementById("userInputMinutes").value = 0 + minutesFromSeconds;
	} else {
		if ((Math.round(document.getElementById("userInputMinutes").value) + minutesFromSeconds) >= 60) {
			var hoursFromMinutes = ((Math.round(document.getElementById("userInputMinutes").value) + minutesFromSeconds) - ((Math.round(document.getElementById("userInputMinutes").value) + minutesFromSeconds) % 60)) / 60;
			var newMinutes = (Math.round(document.getElementById("userInputMinutes").value) + minutesFromSeconds) % 60
		} else {
			var hoursFromMinutes = 0;
			var newMinutes = Math.round(document.getElementById("userInputMinutes").value) + minutesFromSeconds;
		}
		var minerrtrack = 0;
		document.getElementById("userInputMinutes").value = newMinutes;
	}
	if ((isNaN(document.getElementById("userInputHours").value) != false) || (document.getElementById("userInputHours").value < 0)) {
		var hrerrtrack = 1;
		var newHours = 0 + hoursFromMinutes;
		document.getElementById("userInputHours").value = 0 + hoursFromMinutes;
	} else {
		var newHours = Math.round(document.getElementById("userInputHours").value) + hoursFromMinutes;
		document.getElementById("userInputHours").value = Math.round(document.getElementById("userInputHours").value);
		var hrerrtrack = 0;
	}
	document.getElementById("userInputHours").value = newHours;
	var milli = ((newHours * 3600000) + (newMinutes * 60000) + (newSeconds * 1000));
	if (hrerrtrack || minerrtrack || secerrtrack !== 0) {
		document.getElementById("errors").innerHTML = "Please only enter positive integers.";
		setTimeout(function () {
			document.getElementById("errors").innerHTML = "";
		}, 8000);
	} else {
		document.getElementById("errors").innerHTML = ""
	}
	if (milli < 60000 && milli > 0) {
		document.getElementById("currentint").innerHTML = prefix + "1 minute";
		document.getElementById("currentint").style = "color:green;";
		document.getElementById("userInputHours").value = 0;
		document.getElementById("userInputMinutes").value = 1;
		document.getElementById("userInputSeconds").value = 0;
		newSeconds = 0;
		newMinutes = 1;
		newHours = 0;
		document.getElementById("durationprobs").innerHTML = "The minimum interval is 1 minute.";
		setTimeout(function () {
			document.getElementById("durationprobs").innerHTML = "";
		}, 8000);
		var durationHadProblem = 1;
	} else if (milli > 86400000) {
		document.getElementById("currentint").innerHTML = prefix + "24 hours";
		document.getElementById("currentint").style = "color:green;";
		document.getElementById("userInputHours").value = 24;
		document.getElementById("userInputMinutes").value = 0;
		document.getElementById("userInputSeconds").value = 0;
		newSeconds = 0;
		newMinutes = 0;
		newHours = 24;
		document.getElementById("durationprobs").innerHTML = "The maximum interval is 24 hours.";
		setTimeout(function () {
			document.getElementById("durationprobs").innerHTML = "";
		}, 8000);
		var durationHadProblem = 1;
	} else {
		var durationHadProblem = 0;
	}
	/*

	Tracking of which fields are being used, to produce an elegant and grammatically correct statement of the current interval.

	LEGEND:
	state		fields being used

	1			all of the fields are zero
	2			only hours
	3			only minutes
	4			only seconds
	5			hours and minutes
	6			hours and seconds
	7			minutes and seconds
	8			none of the fields are zero

	*/
	if (durationHadProblem == 0) {
		document.getElementById("durationprobs").innerHTML = "";
		if (newHours == 0 && newMinutes == 0 && newSeconds == 0) {
			var activeState = 1
		} else if (newHours !== 0 && newMinutes == 0 && newSeconds == 0) {
			var activeState = 2
		} else if (newHours == 0 && newMinutes !== 0 && newSeconds == 0) {
			var activeState = 3
		} else if (newHours == 0 && newMinutes == 0 && newSeconds !== 0) {
			var activeState = 4
		} else if (newHours !== 0 && newMinutes !== 0 && newSeconds == 0) {
			var activeState = 5
		} else if (newHours !== 0 && newMinutes == 0 && newSeconds !== 0) {
			var activeState = 6
		} else if (newHours == 0 && newMinutes !== 0 && newSeconds !== 0) {
			var activeState = 7
		} else if (newHours !== 0 && newMinutes !== 0 && newSeconds !== 0) {
			var activeState = 8
		}
		if (newHours == 1) {
			var singleHours = 1
		} else {
			var singleHours = 0
		}
		if (newMinutes == 1) {
			var singleMinutes = 1
		} else {
			var singleMinutes = 0
		}
		if (newSeconds == 1) {
			var singleSeconds = 1
		} else {
			var singleSeconds = 0
		}
		if (activeState == 1) {
			document.getElementById("currentint").innerHTML = "Refreshing<br>Stopped";
			document.getElementById("currentint").style = "color:red;";
		} else if (activeState == 2) {
			if (singleHours == 0) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hours";
				document.getElementById("currentint").style = "color:green;";
			} else {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hour";
				document.getElementById("currentint").style = "color:green;";
			}
		} else if (activeState == 3) {
			if (singleMinutes == 0) {
				document.getElementById("currentint").innerHTML = prefix + newMinutes + " minutes";
				document.getElementById("currentint").style = "color:green;";
			} else {
				document.getElementById("currentint").innerHTML = prefix + newMinutes + " minute";
				document.getElementById("currentint").style = "color:green;";
			}
		} else if (activeState == 4) {
			if (singleSeconds == 0) {
				document.getElementById("currentint").innerHTML = prefix + newSeconds + " seconds";
				document.getElementById("currentint").style = "color:green;";
			} else {
				document.getElementById("currentint").innerHTML = prefix + newSeconds + " second";
				document.getElementById("currentint").style = "color:green;";
			}
		} else if (activeState == 5) {
			if (singleHours == 0 && singleMinutes == 0) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hours and " + newMinutes + " minutes";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleHours == 1 && singleMinutes == 0) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hour and " + newMinutes + " minutes";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleHours == 0 && singleMinutes == 1) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hours and " + newMinutes + " minute";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleHours == 1 && singleMinutes == 1) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hour and " + newMinutes + " minute";
				document.getElementById("currentint").style = "color:green;";
			}
		} else if (activeState == 6) {
			if (singleHours == 0 && singleSeconds == 0) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hours and " + newSeconds + " seconds";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleHours == 1 && singleSeconds == 0) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hour and " + newSeconds + " seconds";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleHours == 0 && singleSeconds == 1) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hours and " + newSeconds + " second";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleHours == 1 && singleSeconds == 1) {
				document.getElementById("currentint").innerHTML = prefix + newHours + " hour and " + newSeconds + " second";
				document.getElementById("currentint").style = "color:green;";
			}
		} else if (activeState == 7) {
			if (singleMinutes == 0 && singleSeconds == 0) {
				document.getElementById("currentint").innerHTML = prefix + newMinutes + " minutes and " + newSeconds + " seconds";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleMinutes == 1 && singleSeconds == 0) {
				document.getElementById("currentint").innerHTML = prefix + newMinutes + " minute and " + newSeconds + " seconds";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleMinutes == 0 && singleSeconds == 1) {
				document.getElementById("currentint").innerHTML = prefix + newMinutes + " minutes and " + newSeconds + " second";
				document.getElementById("currentint").style = "color:green;";
			} else if (singleMinutes == 1 && singleSeconds == 1) {
				document.getElementById("currentint").innerHTML = prefix + newMinutes + " minute and " + newSeconds + " second";
				document.getElementById("currentint").style = "color:green;";
			}
		} else if (activeState == 8) {
			if (singleHours == 0) {
				if (singleMinutes == 0) {
					if (singleSeconds == 0) {
						document.getElementById("currentint").innerHTML = prefix + newHours + " hours, " + newMinutes + " minutes and " + newSeconds + " seconds";
						document.getElementById("currentint").style = "color:green;";
					} else {
						document.getElementById("currentint").innerHTML = prefix + newHours + " hours, " + newMinutes + " minutes and " + newSeconds + " second";
						document.getElementById("currentint").style = "color:green;";
					}
				} else {
					if (singleSeconds == 0) {
						document.getElementById("currentint").innerHTML = prefix + newHours + " hours, " + newMinutes + " minute and " + newSeconds + " seconds";
						document.getElementById("currentint").style = "color:green;";
					} else {
						document.getElementById("currentint").innerHTML = prefix + newHours + " hours, " + newMinutes + " minute and " + newSeconds + " second";
						document.getElementById("currentint").style = "color:green;";
					}
				}
			} else {
				if (singleMinutes == 0) {
					if (singleSeconds == 0) {
						document.getElementById("currentint").innerHTML = prefix + newHours + " hour, " + newMinutes + " minutes and " + newSeconds + " seconds";
						document.getElementById("currentint").style = "color:green;";
					} else {
						document.getElementById("currentint").innerHTML = prefix + newHours + " hour, " + newMinutes + " minutes and " + newSeconds + " second";
						document.getElementById("currentint").style = "color:green;";
					}
				} else {
					if (singleSeconds == 0) {
						document.getElementById("currentint").innerHTML = prefix + newHours + " hour, " + newMinutes + " minute and " + newSeconds + " seconds";
						document.getElementById("currentint").style = "color:green;";
					} else {
						document.getElementById("currentint").innerHTML = prefix + newHours + " hour, " + newMinutes + " minute and " + newSeconds + " second";
						document.getElementById("currentint").style = "color:green;";
					}
				}
			}
		}
	}


	//Sets backend variables and persistent stored values, to be called upon in the future by grabPersisted()
	if (milli > 86400000) { //greater than one day
		var milliFinal = 86400000; //set to one day
	} else if (milli < 60000 && milli > 0) { //less than 60 seconds but greater than zero
		var milliFinal = 60000; //set to 60 seconds
	} else {
		var milliFinal = milli;
	}
	chrome.storage.local.set({
		"secondsToPersist": newSeconds
	}, function () {});
	chrome.storage.local.set({
		"minutesToPersist": newMinutes
	}, function () {});
	chrome.storage.local.set({
		"hoursToPersist": newHours
	}, function () {});
	chrome.storage.local.set({
		"currentIntToPersist": document.getElementById("currentint").innerHTML
	}, function () {});
	chrome.storage.local.set({
		"milliFinal": milliFinal
	}, function () {});
}

//Listens for keystrokes in the input boxes, checks if they are numbers. If not, the keystroke is disallowed.
document.addEventListener('DOMContentLoaded', function () {
	var userInputSeconds = document.getElementById("userInputSeconds");
	var userInputMinutes = document.getElementById("userInputMinutes");
	var userInputHours = document.getElementById("userInputHours");
	userInputSeconds.addEventListener("keypress", function (evt) {
		var keyCode = (evt.which) ? evt.which : evt.keyCode;
		if (keyCode > 31 && (keyCode < 48 || keyCode > 57)) {
			event.preventDefault();
		}
	});
	userInputMinutes.addEventListener("keypress", function (evt) {
		var keyCode = (evt.which) ? evt.which : evt.keyCode;
		if (keyCode > 31 && (keyCode < 48 || keyCode > 57)) {
			event.preventDefault();
		}
	});
	userInputHours.addEventListener("keypress", function (evt) {
		var keyCode = (evt.which) ? evt.which : evt.keyCode;
		if (keyCode > 31 && (keyCode < 48 || keyCode > 57)) {
			event.preventDefault();
		}
	});
});

//When start button is clicked, checks if all input fields are 0; if so, returns error
document.addEventListener('DOMContentLoaded', function () {
	var okbutton = document.getElementById("okbutton");
	okbutton.addEventListener("click", function () {
		if (document.getElementById("userInputHours").value == 0 && document.getElementById("userInputMinutes").value == 0 && document.getElementById("userInputSeconds").value == 0) {
			document.getElementById("errors").innerHTML = "The interval is empty or zero. Please input your desired refresh interval and click Start again.";
			setTimeout(function () {
				document.getElementById("errors").innerHTML = "";
			}, 8000);
			setTimeout(function () {
				document.getElementById("errors").innerHTML = "";
			}, 8000);
			document.getElementById("durationprobs").innerHTML = "";
		} else {
			document.getElementById("errors").innerHTML = "";
			mainRefreshFunction();
		}
	})
})

//When stop button is clicked, stops refreshing portlets.
document.addEventListener('DOMContentLoaded', function () {
	var deactivate = document.getElementById("deactivate");
	deactivate.addEventListener("click", function () {
		document.getElementById("currentint").innerHTML = "Refreshing<br>Stopped";
		document.getElementById("currentint").style = "color:red;"
		document.getElementById("errors").innerHTML = "";
		document.getElementById("durationprobs").innerHTML = "";
		chrome.storage.local.set({
			"currentIntToPersist": "Refreshing<br>Stopped"
		}, function () {});
		chrome.storage.local.set({
			"milliFinal": 0
		}, function () {});
	});
});

//When feedback link is clicked, starts listening for new tabs opening and grabs their chrome tabId, then opens a new inactive tab at index position 0 with mailto link, waits 500ms for the email client to open and then closes the tab
document.addEventListener('DOMContentLoaded', function () {
	var links = document.getElementsByTagName("a");
	for (var i = 0; i < links.length; i++) {
		(function () {
			var ln = links[i];
			var location = ln.href;
			ln.onclick = function () {
				chrome.tabs.onCreated.addListener(function (tab) {
					window.mailTabIdToKill = tab.id
				});
				chrome.tabs.create({
					index: 0,
					active: false,
					url: location
				});
				setTimeout(function () {
					chrome.tabs.remove(tabId = window.mailTabIdToKill);
				}, 500);
			};;
		})();
	}
});