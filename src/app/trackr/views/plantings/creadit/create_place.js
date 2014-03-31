/**
 * A view to quickly create a new plant while entering a planting
 */
define(['sembr.ractiveview', 'selectize', 'rv!./create_place.tpl'], function(View, selectize, tpl){
	return View.extend({
		template: tpl,

		ui: {
			'types': '#add_planting-create_place-types',
			'places': '#add_planting-create_place-places'
		},

		initialize: function(){
			this.set('place', this.model);
			this.set('default_place_types', sembr.trackr.models.Place.default_place_types);
			this.set('places', sembr.trackr.places);
		},

		onRender: function(){
			var view = this;
			this.ui.types.selectize({
				maxItems: 1,
				hideSelected: false,
				onChange: function( type ){
					view.model.set('place_type', type);
				}
			});
			this.ui.places.selectize({
				maxItems: 1,
				hideSelected: false,
				onChange: function( id ){
					view.model.set('in_place', id);
				}
			});
		}

	});
})