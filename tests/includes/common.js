'use strict';

var util = require('util');
var assert = require('assert');

/**
 * The test teardown method
 * @param {Object} callbacks
 */
exports.teardown = function (callbacks) {
	assert.ok(callbacks instanceof Object);
	process.on('exit', function () {
		var i;
		for (i in callbacks) {
			if (callbacks.hasOwnProperty(i)) {
				assert.strictEqual(callbacks[i], 1);
				util.log(util.format('callback %s executed succesfully', i));
			}
		}
	});
};
