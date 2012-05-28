// wrapper for supporting multiple backends for XML and MIME
var fs = require('fs');
var spawn = require('child_process').spawn;


// a small npm helper


var npmInstall = function (pack, cb) {
	var npm = spawn('/usr/bin/env', ['npm', 'install', pack]);
	
	npm.stdout.on('data', function (data) {
		process.stdout.write(data);
	});
	
	npm.stderr.on('data', function (data) {
		process.stderr.write(data);
	});
	
	npm.on('exit', function (code) {
		cb(code);
	});
};


// setting the depencines vars


var xml2js = false;
if (process.env.npm_config_xml2js === 'true') {
	xml2js = true;
}
if (process.platform == 'win32') {
	xml2js = true;
}

var mime = false;
if (process.env.npm_config_mime === 'true') {
	mime = true;
}


// install the dependencies


var xmlMod = 'libxml-to-js';
if (xml2js) {
	xmlMod = 'xml2js';
}
console.log('Installing: %s.', xmlMod);
npmInstall(xmlMod, function (code) {
	if (code === 0) {
		var mimeMod = 'mime-magic';
		if (mime) {
			mimeMod = 'mime';
		}
		console.log('Installing: %s.', mimeMod);
		npmInstall(mimeMod, function (code) {
			if (code === 0) {
				console.log('Finished to install the dependencies. XML: %s; MIME: %s.', xmlMod, mimeMod);
				var ws = fs.createWriteStream('lib/dependencies.js');
				var depend = "module.exports = {xml: '" + xmlMod + "', mime: '" + mimeMod + "'};";
				ws.write(depend);
				ws.end();
			} else {
				console.error('ERROR: Failed to install %s.', mimeMod);
			}
		});
	} else {
		console.error('ERROR: Failed to install %s.', xmlMod);
	}
});
