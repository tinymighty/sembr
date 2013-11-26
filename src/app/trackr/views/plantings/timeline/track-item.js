define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!./track-item.tpl'],
function(sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    tagName: 'div',
    attributes:{
      class: 'track-item'
    },
    template: template,

    events: {
        'click a': 'plantingClick'
    },

    initialize: function(){
        //this.model = new Backbone.Model();
    },

    onRender: function(){

    },

    serializeData: function(){
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
      return { date: months[this.model.get('date').getMonth()] }
    }

  });
});