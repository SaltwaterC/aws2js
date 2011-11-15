// Inspired by https://gist.github.com/175649
/**
 * Object.watch() - Watches for a property to be assigned a value and runs a function when that occurs.
 * @param prop
 * @param handler
 */
if ( ! Object.prototype.watch) {
	Object.defineProperty(Object.prototype, 'watch', {
		value: function (prop, handler) {
			var val = this[prop];
			var getter = function () {
				return val;
			};
			var setter = function (newVal) {
				var val = handler.call(this, prop, val, newVal);
			};
			if (delete (this[prop])) {
				Object.defineProperty(this, prop, {
					get: getter,
					set: setter,
					configurable: true
				});
			}
		}
	});
}
/**
 * Object.unwatch() - Removes a watchpoint set with the watch method.
 * @param prop
 */
if ( ! Object.prototype.unwatch) {
	Object.defineProperty(Object.prototype, 'unwatch', {
		value: function (prop) {
			var val = this[prop];
			delete (this[prop]);
			this[prop] = val;
		}
	});
}
