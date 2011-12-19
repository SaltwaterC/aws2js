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
