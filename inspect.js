module.exports = require('./class').extend(function(prototype) {
	/* Require
	-------------------------------*/
	var argument = require('argument');
	
	/* Constants
	-------------------------------*/
	/* Public Properties
	-------------------------------*/
	/* Protected Properties
	-------------------------------*/
	prototype._name = null;
	prototype._scope = null;
	
	/* Private Properties
	-------------------------------*/
	/* Magic
	-------------------------------*/
	prototype.___get = function(key) {
		var self = this.capture();
		return function() {
			if(this._scope === null) {
				return;
			}
			
			var args = Array.prototype.slice.apply(arguments);
			var results = self._getResults(key, args);
			
			//set temp variables
			var name = this.name;
			var scope = this.scope;
			
			//reset globals
			this.name = null;
			this.scope = null;
			
			//if there's a property name
			if(name) {
				//output that
				this.output(scope[name]);
				//and return the results
				return results;
			}
	
			//at this point we should output the results
			this.output(results);
	
			//and return the results
			return results;
		}.bind(this);
	};
	
	/* Public Methods
	-------------------------------*/
	/**
     * Hijacks the class and reports the results of the next
     * method call
     *
     * @param *object
     * @param string
     * @return this
     */
    prototype.next = function(scope, name) {
        argument
			//argument 1 must be an object
            .test(1, 'object') 
			//argument 2 must be a string or null
            .test(2, 'string', 'null', 'undef');
		
		name = name || null;
		
        this.scope = scope;
        this.name = name;

        return this;
    };

    /**
     * Outputs anything
     *
     * @param *mixed any data
     * @return this
     */
    prototype.output = function(variable) {
        if(variable === true) {
            variable = '*TRUE*';
        } else if(variable === false) {
            variable = '*FALSE*';
        } else if(variable === null) {
            variable = '*null*';
        }
		
        console.log(JSON.parse(JSON.stringify(variable)));
        return this;
    }
	
	/* Protected Methods
	-------------------------------*/
	/**
     * Virtually calls the scope's method considering routes
     *
     * @param *string
     * @param *array
     * @return mixed
     */
    prototype._getResults = function(name, args) {
		return this.scope[name].apply(this.scope, args);
    }
	
	/* Private Methods
	-------------------------------*/
}).register('eden/inspect');