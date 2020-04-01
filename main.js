const electron = require('electron');
const fs = require('fs');
const {app, BrowserWindow, ipcMain, dialog, Menu} = electron;

let win;
let filePath = undefined;

const options = {
    title: 'Salvar el documento de texto',
    defaultPath: app.getPath('documents') + '/filename.txt',
}

app.on('ready', () => {
    win = new BrowserWindow({        
        webPreferences: {
            nodeIntegration: true,
        }
    })
    win.loadFile('index.html');
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
})

ipcMain.on('save', (event, text) => {
//Salvar el texto en un archivo
    if(filePath === undefined){
        dialog.showSaveDialog(win, options)
            .then((res) => {
                filePath = res.filePath;

                if(res.canceled === false){
                    
                    save_file(text);

                } else {

                    console.log(res);
                    filePath = undefined;

                }

            }).catch((err) => {console.log(err)});

    }else{

        save_file(text);

    }
})

function save_file(data){
    fs.writeFile(filePath, data, (err) => {
        if(err){ 
            throw err;
        }else {
            console.log('Archivo salvado con éxito');
            win.webContents.send('saved', 'success')
        }
    })
}

const menuTemplate =  [
    ...(process.platform == 'darwin'? [{ //operador ternario
        label: app.getName(),
        submenu: [
            {role: 'about'}
        ]
    }] : []), 
    {
        label: 'File',
        submenu: [
            {
                label: 'Save',
                accelerator: "CmdOrCtrl+k",
                click(){ 
                    win.webContents.send('save-clicked')
                }
            },

            {
                label: 'Save As',
                accelerator: "CmdOrCtrl+Shift+k",
                click(){ 
                    filePath = undefined,
                    win.webContents.send('save-as-clicked')
                }
            }
        ]
    },
    {role: 'editMenu'},
    {role: 'viewMenu'}
]