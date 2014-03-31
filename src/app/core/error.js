define([], function(s){
	"use strict";
	var error = function(msg){
		return new Error(msg);
	}
	Error = function(msg){
		this.message = msg;
	}
	Error.prototype.toString = function(){
		return this.message;
	}

	return error;
});