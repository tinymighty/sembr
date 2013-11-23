define(['underscore'], function(_){
	var Pouch = function(docs){

	}
	Pouch.allDbs = function(){ return []; };

	_(Pouch.prototype).extend({

		post: function(doc, options, callback){},
		put: function(doc, options, callback){},
		putAttachment: function(id, rev, doc, type, callback){},
		getAttachment: function(id, callback){},
		removeAttachment: function(id, rev, callback){},
		bulkDocs: function(docs, options, callback){},
		get: function(docid, options, callback){},
		allDocs: function(options, callback){
			if(options.map){

			}
		},
		query: function(fun, options, callback){

		},
		remove: function(doc, options, callback){

		},
		info: function(callback){

		},
		changes: function(options){

		},
		replicate: function(from, to, options, callback){},
		compact: function(options, callback){},
		revsDiff: function(diff, callback){

		}
	});


	return Pouch;
});