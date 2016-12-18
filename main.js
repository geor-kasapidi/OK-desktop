const electron = require('electron')
const app = electron.app
const session = electron.session

electron.ipcMain.on('badge', (e, s) => {
	app.dock.setBadge(s)
})

const BrowserWindow = electron.BrowserWindow

const url = require('url')
const path = require('path')
const fs = require('fs');

function createMenu() {
	var template = [{
		label: "App",
		submenu: [
			{ label: "Quit", accelerator: "Command+Q", click: function() { app.exit(0); }}
		]}, {
		label: "Edit",
		submenu: [
			{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
			{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
			{ type: "separator" },
			{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
			{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
			{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
			{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
		]}
	];

	electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(template));
}

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			nodeIntegration: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	mainWindow.on('close', function (e) {
		e.preventDefault()
	})

	mainWindow.webContents.on('new-window', function(e, url) {
		e.preventDefault()
		electron.shell.openExternal(url)
	})

	mainWindow.webContents.on('did-finish-load', function() {
		mainWindow.webContents.insertCSS(fs.readFileSync(path.join(__dirname, 'inject.css'), 'utf8'))
		mainWindow.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname, 'inject.js'), 'utf8'))
	})

	mainWindow.loadURL(url.format({
		pathname: 'ok.ru',
		protocol: 'https:',
		slashes: true
	}))
}

app.on('ready', function() {
	createWindow()
	createMenu()

	electron.session.defaultSession.webRequest.onBeforeSendHeaders({}, (r, f) => {
		f({
			cancel: r.resourceType == 'image' && (r.url.includes('r.mradx.net') || r.url.includes('rs.mail.ru'))
		})
	})
})

app.on('will-quit', function () {
	mainWindow = null
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
})
