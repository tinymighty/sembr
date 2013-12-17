define( ['sembr', 'backbone', 'marionette', 'jquery', 'underscore',
'trackr/views/plantings/timeline/groups', 'trackr/views/plantings/timeline/plantings', 'trackr/views/plantings/timeline/track',
'hbs!./timeline.tpl'],
function( sembr, Backbone, Marionette, $, _,
Groups, Plantings, Track,
template ){
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    template: template,
    attributes: {
      id: 'dashboard-planting-timeline',
      class: 'planting timeline'
    },

    /*regions:{
      controls: '.controls',
      plantings: '.plantings',
      track: '.track'
    },*/

    // View Event Handlers
    events: {

    },

    initialize: function(options){
      console.log('Timeline init', options);
      if(!options.collections || _(['plants', 'places', 'plantings']).difference(_(options.collections).keys()).length  ){
        throw 'Plantings, places and plants collections must be passed to plantings/timeline view.';
      }
      this.collections = options.collections;
      this.collections.groups = new Backbone.Collection();
      this.options = _(options).defaults({
        groupBy: 'plant'
      });

      this.views = {
        groups: new Groups({timeline:this}),
        //plantings: new Plantings({timeline: this}),
        track: new Track({timeline: this})
      }

      $(window).resize(this.onResize.bind(this));

      this._group();
    },

    _groupableBy: ['plant', 'place'],

    groupBy: function(by){
      if(this._groupableBy.indexOf(by)){
        this.options.groupBy = by;
        this.views.groups
          .hide()
            .done(function(){
              this.groups.reset();
              this._group();
              this.views.groups.show();
            }.bind(this))
        ;
        return true;
      }else{
        return false;
      }
    },

    //update the UI without re-rendering everything
    update: function(){
      this._group();
    },

    _group: function(){
      
      grouped = this.collections.plantings.groupBy(function(model){
        var group;
        switch(this.options.groupBy){
          case 'plant':
            return model.plant().get('id');
          case 'place':
            return (model.plant()) ? model.plant().get('id') : null; //place can be undefined
            break;
        }
      }.bind(this));

      var getGroupName = _(function(id){
        switch(this.options.groupBy){
          case 'plant':
            return this.collections.plants.get(id).get('use_name');
          case 'place':
            return id ? this.collections.places.get(id).get('name') : 'Unspecified'
        }
      }).bind(this);

      _(grouped).each(function(models, id){
        this.collections.groups.add( new Backbone.Model({ name:getGroupName(id), plantings: models }) );
      }.bind(this));

    },

    onRender: function(){
      this.$el.append(this.views.groups.render().$el);
      //this.$el.append(this.views.plantings.render().$el);
      this.$el.append(this.views.track.render().$el);
      this.update();
    },

    update: function(){
      //iterate through groups and assign the right sizing by number of children
      _(this.grouped).each(function(){

      });
    },

    onResize: function(){

    },

    renderTrack: function(){
      
    },

    onClose: function(){
      //sembr.log('plantings list view closed.');
    }

  });
});