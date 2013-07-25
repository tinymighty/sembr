define( ['sembr', 'backbone', 'marionette', 'jquery', '../collections/planting-actions.js', '../models/action.js', '../views/actions.js', 'hbs!./show.tpl'],
function(Sembr, Backbone, Marionette, $, PlantingActionsCollection, ActionModel, PlantingActionsView, template) {
  //ItemView provides some default rendering logic
  return Backbone.Marionette.ItemView.extend( {
    tagName: 'div',
    template: template,

    // View Event Handlers
    events: {
        'click [data-action="addAction"]': 'addAction'
    },
