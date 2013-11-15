/** 
 * SembrModel class
 *
 * Defines a model class which can autoload it's dependencies. 
 **/
define(["underscore", 'jquery', "backbone", 'pouchdb'],
function(_, $, Backbone, Pouch ) {
  var Sync = function(method, model, options){
    if(model instanceof Backbone.Model){

    }
    if(!model.query){
         console.warn('No query function defined for model: %o', model)
      }
      var deferred = new $.Deferred();

      if(model._beforeSync){
        model._beforeSync(method, model, options);
      }

      //dispatch to the relevent method (eg. _read)
      console.log('Dispatching to method _'+method, method, model, options);

      Sync['_'+method](deferred, model, options)
      .done(function(result){
        deferred.resolve(result);
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
  }

  Sync._queryCount = 0;

  _(Sync).extend({

    _log: function(){
      console.log.apply(console, arguments);
    },

    _read: function(deferred, model, options){

      var docs_promise = [],
          ids = [],
          rel_ids = [],
          relatedIdFields = [],
          relatedQueries = [];

      //grab a reference to the model so we can check if it has any document UID properties which need to be replaced
      var modelObj = model instanceof Backbone.Collection ? model.model.prototype : model;
      //if it's got a model instance grab the relatedDocs property, else
      console.log('relatedDocs: %o', modelObj.relatedDocs);
      if(modelObj.relatedDocs){
        relatedIdFields = _(modelObj.relatedDocs)
          .chain()
          .filter(function(rel){
            return (rel.source===undefined || rel.source==='local');
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
            deferred.reject('Collection query not defined for PouchSync');
            return deferred.promise();
          }
          Sync._log('Setting up query %o with options %o for collection %o', model.query, model, model.query.options);
          //set up a deferred object
          deferred_docs = new $.Deferred();
          //make the docs variable a promise so we can resolve after we've queried for ids and looked them up
          docs_promise = deferred_docs.promise(); 

          //query the collection for row ids
          Sync.query( model.query.map, model.query.options )
            .done(function( result ){
              //get the docs with the ids from the view result rows
              ids = _(result.rows).chain().pluck('id').uniq().value();
              console.log('Collection query result ids', ids);
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
            deferred.reject('model._id is not populated');
          }
        }
      }

  		$.when( docs_promise ).done(function( docs ){
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
            console.log('Deferring query', docs, rel);
    				var queryOpts = _(rel.query.options).isFunction() ? rel.query.options(docs, model): rel.query.options;
	    			deferredQueries.push( Sync.query(rel.query.map, queryOpts) );
	    		});
    		}

    		console.log('Deferred queries', deferredQueries);

  			//when all deferred queries are satisfied, parse the results
  			$.when.apply($, deferredQueries)
  			.done(function(){
  				//combine all query results into a single array of ids and add them to the fetch list
  				console.log('All deferred queries done, returned arguments', arguments);

  				var queryIds = _(arguments)
    				.chain()
    				.map( function(result){ return _(result.rows).pluck('id') } )
    				.flatten()
    				.value();

	  			rel_ids = _.union(rel_ids, queryIds);

          console.log('Initial ids are %o and related ids are %o', ids, rel_ids);

          //ensure duplicate docs are not fetched... this can happen if
          //the model is a tree
          rel_ids = _(rel_ids).difference( ids );
          console.log('Removed ids from rel_ids: %o', rel_ids);

  			 	console.log('Fetching docs with rel_ids', rel_ids);

  				Sync.getDocs(rel_ids)
	  				.done(function(relatedDocs){
              docs = docs.concat(relatedDocs);
              Sync._log('Got relatedDocs', relatedDocs);
              var data = Sync.structureDocs(docs, model, modelObj);
	  					//attempt to parse the docs using a parse method, if defined on the model
		  				data = (model.parse) ? model.parse(data) : data;
              //if it's a collection, reset all models, otherwise set new data to the model
		  				model instanceof Backbone.Collection ? model.reset(data) : model.set(data.pop());
		  				//pass the result along with the resolution for convenience
		  				deferred.resolve( model );
	  				})
	  				.fail(function(err){
	  					deferred.reject(err);
	  				});

  			})
  			.fail(function(error){
  				deferred.reject(error);
  			});


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
    	})
    	return deferred.promise();
    },

    getDocs: function(ids, options){
    	var deferred = new $.Deferred();
    	options = _({include_docs:true, keys:ids}).extend(options);
      Sync._log('getDocs: Getting docs with options %o', options);
    	this.db.allDocs(options, function(err, result){
        Sync._log('getDocs: Docs request returned with result %o', result);
    		if(err){
    			return deferred.reject(err);
    		}
        var docs = _(result.rows)
          .chain()
          .pluck('doc')
          .filter(function(doc){
            return !(doc===undefined);
          })
          .value();
        Sync._log('getDocs: Resolving with docs %o', docs);
    		return deferred.resolve( docs );
    	});
    	return deferred.promise();
    },

    structureDocs: function(docs, model, modelObj){
      if(!modelObj.docType){
        console.error('No docType exists on modelObj prototype %o', modelObj);
        return docs;
      }
      //pull out the top-level documents; ie. the data used for the model or models in this collection
      var primary = _(docs).filter(function(doc){
        return doc.type === modelObj.docType;
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