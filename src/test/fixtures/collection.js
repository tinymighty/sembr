define(['sembr.collection'], function(Collection){
	return Collection.extend({
		initialize: function(){

			Collection.prototype.initialize.apply(this, arguments);
			
			this.query = {
				map: function(doc){
					emit(doc._id, null);
				},
				keys: [],
				options: {}
			}
			
		}
	});
});