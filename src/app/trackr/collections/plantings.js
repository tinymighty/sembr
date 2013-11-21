define(["sembr", "underscore", "sembr.collection"],
  function(sembr, _, Collection) {
    var Plantings = Collection.extend({
		  model: function(attrs, options) {
		  	sembr.log('Creating new Planting model from Plantings collection.');
		    return sembr.trackr.models.Planting.create(attrs, options);
		  },

	    query: {
	    	map: undefined,
	    	options: undefined,
	    	keys: undefined
	    },

	    views: {
	    	fetch_all: {
	    		map: function(doc){
	    			if(doc.type==='planting'){
	    				emit([doc.user], null)
	    			}
	    		},
	    		keys: ['user']
	    	},
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
	    }

		});

		/*Plantings
			.represents('planting')
				.associations()
					.one('place', {here: 'place_id', autoload:false})
					.one('plant', {here: 'plant_id'})
					.many('actions', {there: 'planting_id'})
				.views()
					.view('by_user', function(doc){
						if(doc.type==='planting'){
							emit([doc.user], null)
						}
					}, ['user'])
					.view('where', function(doc){
						if(doc.type==='planting'){
							emit([doc.user, doc.plant_id, doc.place_id], null)
						}
					}, ['user', 'plant_id', 'place_id']);*/


    return Plantings;
  });