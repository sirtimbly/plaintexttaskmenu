#! /usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));

DashingClient = require('dashing-client');

var chaptersWritten = draft.length + finaldraft.length + edited.length;
	dashing = new DashingClient("http://sirtimblydashing.herokuapp.com/", "sirtimblysauthtoken7323");
	dashing.send("welcome", {title: "Book Progress: Tim, Non-fiction", moreinfo: "In " + chaptersWritten + " chapters.", text: "Tim has written " + totalWordCount + " words so far."}, function(err, resp, body) { 
		console.log("sent data to dashboard... " + err + resp + body); 
	});
    // Do callback stuff