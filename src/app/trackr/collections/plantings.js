define(["jquery", "backbone", "underscore", "sembr.collection", "../models/planting.js", 'pouchdb'],
  function($, Backbone, _, Collection, Planting, PouchDB) {
    var Collection = Collection.extend({
		  model: Planting,

		  /*
			So what's different about the way we might want to fetch data for a collection?

			We might want to specify fetching by a different view or key... eg

			Fetch all Plantings in Place X
			Fetch all Plantings since XXXX-XX-XX
			Fetch all Plantings of Plant X in Place X (with many subplaces!)
			
			Fetch all Plantings LIMITED from 0 to 1000 ("paginated")


			new Plantings().fetchWhere({place_id: X})
			new Plantings({place_id:X, since:XXXX-XX-XX});
			new Plantings({plant: Y, place_id:X});
		  */

	    initialize: function(options){
	    	//if a place_id is passed in options, only fetch rows which match that place_id
	    	this.options = {};

	    	if(options && options.where){
	    		this.query.map = this.views.fetch_where.map;
	    		this.query.keys = this.views.fetch_where.keys;
	    		this.options = options;
	    	}

	    },

	    fetch: function(options){
	    	console.log('Fetching with options %o', options)

	    	var where = {};
	    	if(this.options.where){
	    		where = this.options.where;
	    	}
	    	if(options && options.where){
	    		where = _(where).defaults(options.where);
	    	}
	    	if( where ){
	    		console.log('Dispatching to fetchWhere with where options %o', where);
	    		return this.fetchWhere( where );
	    	}else{
	    		console.log('Dispatching to prototype.fetch with options %o', options);
	    		return Backbone.Collection.prototype.fetch.apply(this, arguments);
	    	}
	    },



	    /* Parse the resulting docs into the correct heirarchy */
	    /*parse: function(docs){
	    	//separate planting documents
	    	var plantings = _(docs).filter(function(doc){
	    		return doc.type === 'planting';
	    	});
	    	//iterate through the plantings and put documents where there were uids
	    	_(plantings).each(function(p){

	    	});

	    }*/

	    query: {
	    	map: undefined,
	    	options: undefined,
	    	keys: undefined
	    },

	    views: {
	    	fetch_where: {
	    		map: function(doc){
	    			if(doc.type==='planting'){
	    				//emit multiple rows to allow for null values in fields
	    				emit([doc.user, doc.place_id, doc.plant_id, doc.date_created, doc.date_modified], null);
	    				emit([doc.user, doc.place_id, null, doc.date_created, doc.date_modified], null);
	    				emit([doc.user, null, null, doc.date_created, doc.date_modified], null);
	    				emit([null, null, null, doc.date_created, doc.date_modified], null);
	    			}
	    		},
  	    	keys: ['user', 'place_id', 'plant_id', 'date_created', 'date_modified']
  	    }
	    },

	    /*sync: function(method, model, options){
	    	var deferred = new $.Deferred();
	    	if(this.options){
	    		if(this.options.place_id){
	       		//then only fetch docs for those which match
	       		var opts = {
	       			include_docs: true,
	       			startkey:[Sembr.user.get('_id'), this.options.place_id],
	       			endkey:[Sembr.user.get('_id'), this.options.place_id]
	       		};
	       		Sembr.db.query(this.pouch_views.by_place, opts, function(err, resp){
	       			if(err){
	       				console.error(err)
	       			}
	       			//response 
	       			console.log('RESPONSE FROM CUSTOM SYNC METHOD!!!!!');
	       			console.log(resp)
	       		});
	    		}
	    	}
	    	return deferred.promise();
	    },*/

	    /*where: function(){
	    	if(this.is_complete){

	    	}else{

	    	}
	    },*/

	    /**
	     * Fetch nested models referenced by ID
	     * This method is called by the PouchDB adapter to augment the JSON data
	     * returned for this collection with any related data
	     * It's main purpose is to load full JSON models for 
	     */
	    parsePouchResult: function(jsonModels, db, deferred){

	    	//var opts = options = _({parse:true, fetchRelated: true}).extend(options);

	      /*var actions_map = function(doc) {
        	if(doc.type==="action" && doc.subject_type==="planting"){
          	emit([doc.user, doc._id]);
        	}
        };
	    	db.query({map: plantings_map}, {include_docs:true}, function(err, response) { 
	    		if(err){
	    			deferred.reject(err);
	    		}

	    		var plantings = _(response.rows).pluck('doc');
	    		//get an array of all place ids
	    		var places_ids = _(plantings).chain().pluck('place_id').unique().value();

	    		
	    	});*/
				
				//build an array of unique place ids in models in this collection
				var places_ids = _(jsonModels).chain()
					.pluck('place_id')
					.unique()
					.filter(function(val){ return !(val===undefined) })
					.value();

				console.log('Plantings Collection: Fetching related JSON', this.models, places_ids);

	    	//get all place docs corresponding to the array of ids
    		db.allDocs({include_docs:true, keys:places_ids}, function(err, response){
    			if(err){
    				return deferred.reject(err);
    			}
    			//make an array of place docs
    			var places = _(response.rows).pluck('doc');

    			//create a hash with place ids as property names and place JSON objects as values
    			var places_map = _(places).chain().pluck('_id').object( places ).value();

    			//iterate through plantings and assign place
    			_(jsonModels).each(function(m){
    				m.place = places_map[m.place_id] || undefined;
    			});
    			console.log('Plantings Collection: Enhanced JSON models with related documents', jsonModels);
    			//resolve the promise with the plantings
    			//deferred.resolve(plantings);
    			deferred.resolve(jsonModels);
    		}.bind(this));

	    }

		});
    return Collection;
  });