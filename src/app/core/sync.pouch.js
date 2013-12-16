/** 
 * SembrModel class
 *
 * Defines a model class which can autoload it's dependencies. 
 **/
define(['underscore', 'jquery', 'backbone'],
function(_, $, Backbone ) {
	var Sync = function(method, model, options){

		var deferred = new $.Deferred();

		if(model._beforeSync){
			model._beforeSync(method, model, options);
		}

		//dispatch to the relevent method (eg. _read)
		Sync._log('Dispatching to method _'+method, method, model, options);

		Sync['_'+method](model, options)
			.done(function(result){
				options = _(options || {}).defaults(Sync.settings);
				if(options.success){
					options.success(result);
				}
				deferred.resolve(model, result);
			})
			.fail(function(error){
				deferred.reject(error);
			})
			.then(function(res){
				if(model._afterSync){
					model._afterSync(method, model, options, res);
				}
			});

		return deferred.promise();
	};

	Sync._queryCount = 0;

	_(Sync).extend({

		settings: {

		},

		_log: function(){
			console.log.apply(console, arguments);
		},


		_create: function(model, options){
			var deferred = new $.Deferred();

			var doc = model.toJSON();
			this.createUpdateDoc(doc)
				.done(function( resp ){
					deferred.resolve( _(resp).pick('id', 'rev') );
				})
				.fail(function( err ){
					deferred.reject(err);
				});

			return deferred.promise();
		},

		_update: function(model, options){
			var deferred = new $.Deferred();

			var doc = model.toJSON();
			this.createUpdateDoc(doc)
				.done(function( resp ){
					deferred.resolve( _(resp).pick('id', 'rev') );
				})
				.fail(function( err ){
					deferred.reject(err);
				});

			return deferred.promise();
		},

		_delete: function(model, options){
			var deferred = new $.Deferred();

			var doc = model.toJSON();
			this.deleteDoc(doc)
				.done(function( resp ){
					deferred.resolve( _(resp).pick('id', 'rev') );
				})
				.fail(function( err ){
					deferred.reject(err);
				});

			return deferred.promise();
		},

		_read: function(model, options){

			var deferred = new $.Deferred(),
					deferred_docs,
					docs_promise,
					modelObj,
					ids = [],
					rel_ids = [],
					relatedIdFields = [],
					relatedQueries = [];

			//grab a reference to the model so we can check if it has any document UID properties which need to be replaced
			
			if(model instanceof Backbone.Collection){
				//a model can be a factory function as well as a Model object
				//console.log('model.model.prototype', model.model.prototype instanceof Backbone.Model);
				modelObj = model.model.prototype && model.model.prototype instanceof Backbone.Model ? model.model.prototype : model.model();
			}else{
				modelObj = model;
			}

			Sync._log(modelObj._type+':modelObj is %o', modelObj);

			//if it's got a model instance grab the relatedDocs property, else
			Sync._log(modelObj._type+':relatedDocs: %o', modelObj.relatedDocs, modelObj);
			if(modelObj.relatedDocs){
				relatedIdFields = _(modelObj.relatedDocs)
					.chain()
					.filter(function(rel){
						return (rel.source==='local' && rel.autoload===true);
					})
					.value();

					relatedQueries = _(modelObj.relatedDocs)
						.chain()
						.filter(function(rel){
							return (rel.source && rel.source==='remote');
						})
						.value();
			}

			Sync._log('Generated relatedIdFields', relatedIdFields);

			//if it has any document UID properties, we'll need to grab the document data to get these ids...
			if(relatedIdFields || model instanceof Backbone.Collection){
				//get all fields with a local uid property

				if(model instanceof Backbone.Collection){
					if(!model.query || !model.query.map || !model.query.options){
						console.log('Model %o has query %o', model, model.query);
						return deferred.reject('Collection query not defined for PouchSync');
					}
					Sync._log('Setting up query %o with options %o for collection %o', model.query, model, model.query.options);
					
					deferred_docs = new $.Deferred();
					docs_promise = deferred_docs.promise();
					
					//query the collection for row ids
					Sync.query( model.query.map, model.query.options )
						.done(function( result ){
							//get the docs with the ids from the view result rows
							ids = _(result.rows).chain().pluck('id').uniq().value();
							Sync._log('Collection query result ids', ids);
							Sync.getDocs( ids )
								.done(function( result ){
									//resolve the docs promise
									deferred_docs.resolve( result );
								})
								.fail(function( err ){
									deferred_docs.reject( err );
								});
						})
						.fail(function( err ){
							deferred_docs.reject( err );
						});

				}else{
					//if the model has an id, grab it's document
					if(model.get('_id')){
						docs_promise = Sync.getDocs([ model.get('_id') ]);
					}else{
						return deferred.reject('model._id is not populated');
					}
				}
			}

			$.when(docs_promise)

			.done(function( docs ){
				//if there are any document ids embedded in the document then add them to the ids array
				if(docs){
					Sync._log('Building relatedIds from docs', docs);
					_(relatedIdFields).each(function(obj){
						_(docs).each(function(doc){
							rel_ids.push(doc[obj.key]);
						});
					});
					//make sure ids are unique and extant (eg. not undefined/null)
					rel_ids = _(rel_ids.sort()).chain().uniq(true).compact().value();
				}

				Sync._log('Added relatedIds', rel_ids);

				//build a list of queries which need to be run and resolved before we proceed
				var deferredQueries = [];
				if(relatedQueries){
					Sync._log('Running relatedQueries', relatedQueries);
					_(relatedQueries).each(function(rel){
						Sync._log('Deferring query', docs, rel);
						var queryOpts = _(rel.query.options).isFunction() ? rel.query.options(docs, model): rel.query.options;
						deferredQueries.push( Sync.query(rel.query.map, queryOpts) );
					});
				}

				Sync._log('Deferred queries', deferredQueries);

				//when all deferred queries are satisfied, parse the results
				$.when.apply($, deferredQueries)
				.done(function(){
					//combine all query results into a single array of ids and add them to the fetch list
					Sync._log('All deferred queries done, returned arguments', arguments);

					var queryIds = _(arguments)
						.chain()	
						.map( function(result){ return _(result.rows).pluck('id'); } )
						.flatten()
						.value();

					rel_ids = _.union(rel_ids, queryIds);

					Sync._log('Initial ids are %o and related ids are %o', ids, rel_ids);

					//ensure duplicate docs are not fetched... this can happen if
					//the model is a tree
					rel_ids = _(rel_ids).difference( ids );
					Sync._log('Removed ids from rel_ids: %o', rel_ids);

					Sync._log('Fetching docs with rel_ids', rel_ids);

						if(relatedIdFields.length || relatedQueries.length){
							Sync.getDocs(rel_ids)
								.done(function(relatedDocs){
									docs = docs.concat(relatedDocs);
									Sync._log('Got relatedDocs', relatedDocs);
									Sync._log('Combined relatedDocs with docs', docs);
									var data = Sync.structureDocs(docs, model, modelObj);
									//if we're dealing with a Model sync, return an object not an array
									if( data.length === 1 && !(model instanceof Backbone.Collection) ){
										data = data[0];
									}
									deferred.resolve( data );
								})
								//if getDocs fails, pass on the error
								.fail(function(err){
									deferred.reject(err);
								});
						}else{
							if( docs.length === 1 && !(model instanceof Backbone.Collection) ){
								docs = docs[0];
							}
							deferred.resolve(docs);
						}
					})
					//if one of the deferredQueries fails, pass on the error
					.fail(function(err){
						deferred.reject(err);
					});
				})

			//if docs_promise is rejected, reject the whole damn thing yo
			.fail(function(error){
				deferred.reject(error);
			});
 
			return deferred.promise();
		},

		//wrap promises around PouchDB
		query: function(map, options){
			Sync._log('Query#'+(++Sync._queryCount)+': querying view %o with options %o', map, options);
			var deferred = new $.Deferred();
			this.db.query(map, options, function(err, result){
				Sync._log('Query#'+Sync._queryCount+': returned result %o', result);
				if(err){
					return deferred.reject(err);
				}
				return deferred.resolve(result);
			});
			return deferred.promise();
		},

		getDocs: function(ids, options){
			var deferred = new $.Deferred();
			options = _({include_docs:true, keys:ids}).extend(options);
			Sync._log('getDocs: Getting docs with options %o', options);
			this.db.allDocs(options, function(err, result){
				Sync._log('getDocs: pouch.allDocs() callback with arguments %o', arguments);
				if(err){
					deferred.reject(err);
					return;
				}
				var docs = _(result.rows)
					.chain()
					.pluck('doc')
					.filter(function(doc){
						return (doc!==undefined);
					})
					.value();
				Sync._log('getDocs: Resolving with docs %o', docs);
				deferred.resolve( docs );
			});
			return deferred.promise();
		},

		createUpdateDoc: function(doc){
			var deferred = new $.Deferred();
			function cb(err, resp){
				if(err)
						deferred.reject(err);
					deferred.resolve(resp);
			}
			if(doc._id){
				this.db.put(doc, cb);
			}else{
				this.db.post(doc, cb);
			}
			return deferred.promise();
		},

		deleteDoc: function(doc){
			var deferred = new $.Deferred();
			this.db.remove(doc, function cb(err, resp){
				if(err)
						deferred.reject(err);
					deferred.resolve(resp);
			});
			return deferred.promise();
		},

		structureDocs: function(docs, model, modelObj){
			if(!modelObj._type){
				throw new Error('No _type exists on modelObj prototype %o', modelObj, model);
				//return docs;
			}
			Sync._log('structing docs', docs, model, modelObj);
			//pull out the top-level documents; ie. the data used for the model or models in this collection
			var primary = _(docs).filter(function(doc){
				return doc._type === modelObj._type;
			});
			//loop through the primary documents
			_(primary).each(function(p){

				//assign all child documents specified in the relatedDocIds property
				if(modelObj.relatedDocs){

					_(modelObj.relatedDocs).each(function(rel){
						if(!rel.key){
							console.error('No key set for relation', rel);
							return;
						}
						var target = rel.target ? rel.target : rel.key;
						if((rel.source===undefined || rel.source==='local') && rel.key){
							//if the relatedDocIds property is an array of ids, assign an array of docs
							if(_(p[rel.key]).isArray()){
								p[target] =  _(docs).filter(function(doc){
									return doc._id===p[rel.key];
								});
							//assume a string value and thus just grab the first item of the result array
							}else{
								p[target] = _(docs).where({'_id':p[rel.key]}).shift();
							}
						}

						if(rel.source==='remote' && rel.key){
							p[target] = _(docs).filter(function(doc){
								return doc[rel.key]===p._id;
							});
						}

					});
				}

			});
			Sync._log('structureDocs: returning docs', primary);
			return primary;
		}

	});

	return Sync;

});