define(['sembr', 'jquery', 'underscore',  'sembr.ractiveview', 
'rv!./record.tpl'
],function(sembr, $, _, RactiveView, 
template){

	'use strict';

	var view = RactiveView.extend({
		template: template,

		events:{
		},

		observers: {
			'verb': '_verbSelect',
			'what': '_whatSelect'
		},

		ui:{
			'quickEntry': '.action.description.entry'
		},

		actionToPastTest: {
			'plant': ['planted'],
			'sow': ['sown', 'sowed', 'sew'],
			'transplant': ['transplanted']
		},

		verb_category:{
			'plant': [ 'plant', 'sow', 'transplant' ],
			'remove': [ 'harvest', 'remove', 'dig in' ],
			'feed': [ 'fertilize', 'water', 'dust', 'mulch', 'dig in', 'apply' ],
			'antipest': [ 'spray', 'dust', 'apply' ],
			//generally, plants are tended
			'tend': [ 'prune', 'dehead' ],
			//land is maintained.. but there will be cross over
			'maintain': [ 'weed', 'mulch' ],
			'propagate': [ 'pollinate', 'seed save', '' ]
		},

		/* A map of verb categories to Sembr object types
		eg. 
		You _plant_ a _plant_ in a _place_, 
		you _remove_ a _planting_ from a _place_ */
		category_object_map: {
			'plant': [ 'plant', 'place' ],
			'remove': [ 'planting', 'place' ],
			'feed': [ 'planting', 'place' ],
			'antipest':[ 'planting', 'place' ],
			'tend': [ 'planting', 'place' ],
			'maintain': [ 'planting', 'place' ],
			'breed': [ 'planting' ]
		},

		object_plurals: {
			'planting': 'plantings',
			'place': 'places',
			'plant': 'plants'
		},

		initialize: function(options){
			var all_verbs;
			all_verbs = _(this.verb_category).chain()
				.values()
				.flatten()
				.unique()
				.value();

			//verb objects entered by the user
			this.enteredObjects = [];

			this.set('when', 'Yesterday');
			this.set('verbs', all_verbs);
			this.set('objects', new Backbone.Collection);
		},

		/* Given a verb, returns the general category (ie: sow > plant, fertilize > feed) */
		getVerbCategories: function(verb){
			var categories = [];
			_( this.verb_category ).each( function(verbs, cat){
				if( verbs.indexOf(verb) > -1 ){
					categories.push(cat);
				}
			});
			return categories;
		},

		verbInCategory: function(verb, category){
			var categories = this.getVerbCategories(verb);
			if( categories.indexOf(category) > -1 ){
				return true;
			}
			return false;
		},

		//find relevant verb objects (gramatical objects, that is)
		//ie. if the verb is 'harvest', then...
		//we can only harvest from existing plantings
		//we can approach it via a plant & place OR the place
		//ie. I harvested Field 7 (assumed to mean harvested EVERYTHING)
		//or. I harvested Carrots from The Garden
		getVerbObjects: function( verb ){
			var 
				categories,
				object_types = [],
				results = []
			;

			//get verb categories, and map this back to the Sembr object type
			categories = this.getVerbCategories(verb);
			if(categories.length){
				object_types = _( categories )
					.chain()
					.map( function(category){
						return this.category_object_map[category];
					}, this)
					.flatten()
					.unique()
				;
				results = [];
				_( object_types ).each( function(type){
					console.log("getting models for type", type, this.object_plurals[type]);
					results = results.concat( sembr.trackr[ this.object_plurals[type] ].models );
				}, this);

			}
			return results;
		},

		getRelevantObjects: function( verb, object ){
			if( this.verbInCategory(verb, 'plant') ){
				//we're planting, so 
			}
		},

		updateObjects: function(){
			var 
				objects = this.get('objects'),
				results = this.getVerbObjects( this.verb )
			;

			this.enteredObjects.forEach( function( word ){
				var re = new RegExp(word, 'i');

				results = results.filter( function( obj ){

					if( obj.get('type') === 'planting' ){
						return !!obj.get('plant').get('use_name').match( re ) 
									 || !!obj.get('place').get('name').match( re );
					}
					
					if( obj.get('type') === 'plant' ){
						return !!obj.get('use_name').match( re );
					}
					
					if( obj.get('type') === 'place' ){
						return !!obj.get('name').match( re );
					}

					return false;
				} );

			}, this);

			console.log('Updating objects with results %o',results);

			objects.set(results);
			this.set('objects', objects);
		},

		_verbSelect: function( newValue, oldValue, keypath ){
			this.verb = newValue;
			this.updateObjects();
		},

		_whatSelect: function( newValue, oldValue, path ){
			if( ~ this.enteredObjects.indexOf( oldValue ) ){
				this.enteredObjects[ this.enteredObjects.indexOf(oldValue) ] = newValue;
			}else{
				this.enteredObjects.push( newValue );
			}
			this.updateObjects();
		}

	});
	return view;
});