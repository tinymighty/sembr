define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!./planting.tpl'],
function(sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
	attributes:{
		class: 'planting'
	},
	template: template,

	// View Event Handlers
	events: {
		'click .bar': 'barClick'
	},

	ui:{
		bar: '.bar',
		plant_name: '.plant.name',
		place_name: '.place.name'
	},

	initialize: function(options){
		this.options = options;
	},


	barClick: function($ev){
		sembr.log('Bar click!')
		$ev.preventDefault();
		sembr.navigate( '/track/planting/'+this.model.get('_id'), {trigger: true});
	},

	onRender: function(){
		var width = Math.floor(Math.random()*1000);
		var left = Math.floor(Math.random()*100);
		this.ui.bar
			.width(width)
			.offset({left: left})
			.css({'background-color': this.model.plant().get('presentation').color});
		;
	},

	serializeData: function(){
		var data = this.model.toJSON({include_associations:true});
		return data;
	}

  });
});