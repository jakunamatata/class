module.exports = require('classified-magic')(function(prototype) {
	/* Require
	-------------------------------*/
	var argument 	= require('argument');
	var sync 		= require('syncopate');
	
	/* Constants
	-------------------------------*/
	/* Public Properties
	-------------------------------*/
	/* Protected Properties
	-------------------------------*/
	prototype._events = new (require('events').EventEmitter);
	
	/* Private Properties
	-------------------------------*/
	var __states = {};
	
	/* Magic
	-------------------------------*/
	/* Public Methods
	-------------------------------*/
	/**
	 * For Async we lose the protected 
	 * and private access. This grabs it 
	 * before it is removed from the scope
	 *
	 * @param bool
	 * @return object
	 */
	prototype.capture = function(deep) {
		return _copy(this, {}, deep);
	};
	
	/**
     * Force outputs any class property
     *
     * @param mixed
     * @param string|null
     * @return this
     */
	prototype.inspect = function(variable, next) {
		argument.test(2, 'string', 'undef');
		var inspector = require('./inspect').load();
		
		//if variable is true
		if(variable === true) {
			return inspector.next(this, next);
		}
		return this;
	};
	
	/**
     * Returns a state that was previously saved
     *
     * @param *string the state name
     * @return this
     */
	prototype.loadState = function(name) {
		//argument 1 must be a string
		argument.test(1, 'string');
		
		if(typeof __states[name] !== 'undefined') {
			return __states[name];
		}
		
		return this;
	};
	
	/**
     * Loops through returned result sets
     *
     * @param *function
     * @param integer
     * @return this
     */
	prototype.loop = function(callback, i) {
		//argument 1 must be a function
		argument.test(1, 'function');
		
		i = i || 0;
		
		if(callback(this, i) !== false) {
			this.loop(callback, i + 1);
		}
		
		return this;
	}
	
	/**
     * Attaches an instance to be notified
     * when an event has been triggered
     *
     * @param *string
     * @param *function
     * @param bool
     * @return this
     */
	prototype.on = function(event, callback) {
		argument
			//argument 1 must be a string
			.test(1, 'string')
			//argument 2 must be a function
			.test(2, 'function');
		
		this._events.on(event, callback);
		
		return this;
	};
	
	/**
     * Sets instance state for later usage.
     *
     * @param *string the state name
     * @param mixed
     * @return this
     */
	prototype.saveState = function(name, value) {
		//argument 1 must be a string
		argument.test(1, 'string');
		
		if(typeof value === 'undefined') {
			value = this;
		} else if(typeof value === 'function') {
			value = value(this);
		}
		
		__states[name] = value;
		return this;
	};
	
	/**
     * Starts a synchronous thread
     *
     * @param *function
     * @return [Syncopate]
     */
	prototype.sync = function(callback) {
		//argument 1 must be a function
		argument.test(1, 'function');
		
		return sync().scope(this).then(callback);
	};
	
	/**
     * Notify all observers of that a specific
     * event has happened
     *
     * @param *string
	 * @param mixed[,mixed..]
     * @return this
     */
	prototype.trigger = function(event) {
		//argument 1 must be a string
		argument.test(1, 'string');
		
		this._events.emit.apply(this._events, arguments);
		
		return this;
	};
	
	/**
     * Invokes Callback if conditional callback is true
     *
     * @param *mixed
     * @param *function
     * @return this
     */
	prototype.when = function(condition, callback) {
		//argument 2 must be a function
		argument.test(1, 'function');
		
		if((typeof condition === 'function' && condition(this))
		|| typeof condition !== 'function' && condition) {
			callback(this);
		}
		
		return this;
	};
	
	/* Protected Methods
	-------------------------------*/
	/* Private Methods
	-------------------------------*/
	var _copy = function(source, destination, deep) {
		var j, key, keys = Object.keys(source), i = keys.length;
		
		while (i--) {
			key = keys[i];
			destination[key] = source[key];
			
			if(deep
			&& typeof source[key] === 'object'
			&& source[key] !== null
			&& !_isNative(source[key])) {
				destination[key] = _copy(source[key], {}, deep);
			} else if(deep && source[key] instanceof Array) {
				destination[key] = _copy(source[key], [], deep);
			}
		}
		
		return destination;
	};
	
	var _isNative = function(value) {
		//do the easy ones first
		if(value === Date
		|| value === RegExp
		|| value === Math
		|| value === Array
		|| value === Function
		|| value === JSON
		|| value === String
		|| value === Boolean
		|| value === Number
		|| value instanceof Date
		|| value instanceof RegExp
		|| value instanceof Array
		|| value instanceof String
		|| value instanceof Boolean
		|| value instanceof Number) {
			return true;
		}
		
		if((/\{\s*\[native code\]\s*\}/).test('' + value)) {
			return true;
		}
		
		//see: http://davidwalsh.name/detect-native-function
		// Used to resolve the internal `[[Class]]` of values
		var toString = Object.prototype.toString;
		
		// Used to resolve the decompiled source of functions
		var fnToString = Function.prototype.toString;
		
		// Used to detect host constructors (Safari > 4; really typed array specific)
		var reHostCtor = /^\[object .+?Constructor\]$/;
		
		// Compile a regexp using a common native method as a template.
		// We chose `Object#toString` because there's a good chance it is not being mucked with.
		var reNative = RegExp('^' +
		// Coerce `Object#toString` to a string
		String(toString)
			// Escape any special regexp characters
			.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
			// Replace mentions of `toString` with `.*?` to keep the template generic.
			// Replace thing like `for ...` to support environments like Rhino which add extra info
			// such as method arity.
			.replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
		
		var type = typeof value;
		return type === 'function'
			// Use `Function#toString` to bypass the value's own `toString` method
			// and avoid being faked out.
			? reNative.test(fnToString.call(value))
			// Fallback to a host object check because some environments will represent
			// things like typed arrays as DOM methods which may not conform to the
			// normal native pattern.
			: (value && type === 'object' && reHostCtor.test(toString.call(value))) || false;
	};
}).register('eden/class');