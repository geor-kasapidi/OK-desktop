let ipcRenderer = require('electron').ipcRenderer

process.once('loaded', function() {
	global.setBadgeValue = function(s) {
		ipcRenderer.send('badge', s)
	}
})
