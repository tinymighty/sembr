define( ['sembr', 'backbone', 'marionette', 'jquery', 'underscore',
'trackr/views/plantings/timeline/plantings', 'trackr/views/plantings/timeline/track',
'hbs!./timeline.tpl'],
function( sembr, Backbone, Marionette, $, _,
Plantings, Track,
template ){
  //ItemView provides some default rendering logic
  return Backbone.Marionette.Layout.extend( {
    template: template,
    attributes: {
      id: 'dashboard-planting-timeline',
      class: 'planting-timeline'
    },

    regions:{
      controls: '.controls',
      plantings: '.plantings',
      track: '.track'
    },

    // View Event Handlers
    events: {

    },

    views: {

    },

    initialize: function(options){
      if(!this.collection){
        throw 'No collection passed to view.';
      }

      this.options = _(options).defaults({
        groupBy: 'plant'
      });

      this.views.plantings = new Plantings({collection: this.collection, group_by:this.options.groupBy});

      this.views.track = new Track();

      $(window).resize(this.onResize.bind(this));
    },

    onRender: function(){
    	this.plantings.show(this.views.plantings);
      this.track.show(this.views.track);
      this.renderTrack();
    },

    onResize: function(){
      //this.trackView.
    },

    renderTrack: function(){
      
    },

    onClose: function(){
      //sembr.log('plantings list view closed.');
    }

  });
});