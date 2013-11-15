define(['sembr', 'sembr.controller', 'backbone', 'backbone.collectionbinder','marionette', 
	'../collections/places.js',
	'../views/layout.js', '../views/dashboard/dashboard.js', '../views/places/treeview.js',
	"components/loader/loader"],
function (Sembr, Controller, Backbone, CB, Marionette, 
	PlacesCollection,
	Layout, DashboardView, TreeView,
	LoaderView) {
	var DashboardController = Controller.extend({

		initialize:function (options) {
				this.layout = new Layout();
				this.loaderView = new LoaderView();
		},

		beforeModuleRoute: function(){
			console.log('Controller ID', this.id);
			//console.log('Setting plantings layout!');
			Sembr.layout.setContent( this.layout );
			//this.layout.sidebar.show( new Sidebar({collection: this.collection}) );
		},

		dashboard: function(){
			this.layout.main.show( this.loaderView );
			new PlacesCollection().fetch().then(function(places){
				console.log('Places...', places);
				this.layout.main.show( new TreeView({collection:places}) );
			}.bind(this));
		}


	});

	return DashboardController;
});