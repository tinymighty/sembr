define(['jasmine'], function(){

	
	beforeEach(function() {
		window.trueWhen = {
			promiseNotPending: function(promise){
				return promise.state()!=='pending';
			}
		};
		this.addMatchers({
			toBePromise: function() {
				return this.actual.done && this.actual.fail;
			},
			toBeRejected: function(){
				this.message = function() {
						return [ "Expected promise to be rejected. It was "+this.actual.state()+"." ];
					};
				return this.actual.state()==='rejected';
			},
			toBeResolved: function(){
					this.message = function() {
						return [ "Expected promise to be resolved. It was "+this.actual.state()+"." ];
					};
				return this.actual.state()==='resolved';
			}
		});

	});
});
