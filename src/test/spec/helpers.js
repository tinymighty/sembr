define(['jasmine'], function(){
	beforeEach(function() {
	  this.addMatchers({
	    toBePromise: function() {
	      return this.actual.done && this.actual.fail;
	    }
	  });
	});
});
