'use strict';

/* -------------------------------------------------------------------
Copyright (c) 2017-2017 Hexaware Technologies
This file is part of the Innovation LAB - Offline Bot.
------------------------------------------------------------------- */

const electron = require('electron');
const Positioner = require('electron-positioner');
var ipcMain = require('electron').ipcMain;
const path = require('path');
const url = require('url');
const fs = require('fs');
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const appTray = electron.Tray
const iconPath = path.join(__dirname, './images/vfs-global.jpg');

let win;
function createWindow() {
  const trayControl = new appTray(iconPath)

  win = new BrowserWindow({
    // width: 400,
    // height: 650,
    width: 1024,
    height: 650,
    frame: false,
    webPreferences: {
      devTools: true,
      detached: true
    },
    title: "VFS Global",
    icon: './vfs-global.jpg'
  })

  var positioner = new Positioner(win);
  positioner.move('bottomRight', 'trayBottomRight');

  win.setMenu(null);
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  //Closing Chat Window
  win.webContents.on('did-finish-load', () => {
    let code = `const remote = require('electron').remote;var btnClose = document.getElementById("btnClose");
    var btnMinimize = document.getElementById("btnMinimize");
    const fs = require('fs');
    fs.writeFileSync('./data.json',"","utf8");
    var handle=setInterval(executeInterval,2000);
    function executeInterval(){
      let dta=fs.readFileSync("./data.json","utf8");
      renderButton();
      if(dta=="SignIn")
      {
      clearInterval(handle);
      $("div.chat-body ul").append('<li class="list-group-item"> <div class="media-left"> <a href="javascript:void(0);" class="avatar-list-img"> <img class="img-responsive" src="avatar/vfslogo.png"> </a> </div><div class="media-body"> <h3 class="list-group-item-heading">VFS Assistant</h3> <span class="list-group-item-text ">Successfully Signed in</span> <p class="mute"><small>sent at 14:25 pm</small></p></div></li>');
      handle=0;
      fs.writeFileSync('./data.json',"","utf8");
      }
    }
    function googleauthlogin(){
      const exec = require('child_process').exec;
      exec('npm run test');
     
    }
    function facebooklogin(){
      const exec = require('child_process').exec;
      exec('npm run dev');
     
    }
    btnClose.addEventListener("click",function(){  var window = remote.getCurrentWindow();
		    if (confirm('Are you sure want to exit')) {
		        window.close();
		    }});
         btnMinimize.addEventListener("click",function(){  var window = remote.getCurrentWindow();
		      window.minimize();
        });`;
    win.webContents.executeJavaScript(code);
  });

  // Open the DevTools.
  win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  });

  trayControl.on('click', function () {
    win.show();
  });
  ipcMain.on('google-data', function (event, store) {
    event.sender.send('asynchronous-reply', store);
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})



