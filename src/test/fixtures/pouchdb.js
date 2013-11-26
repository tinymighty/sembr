define(['underscore'], function(_){
	var Pouch = function(docs){
		this.docs = docs;
		this._docs = _(docs);
	}
	Pouch.allDbs = function(){ return []; };

	_(Pouch.prototype).extend({

		post: function(doc, options, callback){},
		put: function(doc, options, callback){},
		putAttachment: function(id, rev, doc, type, callback){},
		getAttachment: function(id, callback){},
		removeAttachment: function(id, rev, callback){},
		bulkDocs: function(docs, options, callback){},
		get: function(docid, options, callback){
			var result = this._docs.where({'_id':docid});
			if(!result)
				return callback('No matching doc id found in PouchDB fixure');
			callback(undefined, result);
		},
		allDocs: function(options, callback){
			var result = {
				total_rows: this.docs.length, 
				rows:this._docs.map(function(doc){
					return {doc:doc, id: doc._id, key:doc._id, value:{rev:doc._rev}}
				})
			}
			callback(undefined, result);
		},
		query: function(fun, options, callback){
			var wrappedFun = _(fun).
			var result = this._docs.map()
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