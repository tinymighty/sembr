define(['sembr', 'sembr.model'],
function(sembr, Model) {
	// Creates a new Backbone Model class object

	/**
	 * Document schema
	 * 
	 * _id
	 *      Document UID
	 * type
	 *      Document type; "planting"
	 * status
	 *      Planting status; [current, past, future]
	 * plant
	 *      Plant document UID
	 * place
	 *      Place document UID
	 * actions
	 *      Array of planting action objects (eg. sowed, planted, harvested)
	 */
	var Planting = Model.extend({
		name: 'planting',

		defaults: {
			type: 'planting',
			status: 'current', //past, current or future
			from: 'seed', //seed, plant, cutting
			from_planting_id: null,

			planted_on:null,
			removed_on:null
		},

		initialize: function(attrs, options){
			if(attrs && !attrs._id){
				this.created = new Date().toString();
			}
			Model.prototype.initialize.apply(this, arguments);
		},

		__set_created: function(value){
			return this.attributes.created = (value instanceof Date) ? Date.toString() : value;
		},
		__get_created: function(){
			return new Date(this.attributes.created);
		},

		plantingActionsCollectionOptions: function(){
			return {planting_id: this.get('_id')};
		},

		plantsCollectionOptions: function(){
			return {planting_id: this.get('_id')};
		},

		// Get's called automatically by Backbone when the set and/or save methods are called (Add your own logic)
		validate: function(attrs) {
			if(attrs.type!=='planting'){
				throw {error: 'type property must be planting'};
			}
		},

		_afterSync: function(method, model, options, res){
			//if the place json wasn't loaded, try to find the place in the user's places
			if(!res.place && sembr.trackr.places){
				res.place = sembr.trackr.places.where({_id: res.place_id}).shift() || undefined;
			}
		},

		serialized: {
			date: 'date',
			place_id: {	
				in: 	function(id){ return this.place() && this.place().get('id') || id }, 
				out: 	function(id){ return id; }
			},
			plant_id: {
				in: 	function(id){ return this.plant() && this.plant().get('id') || id },
				out: 	function(id){ return id; }
			}
			//place_id: ['association', {name: 'place'}],
			//plant_id: ['association', {name: 'plant'}]
		},

		relatedDocs:[
			{
				target: 'place',
				key: 'place_id',
				autoload: false, //all user places are, by default, loaded before trackr init so places should already be availble
			},
			{
				target: 'plant',
				key: 'plant_id'
			},
			{
				target: 'actions',
				key: 'subject_id',
				source: 'remote',
				query: {
					map: function(doc){
						if(doc.type==='action' && doc.subject_type==='planting'){
							emit([doc.subject_id], null);
						}
					},
					//options will be passed an array of planting documents before they have been used to initialize
					//models on this collection
					options: function( docs, collection ){
						return {
							keys: _(docs).pluck('_id')
						}
					}
				}
			}
		],


		docType: 'planting'

	});

	/*Planting
		.has()
			.one('place', {inverse: 'planting', key: 'place_id'})
			.many('actions', {inverse: 'planting', key: 'subject_id'});*/

	// Returns the Model class
	return Planting;
});