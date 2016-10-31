# plain text task menu
Plain Text Productivity App for displaying all tasks with due dates in any .taskpaper files in a directory. (Electron)

This menu bar application is written in nodejs and runs in Electron.

It will scan a directoy for any .taskpaper files, then generate 2 files in that directory, task-schedule.md and task-schedule.html

The HTML file will be displayed in the menubar.

Styling is accomplished by putting task-schedule.css in the same directory as you scanned.

to install, clone this repository and `cd` into the new directory.

To start the app, first install electron

`npm install electron -g`

From this directory run it with this command

`electron index.js ~/Dropbox/directory/with/taskpaper/files/`

You can change the options inside index.js 

If you want a way to start it automatically and keep it running you can try [Marathono](http://www.marathono.com/).
