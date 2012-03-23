/**
 * Simple object merger
 * @param obj1
 * @param obj2
 * @return obj3
 */
var merge = function (obj1, obj2) {
	var obj3 = {};

	for(attrname in obj1) {
		obj3[attrname] = obj1[attrname];
	}

	for(attrname in obj2) {
		obj3[attrname] = obj2[attrname];
	}

	return obj3;
};
exports.merge = merge;
/**
 * Returns the absolute integer value of the input. Avoids the NaN crap.
 * @param value
 * @return value
 */
var absInt = function (value) {
	return Math.abs(parseInt(value) | 0);
};
exports.absInt = absInt;
/**
 * Escapes a S3 path
 * @param path
 */
var escapePath = function (path) {
	console.error('Warning: aws2js/S3 use of .escapePath() is deprecated.  Use JavaScript\'s encodeURI() instead.');
	return encodeURI(path);
};
exports.escapePath = escapePath;
/**
 * Sorts the keys of an object
 * @param obj
 * @return Object
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
 * @param obj
 * @return Object
 */
var isEmpty = function (obj) {
	for(var prop in obj) {
		if(obj.hasOwnProperty(prop)) {
			return false;
		}
    }
    return true;
};
exports.isEmpty = isEmpty;
