// wrapper for supporting multiple backends for XML and MIME
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
	
	// install the XML and MIME modules
	npm.commands.install([xmlMod]);
	npm.commands.install([mimeMod]);
});


// remove itself from the local node_modules
process.on('exit', function (code) {
	
	npm.commands.uninstall(['npm']);
});
