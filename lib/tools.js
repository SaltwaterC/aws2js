/**
 * Simple object merger
 * TODO: remove it by application design refactoring
 * 
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Object}
 */
var merge = function (obj1, obj2) {
	var obj3 = {};
	for (var attrname in obj1) {
		obj3[attrname] = obj1[attrname];
	}
	for (var attrname in obj2) {
		obj3[attrname] = obj2[attrname];
	}
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
	return Math.abs(parseInt(value) | 0);
};
exports.absInt = absInt;

/**
 * Escapes a S3 path
 * 
 * @param {String} path
 * @returns {String}
 */
var escapePath = function (path) {
	console.error('Warning: aws2js/S3 use of .escapePath() is deprecated.  Use JavaScript\'s encodeURI() instead.');
	return encodeURI(path);
};
exports.escapePath = escapePath;

/**
 * Sorts the keys of an object
 * 
 * @param {String} obj
 * @returns {Object}
 */
var sortObject = function (obj) {
	var sorted = {};
	var key, a = [];
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			a.push(key);
		}
	}
	a.sort();
	for (key = 0; key < a.length; key++) {
		sorted[a[key]] = obj[a[key]];
	}
	return sorted;
}
exports.sortObject = sortObject;

/**
 * Checks if an object is empty
 * 
 * @param {Object} obj
 * @returns {Object}
 */
var isEmpty = function (obj) {
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			return false;
		}
    }
    return true;
};
exports.isEmpty = isEmpty;
