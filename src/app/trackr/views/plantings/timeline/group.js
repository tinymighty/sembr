define( ['sembr', 'backbone', 'marionette', 'jquery', 'trackr/views/plantings/timeline/planting', 'hbs!./group.tpl'],
function(sembr, Backbone, Marionette, $, Planting, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.CompositeView.extend( {
		attributes:{
			class: 'group'
		},
		template: template,

		itemView: Planting,

		initialize: function(options){
			console.log('Init group item', this.model);
			this.collection = new Backbone.Collection(this.model.get('plantings'));
		}

	});
});