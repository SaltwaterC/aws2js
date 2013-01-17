// wrapper for supporting multiple backends for XML and MIME
var fs = require('fs');
var spawn = require('child_process').spawn;

// how many modules to install
var modules = 2;

// setting the depencines vars
var xmlMod = 'libxml-to-js';
if (process.env.npm_config_xml2js === 'true') {
	xmlMod = 'xml2js';
}
if (process.platform == 'win32') {
	xmlMod = 'xml2js';
}

var mimeMod = 'mime-magic';
if (process.env.npm_config_mime === 'true') {
	mimeMod = 'mime';
}


var finish = function () {
	if (modules === 0) {
		console.error('Finished to install the dependencies. XML: %s; MIME: %s.', xmlMod, mimeMod);
		var ws = fs.createWriteStream('config/dependencies.js');
		var depend = "module.exports = {xml: '" + xmlMod + "', mime: '" + mimeMod + "'};";
		ws.write(depend);
		ws.end();
	}
};

var npmInstall = function (module, cb) {
	var npmCli = spawn('/usr/bin/env', ['npm', '--save', 'install', module]);
	
	npmCli.stdout.on('data', function (data) {
		process.stdout.write(data);
	});
	
	npmCli.stderr.on('data', function (data) {
		process.stderr.write(data);
	});
	
	npmCli.on('exit', function (code) {
		if (code === 0) {
			modules--;
			console.error('aws2js installed its dependency: %s', module);
			finish();
		} else {
			console.error('npm failed to install %s', module)
			process.exit(code);
		}
	});
};

// install the dependencies
npmInstall(xmlMod);
npmInstall(mimeMod);
