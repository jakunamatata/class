var assert 		= require('assert');

var rating = require('../class').extend(function(prototype) {
	prototype.setStars = function(number) {
		this.stars = number;
		return this;
	};
	
	prototype.getStars = function() {
		return this.stars;
	};
}).load();

var User = require('../class').extend(function(prototype) {
	prototype.setName = function(name) {
		this.name = name;
		return this;
	};
	
	prototype.getName = function() {
		return this.name;
	};
});

var user = User.load();

var Member = User.extend({});

var member = Member.load();

var Person = Member.extend({});

var person = Person.load();

describe('Class Test Suite', function() {
	describe('Extending Tests', function() {
		
		it('should report the right stars', function() {
			assert.equal(5, rating.setStars(5).getStars());
		});
		
		it('should save and load states', function() {
			user.setName('Bob').saveState('user');
			
			assert.equal('Bob', rating.setStars(4).loadState('user').getName());
		});
		
		it('should sync methods', function(done) {
			user.sync(function(next) {
				next(1);
			}).sync(function(value, next) {
				this.syncTest = value;
				next();
			}).sync(function(next) {
				assert.equal(1, this.syncTest);
				next();
				done();
			});
		});
		
		it('should sync methods in tree', function(done) {
			user.sync(function(next) {
				next(1);
			}).sync(function(value, next) {
				this.syncTest = value;
				next();
			}).sync(function(next) {
				assert.equal(1, this.syncTest);
				next();
				
				member.sync(function(next) {
					next(1);
				}).sync(function(value, next) {
					this.syncTest = value;
					next();
				}).sync(function(next) {
					assert.equal(1, this.syncTest);
					next();
					person.sync(function(next) {
						next(1);
					}).sync(function(value, next) {
						this.syncTest = value;
						next();
					}).sync(function(next) {
						assert.equal(1, this.syncTest);
						next();
						done();
					});
				});
			});
		});
		
		it('should loop sync methods', function(done) {
			user.sync(function(next) {
				for(var i = 0; i < 5; i++) {
					next.loop(i);
				}
				
				next('yes');
			}).sync(function(i, next) {
				assert.equal('number', typeof i);
				next();
			}).sync(function(string, next) {
				assert.equal('yes', string);
				next();
			}).sync(function(next) {
				for(var i = 5; i < 10; i++) {
					next.loop(i);
				}
				
				next([1,2,3,4]);
			}).sync(function(i, next) {
				assert.equal('number', typeof i);
				next();
			}).sync(function(list, next) {
				assert.equal(true, list instanceof Array);
				done();
				next();
			});
		});
		
		
		
	});
});