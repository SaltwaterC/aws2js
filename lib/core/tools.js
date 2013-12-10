'use strict';

/* core module */
var util = require('util');

/**
 * Returns the absolute integer value of the input. Avoids the NaN crap
 *
 * @param value The input value
 * @returns {Number} The parsed intger value or 0
 */
exports.absInt = function(value) {
	/*jslint bitwise:true*/
	var sureInt = parseInt(value, 10) | 0;
	/*jslint bitwise:false*/
	return Math.abs(sureInt);
};

/**
 * Sorts the keys of an object
 *
 * @param {Object} obj The input object
 * @returns {Object} The input object with sorted keys
 */
exports.sortObject = function(obj) {
	var key, sorted = {}, a = [];

	a = Object.keys(obj).sort();

	for (key = 0; key < a.length; key++) {
		sorted[a[key]] = obj[a[key]];
	}

	return sorted;
};

/**
 * Logs debug message to STDERR when the NODE_ENV equals development
 *
 * @param {String} message The debug message
 */
exports.debug = function(message) {
	if (process.env.NODE_ENV === 'development') {
		util.debug('aws2js - ' + message);
	}
};

exports.padInt = function(val, width) {
	val = String(val);
	var arr = [];
	arr.length = width - val.length + 1;
	return val.length >= width ? val : arr.join('0') + val;
};
