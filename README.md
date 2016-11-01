# Plain Text Task Menu App

This is a Plain Text Productivity App for displaying all tasks (with due dates) in _any_ .taskpaper files under a specified directory. 

![Screenshot](http://media.digitallyhandy.com/Screen%20Shot%202016-10-31%20at%2022.39.45.png)

I manage my list using the SublimeText Plugin [PlainTasks](https://github.com/aziz/PlainTasks)

To quickly add items to my takspaper file from my email client I use [this applescript](https://gist.github.com/sirtimbly/dba52edd29163589a8fef013e9c8588d) triggered with a keyboard shortcut in FastScripts.

This menu bar application is written in node.js and runs in Electron.

## What it Does

It will scan a directoy for any .taskpaper files, then generate 2 files in that directory, `task-schedule.md` and `task-schedule.html`. It will continue to watch the .taskpaper files it finds for any changes and will update those files. Those files are useful for any other ways you want to display the task digest, like showing in "Fluid 2", or maybe you will upload them to a web-server to share and display them on a big screen using one of those custom dashboard apps that can load web data. Let me know if you have an idea for a custom data format by opening an issue.

My main use, and the reason I made this is to display that HTML file in a little menubar drop-down window.

Styling is accomplished by copying `task-schedule.css` into the same directory as you output the html file (which is the same directory that was scanned and is being watched). You can edit this stylesheet to suit your tastes (try the dark theme file). Clicking on the filename link in the task window will open the file in SublimeText. This can be customized in index.js by changing the `_editor` variable.

## Install

To install, clone this repository and `cd` into the new directory.

To start the app, first install electron globally

`npm install electron -g`

Then get the rest of the npm dependencies:

`npm install`

From this directory run the application with this command, 

`electron index.js ~/Dropbox/directory/with/taskpaper/files/`

that first command line argument specifies which directory to scan.

You can change many options inside index.js 

If you want a way to start it automatically and keep it running you can try [Marathono](http://www.marathono.com/).
