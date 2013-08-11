define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!./dashboard.tpl'],
function(Sembr, Backbone, Marionette, $, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    tagName: 'div',
    template: template,

    // View Event Handlers
    events: {
        'click [data-action="addAction"]': 'addAction'
    },
  });
});