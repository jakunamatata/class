module.exports = require('classified-magic')(function(prototype) {
	/* Require
	-------------------------------*/
	var argument = require('argument');
	
	/* Constants
	-------------------------------*/
	/* Public Properties
	-------------------------------*/
	/* Protected Properties
	-------------------------------*/
	prototype._events = new (require('events').EventEmitter);
	
	/* Private Properties
	-------------------------------*/
	prototype.__sequence = {
		stack	: [],
		working	: false,
		args	: [],
		loop	: [] };
	
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
		var j, key, 
			destination	= {},
			keys 		= Object.keys(this), 
			i 			= keys.length;
		
		while (i--) {
			key = keys[i];
			destination[key] = this[key];
			
			if(deep
			&& typeof this[key] === 'object'
			&& this[key] !== null
			&& !_isNative(this[key])) {
				destination[key] = this.capture(this[key], {}, deep);
			} else if(deep && this[key] instanceof Array) {
				destination[key] = this.capture(this[key], [], deep);
			}
		}
		
		return destination;
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
	
	prototype.sync = function(callback, unshift) {
		//argument 1 must be a function
		argument.test(1, 'function');
		
		var sequence = this.__sequence;
		
		
		if(!unshift) {
			sequence.stack.push(callback);
		} else {
			sequence.stack.unshift(callback);
		}
		
		if(!sequence.working) {
			sequence.working = true;
			sequence.scope = this;
			this.__next.apply(sequence, sequence.args);
		}
		
		return this;
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
	prototype.__next = function() {
		var args = Array.prototype.slice.apply(arguments);
		
		//if there is something in the loop
		if(this.loop.length) {
			//save the last called args
			if(!this.last) {
				this.last = args;
			}
			
			var item = this.loop.shift();
			//push in next()
			//this function will recurse call
			//so no need to parse the loop
			item.args.push(arguments.callee.bind(this));
			
			//async call
			process.nextTick(function() {
				//do the callback
				item.callback.apply(this.scope, item.args);
			}.bind(this));
			
			return;
		} 
		
		if(this.last) {
			args = this.last;
			delete this.last;
		}
		
		if(!this.stack.length) {
			this.working 	= false;
			this.args 		= args;
			return;
		}
		
		var callback 	= this.stack.shift(),
			next 		= arguments.callee.bind(this);
		
		next.loop = __loop.bind(this);
		
		args.push(next);
		
		//async call
		process.nextTick(function() {
			//do the callback
			callback.apply(this.scope, args);
		}.bind(this));
	};
	
	var __loop = function() {
		if(!this.stack.length) {
			return;
		}
		
		var item = {args: Array.prototype.slice.apply(arguments) };
		
		//if loop is empty
		if(!this.loop.length) {
			item.callback = this.stack.shift();
		} else {
			item.callback = this.loop[0].callback;
		}
		
		this.loop.push(item);
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