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

describe('Class Test Suite', function() {
	describe('Extending Tests', function() {
		
		it('should report the right stars', function() {
			assert.equal(5, rating.setStars(5).getStars());
		});
		
		it('should save and load states', function() {
			user.setName('Bob').saveState('user');
			
			assert.equal('Bob', rating.setStars(4).loadState('user').getName());
		});
	});
});