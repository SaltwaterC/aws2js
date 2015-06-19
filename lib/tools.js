'use strict';
/*jslint todo: true*/

/* core module */
var util = require('util');

/* 3rd party module */
var lodash = require('lodash');

/**
 * Simple object merger
 * TODO: remove it by refactoring the client
 * 
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Object}
 */
var merge = function (obj1, obj2) {
	var obj3 = {};
	lodash.merge(obj3, obj1, obj2);
	return obj3;
};
exports.merge = merge;

/**
 * Returns the absolute integer value of the input. Avoids the NaN crap.
 * 
 * @param value
 * @returns {Number}
 */
var absInt = function (value) {
	/*jslint bitwise:true*/
	var sureInt = parseInt(value, 10) | 0;
	/*jslint bitwise:false*/
	return Math.abs(sureInt);
};
exports.absInt = absInt;

/**
 * Sorts the keys of an object
 * 
 * @param {String} obj
 * @returns {Object}
 */
var sortObject = function (obj) {
	var key, sorted = {}, a = [];
	
	a = Object.keys(obj).sort();
	
	for (key = 0; key < a.length; key++) {
		sorted[a[key]] = obj[a[key]];
	}
	
	return sorted;
};
exports.sortObject = sortObject;

/**
 * [DEPRECATED] Escapes a S3 path
 * 
 * @param {String} path
 * @returns {String}
 */
var escapePath = function (path) {
	console.error('Warning: aws2js/S3 use of .escapePath() is deprecated.  Use JavaScript\'s encodeURI() instead.');
	return encodeURI(path);
};
exports.escapePath = escapePath;

var debug = function (message) {
	if (process.env.NODE_ENV === 'development') {
		util.debug('aws2js - ' + message);
	}
};
exports.debug = debug;
