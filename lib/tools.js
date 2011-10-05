/**
 * Simple object merger
 *
 * @param obj1
 * @param obj2
 * @returns obj3
 */
var merge = function(obj1, obj2) {
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
 * @returns value
 */
var absInt = function(value) {
	return Math.abs(parseInt(value) | 0);
};
exports.absInt = absInt;
/**
 * Escapes a HTTP path
 * @param path
 */
var escapePath = function (path) {
	path = escape(path);
	return path.replace(/\*/g, '%2A').replace(/\+/g, '%2B');
};
exports.escapePath = escapePath;
