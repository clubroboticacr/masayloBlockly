var {electron, ipcMain, app, BrowserWindow, globalShortcut, dialog} = require('electron')
var { autoUpdater } = require("electron-updater")
var path = require('path')
var mainWindow, termWindow, factoryWindow, promptWindow, promptOptions, promptAnswer, htmlWindow, gamesWindow
autoUpdater.autoDownload = false
autoUpdater.logger = null
function createWindow() {
	mainWindow = new BrowserWindow({ width: 1000, height: 625, icon: './www/media/icon.png', frame: false, movable: true,        webPreferences: {
		nodeIntegration: true
	}})
	if (process.platform == 'win32' && process.argv.length >= 2) {
		console.log(path.join(__dirname, './www/index.html'));
		var file = process.argv[1]
		if (file.endsWith(".bloc")||file.endsWith(".ino")||file.endsWith(".py")) {
			mainWindow.loadURL(path.join(__dirname, './www/index.html?url='+file))
		}
        if (file.endsWith(".www")||file.endsWith(".html")) {
			mainWindow.loadURL(path.join(__dirname, './www/ffau.html?url='+file))
		}
		console.log('cargando...');
		mainWindow.loadURL(path.join(__dirname, './www/index.html'))

	} else {
		console.log('no es windows?')
		mainWindow.loadURL(path.join(__dirname, './www/index.html'))
	}
	mainWindow.setMenu(null)
	mainWindow.on('closed', function () {
		mainWindow = null
	})
}
function createTerm() {
	termWindow = new BrowserWindow({ webPreferences: {
		nodeIntegration: true
	  },width: 640, height: 560, 'parent': mainWindow, resizable: false, movable: true, frame: false, modal: true}) 
	termWindow.loadURL(path.join(__dirname, "./www/term.html"))
	termWindow.setMenu(null)
	termWindow.on('closed', function () { 
		termWindow = null 
	})
}
function createRepl() {
	termWindow = new BrowserWindow({ webPreferences: {
		nodeIntegration: true
	  },width: 640, height: 515, 'parent': mainWindow, resizable: false, movable: true, frame: false, modal: true}) 
	termWindow.loadURL(path.join(__dirname, "./www/repl.html"))
	termWindow.setMenu(null)
	termWindow.on('closed', function () { 
		termWindow = null 
	})
}
function createfactory() {
	factoryWindow = new BrowserWindow({webPreferences: {
		nodeIntegration: true
	  },width: 1000, height: 625, 'parent': mainWindow, resizable: true, movable: true, frame: false})
	factoryWindow.loadURL(path.join(__dirname, "./www/factory.html"))
	factoryWindow.setMenu(null)
	factoryWindow.on('closed', function () { 
		factoryWindow = null 
	})
}
function createHTML() {
	htmlWindow = new BrowserWindow({webPreferences: {
		nodeIntegration: true
	  },width: 1000, height: 625, resizable: true, movable: true, frame: false})
	htmlWindow.loadURL(path.join(__dirname, "./www/ffau.html"))
	htmlWindow.setMenu(null)
	htmlWindow.on('closed', function () { 
		htmlWindow = null 
	})
}
function createGames() {
	gamesWindow = new BrowserWindow({webPreferences: {
		nodeIntegration: true
	  },width: 1000, height: 625, icon: './www/media/gamepad.png', resizable: true, movable: true})
	gamesWindow.loadURL(path.join(__dirname, "./www/games/index.html"))
	gamesWindow.on('closed', function () { 
		gamesWindow = null 
	})
}
function promptModal(options, callback) {
	promptOptions = options
	promptWindow = new BrowserWindow({webPreferences: {
		nodeIntegration: true
	  },width:360, height: 135, 'parent': mainWindow, resizable: false, movable: true, frame: false, modal: true})
	promptWindow.loadURL(path.join(__dirname, "./www/modalVar.html"))
	promptWindow.on('closed', function () { 
		promptWindow = null 
		callback(promptAnswer)
	})
}
function open_console(mainWindow = BrowserWindow.getFocusedWindow()) {
	if (mainWindow) mainWindow.webContents.toggleDevTools()
}
function refresh(mainWindow = BrowserWindow.getFocusedWindow()) {
	mainWindow.webContents.reloadIgnoringCache()
}
app.on('ready',  function() {
	console.log('creating window');
	createWindow()
	globalShortcut.register('F8', open_console)
	globalShortcut.register('F5', refresh)
})
app.on('activate', function() {
	if (mainWindow === null) createWindow()
})
app.on('window-all-closed', function() {
	globalShortcut.unregisterAll()
	if (mainWindow) {
		mainWindow.webContents.executeJavaScript('localStorage.setItem("loadOnceBlocks", "")')
		mainWindow.webContents.executeJavaScript('localStorage.setItem("pwd", "")')
	}
	if (htmlWindow) htmlWindow.webContents.executeJavaScript('localStorage.setItem("pwd", "")')
	if (process.platform !== 'darwin') app.quit()
})
ipcMain.on("version", function() {
	autoUpdater.checkForUpdates()  
})
ipcMain.on("prompt", function() {
	createTerm()  
})
ipcMain.on("repl", function() {
	createRepl()  
})
ipcMain.on("factory", function() {
	createfactory()       
})
ipcMain.on("html", function() {
	createHTML()       
})
ipcMain.on("games", function() {
	createGames()       
})
ipcMain.on("appendBlock", function(event, data1, data2, data3) {
    mainWindow.webContents.send('BlockAppended', data1, data2, data3)
})
ipcMain.on("reload", function(event) {
	mainWindow.loadURL(path.join(__dirname, './www/index.html'))
})
ipcMain.on("openDialog", function(event, data) {
    event.returnValue = JSON.stringify(promptOptions, null, '')
})
ipcMain.on("closeDialog", function(event, data) {
	promptAnswer = data
})
ipcMain.on("modalVar", function(event, arg) {
	promptModal(
		{"label": arg, "value": "", "ok": "OK"}, 
	    function(data) {
	       event.returnValue = data
        }
	)       
})
ipcMain.on('save-bin', function(event) {
	dialog.showSaveDialog(mainWindow,{
		title: 'Exporter les binaires',
		defaultPath: 'Programme.hex',
		filters: [{ name: 'Binaires', extensions: ['hex']}]
	},
	function(filename){
		event.sender.send('saved-bin', filename)
	})
})

ipcMain.on('save-png-html', function(event) {
	dialog.showSaveDialog(htmlWindow,{
		title: 'Enregistrer au format .PNG',
		defaultPath: 'Capture',
		filters: [{ name: 'Images', extensions: ['png'] }]
	},
	function(filename){
		event.sender.send('saved-png-html', filename)
	})
})


ipcMain.on('save-py', function(event) {
	dialog.showSaveDialog(mainWindow,{
		title: 'Enregistrer au format .PY',
		defaultPath: 'Programme',
		filters: [{ name: 'Python', extensions: ['py'] }]
	},
	function(filename){
		event.sender.send('saved-py', filename)
	})
})
ipcMain.on('save-bloc', function(event) {
	dialog.showSaveDialog(mainWindow,{
		title: 'Guardar en formato .BLOC',
		defaultPath: 'Programa',
		filters: [{ name: 'Blocklino', extensions: ['bloc'] }]
	}).then((result)=>{
		
	event.sender.send('saved-bloc',result.filePath)
})
})
ipcMain.on('save-png-factory', function(event) {
	dialog.showSaveDialog(factoryWindow,{
		title: 'Guardar imagen en formato .PNG',
		defaultPath: 'Imagen',
		filters: [{ name: 'Images', extensions: ['png'] }]
	},
	function(filename){
		event.sender.send('saved-png-factory', filename)
	})
})
ipcMain.on('save-ino', function(event) {
	dialog.showSaveDialog(mainWindow,{
		title: 'Guardar en formato .INO',
		defaultPath: 'Programa',
		filters: [{ name: 'Arduino', extensions: ['ino'] }]
	}
	).then((result)=>{
		event.sender.send('saved-ino',result.filePath)
	})
})
ipcMain.on('save-png', function(event) {
	dialog.showSaveDialog(mainWindow,{
		title: 'Guardar en formato .PNG',
		defaultPath: 'Imagen',
		filters: [{ name: 'Images', extensions: ['png'] }]
	}).then((result)=>{
		event.sender.send('saved-png',result.filePath)
	})
})
ipcMain.on('save-html', function(event) {
	dialog.showSaveDialog(htmlWindow,{
		title: 'Enregistrer au format .html',
		defaultPath: 'pageWeb.html',
		filters: [{ name: 'Web', extensions: ['html'] }]
	},
	function(filename){
		event.sender.send('saved-html', filename)
	})
})
ipcMain.on('save-www', function(event) {
	dialog.showSaveDialog(htmlWindow,{
		title: 'Enregistrer au format .www',
		defaultPath: 'pageWeb.www',
		filters: [{ name: 'Blockly-Web', extensions: ['www'] }]
	},
	function(filename){
		event.sender.send('saved-www', filename)
	})
})
ipcMain.on('save-bf', function(event) {
	dialog.showSaveDialog(factoryWindow,{
		title: 'Enregistrer au format .bf',
		defaultPath: 'Bloc.bf',
		filters: [{ name: 'Blockly-Factory', extensions: ['bf'] }]
	},
	function(filename){
		event.sender.send('saved-bf', filename)
	})
})
ipcMain.on('save-csv', function(event) {
	
dialog.showSaveDialog(mainWindow,{
		title: 'Exportar datos en formato CSV',
		defaultPath: 'Programa',
		filters: [{ name: 'donnees', extensions: ['csv'] }]
	}).then((result)=>{
		event.sender.send('saved-csv', result.filePath);

	})
})
ipcMain.on('addMedias', function(event) {
	dialog.showOpenDialog(htmlWindow,{
		title: 'Ajouter des médias (images, sons ou vidéos)',
		buttonLabel: "Ajouter",
		filters: [{ name: 'Médias', extensions: ['bmp', 'jpg', 'png', 'gif', 'mp3', 'mp4']}],
		properties: ['openFile','multiSelections']
	},
	function(filename){
		event.sender.send('addedMedias', filename)
	})
})
ipcMain.on('addImg', function(event) {
	dialog.showOpenDialog(factoryWindow,{
		title: 'Ajouter des images',
		buttonLabel: "Ajouter",
		filters: [{ name: 'Images', extensions: ['bmp', 'jpg', 'png', 'gif']}],
		properties: ['openFile','multiSelections']
	},
	function(filename){
		event.sender.send('added-img', filename)
	})
})
ipcMain.on('openBF', function(event) {
	dialog.showOpenDialog(factoryWindow,{
		title: 'Ouvrir',
		filters: [{ name: 'Blockly-Factory', extensions: ['bf'] }]
	},
	function(filename){
		event.sender.send('openedBF', filename)
	})
})
autoUpdater.on('error', function(error) {
	dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})
autoUpdater.on('update-available', function() {
	dialog.showMessageBox(mainWindow,{
		type: 'none',
		title: 'Mise à jour',
		message: "Une nouvelle version est disponible, voulez-vous la télécharger et l'installer maintenant ?",
		buttons: ['oui', 'non'],
		cancelId: 1,
		noLink: true
	},
	function(buttonIndex)  {
		if (buttonIndex === 0) {
			autoUpdater.downloadUpdate()
		}
		else {
			return
		}
	})
})
autoUpdater.on('update-not-available', function() {
	dialog.showMessageBox(mainWindow,{
		title: 'Mise à jour',
		message: 'Votre version est à jour.'
	})
})
autoUpdater.on('update-downloaded', function() {
	dialog.showMessageBox(mainWindow,{
		title: 'Mise à jour',
		message: "Téléchargement terminé, l'application va s'installer puis redémarrer..."
	}, function() {
		setImmediate(function(){
			autoUpdater.quitAndInstall()
		})
	})
})
module.exports.open_console = open_console
module.exports.refresh = refresh