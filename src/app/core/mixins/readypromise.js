define(['jquery'], function($){
	
	var ReadyPromise = function(){
		this._deferReady = new $.Deferred();
		this.ready = this._deferReady.promise();
		this.ready
			.fail(function(err){
				//console.error(err);
			})
			.always(function(){
				if(this.triggerMethod){
					this.triggerMethod('ready');
				}else if(this.trigger){
					this.trigger('ready');
				}
			}.bind(this));
	}

	return ReadyPromise;
});