#! /usr/bin/env node
/// <reference path="typings/node/node.d.ts"/>


var fs = require('fs');
var walk    = require('walk');
var yaml	= require('js-yaml');
var _		= require('lodash');
var moment 	= require('moment');
var metaContent = require('./lib/content');
//var DashingClient = require('dashing-client');
var marked = require('marked');

var exec = require('child_process').exec;

var _editor = 'subl ';
var _htmlLocation = "task-schedule.html";


var menubar = require('menubar')

var mb = menubar({width: 550, icon: "IconTemplate.png"});

mb.on('ready', function ready () {
  if (program.verbose > 0) console.log('app is ready');
  // your app code here
  
})

mb.on('after-show', function(){
	if (program.verbose > 0) console.log("loading: "+_target+_htmlLocation);
	mb.window.loadURL("file://"+_target+_htmlLocation);
    mb.window.webContents.executeJavaScript("document.getElementsByName('body').insertAdjacentElement('beforeend', '<a href=\"#quit\" class=\"btn\">Quit</a>');");
	mb.window.webContents.on('will-navigate', function(event, url) {
        if (url === "#quit") {
            mb.app.quit();
        }
		if (program.verbose > 0) console.log("window loading new page " + url);
		if (url !== "file://"+_target+_htmlLocation) {
			event.preventDefault();
			if (url.substr(0,7) === "file://") {
				url = url.substr(7);
			}
			if (program.verbose > 0) console.log("trying to exec " + _editor + url);
			exec(_editor + url);
		}
		
	});
});

var _files   = [];
var _manifest = [];
var _tasks = [];
var _target	= '/Users/tbendt/Dropbox/_Tim/Projects/';

var _htmlFooter = '</body></html>';
var _bToken = '**';
var _iToken = '__';
var _fileSpan = '<sup><sub>';
var _fileSpanEnd = '</sub></sup>';
var _taskListFileName = 'task-schedule.md';
var _taskListHtmlFileName = 'task-schedule.html';
var _taskListCSSFileName = 'task-schedule.css';
var _activeIcon = false;

var _htmlHeader = '<html><head><link rel="stylesheet" href="'+ _taskListCSSFileName +'"></head><body>';

//var argv = require('minimist')(process.argv.slice(2));
var program = require('commander');
var watchers = [];



function increaseVerbosity(v, total) {
  return total + 1;
}
function collect(val, memo) {
  memo.push(val);
  return memo;
}

program
  .version('0.1.2')
  .usage('[options] <directory ...>')
  .option('-e, --ext [extensions]', 'An arrray of file extensions', collect)
  .option('-s, --statuses', 'give me the status list on stdout')
  .option('-v, --verbose', 'A value that can be increased', increaseVerbosity, 0)
  .parse(process.argv);


if (program.args.length === 1) {
	_target = program.args[0];
	readTargetDir(_target);
} else {
	console.log("ERROR: give me the directory you want to look in.")
};

function readTargetDir(target) {
	var _files = []
	if (program.verbose > 0) console.log('target:' + target);
    var count = 0
	// Walker options
	var walker  = walk.walk(target, { followLinks: false, filters: ["node_modules", ".git"] });
	walker.on('file', function(root, stat, next) {  
	    if (!stat.isDirectory()) {
			if (program.verbose > 0) process.stdout.write("Scanned " + count + " files...\r");
	    	var extension = stat.name.split('.')[1];
	    	program.ext = program.ext || ['taskpaper'];
            var archiveRE = /archive/;
	    	for (var i = program.ext.length - 1; i >= 0; i--) {
	    		if (extension === program.ext[i] && archiveRE.exec(stat.name) == null){
		    		// Add this file to the list of files
					var filePath = root + "/" + stat.name
					if (program.verbose > 0) console.log("found: " + filePath);
			    	_files.push(root + "/" + stat.name);
                    if (!watchers[filePath]) {
                        watchers.push(filePath);
					    fs.watchFile(filePath, regenerateFromGlobalManifest);
                    }
                    
			    }
			}
			count++;
	    };
	    next();
	});

	walker.on('end', function() {
		_manifest = getFileManifest(_files);
		writeTaskFiles(generateMarkdownFromTasks(getAllTasksInFiles(_manifest)));
		
		 if (program.verbose > 0) console.log("generated task files");
		
	});
}

function getFileManifest(files) {
	var manifest = [];
	for (var i = files.length - 1; i >= 0; i--) {
		
		var file = files[i];
		var pathparts = file.split('/');
		//read meta
		var contents = fs.readFileSync(file, 'utf8');
		var lines = contents.split('\n');
		var frontMatter = metaContent.getFrontMatter(lines);
		//var newContent = lines.join('\n');
		//read text
		manifest.push({
			fullPath: file,
			filename: pathparts[pathparts.length - 1],
			yaml: frontMatter.trim(),
			//wordCount: wc(newContent.trim()),
			meta: frontMatter ? yaml.load(frontMatter) : {},
			contents: contents
		});
	};
	return manifest;
}

function regenerateFromGlobalManifest() {
    readTargetDir(_target);
    _manifest = getFileManifest(_files);
	writeTaskFiles(generateMarkdownFromTasks(getAllTasksInFiles(_manifest)));
}

function getAllTasksInFiles(manifest) {
    _activeIcon = false;
	var taskList = [];
	for (var i = manifest.length - 1; i >= 0; i--) {
		taskList = taskList.concat(
			parseTasksFromFileContents(manifest[i].contents, manifest[i].filename, manifest[i].fullPath)
		);
	}
	return  _.sortBy(taskList, 'dateTime');
}

function parseTasksFromFileContents(fileText, fileName, filePath) {
		var taskList = [];
		var parseRE = /(?:^\s*-\s*)(.*)(@due\(([0-9-]*)\)\s[@\w-()]*)/gm; 
		var match = null;
		
		while (match = parseRE.exec(fileText)) {
			var taskItem = {
				fullText: match[0],
				taskName: match[1],
				dueTag: match[2],
				dateTime: match[3]
			};
			
			//var tomorrow = moment().add(24, 'hours');
			if (moment(taskItem.dateTime).isBefore(moment())) {
				taskItem.isPastDue = true;
			}
			if (moment(taskItem.dateTime).isSame(moment(), 'day')) {
				taskItem.isDueNow = true;
                
			}
			var parseDone = /@done/;
			if (taskItem.isComplete === true || parseDone.exec(taskItem.fullText)) {
				taskItem.isComplete = true;
			}
            taskItem.fileName = fileName;
            taskItem.fullPath = filePath;
			taskList.push(taskItem);
			
		}
	
	return taskList;
}

function writeTaskFiles(markdownText) {
	//var buffer = generateMarkdown(taskList);
    
	fs.writeFileSync(_target+_taskListFileName, markdownText);
	
	var html = _htmlHeader
	html += marked(markdownText);
	html +=_htmlFooter;
	fs.writeFileSync(_target+_taskListHtmlFileName, html);
    
    if (_activeIcon) {
        mb.tray.setImage("IconTemplateActive.png");
    } else {
        mb.tray.setImage("IconTemplate.png");
    }
    
}

function generateMarkdownFromTasks(taskList) {
	var headers = ["Due Date", "Task", "File"];
	var buffer = '';
	var divider = '';
	//var buffer = "---\ntitle: 'Task Schedule'\ndate: '" + getDate() + "'\n---\n\n";
	for (var i = 0; i < headers.length; i++) {
		buffer += "|" + headers[i] + "\t";
        divider += "|---\t";
	};
	buffer += "\n" + divider;
	
	_.forEach(taskList, function(item){
		var isB = '';
		if (item.isComplete && item.isPastDue) {
			return; //don't write this old complete task
		}
		if (item.isDueNow) {
			isB = _iToken;
            _activeIcon = true;
		} 
		if (item.isPastDue) {
			isB = _bToken;
            _activeIcon = true;
		}
		
		buffer+="\n|"+isB+item.dateTime+isB+"\t|"+item.taskName.trim()+"\t|" + "["+item.fileName+"](file://"+ item.fullPath +")";
		
	});
	
	return buffer;
}


function wc(body){

	//var lines = (body.match(/\n/g) || '').length;
	var words = (body.split(/\s+/) || ' ').length - 1;
	//var chars = body.length;
	body = '';
	return words;
}

function getDate() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}
