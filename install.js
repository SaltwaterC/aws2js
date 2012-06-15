// wrapper for supporting multiple backends for XML and MIME
var fs = require('fs');
var npm = require('npm');


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


// install the dependencies
npm.load({}, function (err) {
	if (err) {
		console.error(err);
		console.error(err.stack);
		process.exit(1);
	}
	
	var finished = {
		xml: false,
		mime: false
	}
	
	// cleanup the installation and write the dependency bits
	var cleanup = function () {
		if (finished.xml && finished.mime) {
			console.log('Removing the bootstrapped npm.');
			npm.commands.uninstall(['npm']);
			console.log('Finished to install the dependencies. XML: %s; MIME: %s.', xmlMod, mimeMod);
			var ws = fs.createWriteStream('lib/dependencies.js');
			var depend = "module.exports = {xml: '" + xmlMod + "', mime: '" + mimeMod + "'};";
			ws.write(depend);
			ws.end();
		}
	};
	
	// install the XML and MIME modules
	npm.commands.install([xmlMod], function (err, data) {
		finished.xml = true;
		cleanup();
	});
	
	npm.commands.install([mimeMod], function (err, data) {
		finished.mime = true;
		cleanup();
	});
});
