define(['sembr', 'sembr.controller', 'backbone', 'marionette', 
	'trackr/views/layout', 'trackr/views/record/record',
	"components/loader/loader"],
function (sembr, Controller, Backbone, Marionette, 
	Layout, RecordView,
	LoaderView) {
	var Record = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.loader  = new LoaderView();
		},

		beforeModuleRoute: function(){
			this.places = sembr.trackr.places;
			this.plants = sembr.trackr.plants;
			sembr.base.setContent( this.layout );
			//this.layout.sidebar.show( new Sidebar({collection: this.collection}) );
		},

		record: function(){
			//show loading view until places have been fetched
			this.layout.main.show( this.loader );

			//@todo: restrict to plantings based on criteria
			plantings = new sembr.trackr.collections.Plantings();
			plantings
				.fetchWhere({user: sembr.user.get("_id")})
				.fail(function(err){
					sembr.showError('Failed to load user plantings.');
				})
				.done(function(plantings){
					sembr.log('Loaded plantings. Showing record view.', this.layout.main);
					var record = new RecordView({collections: {places: this.places, plants: this.plants, plantings: plantings}});
					this.layout.main.show( record );
				}.bind(this));

		}


	});

	return Record;
});