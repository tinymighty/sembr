define(['sembr', 'backbone', 'jquery', 'hbs!./loader.tpl', ],
function (sembr, Backbone, $, template) {
  return Backbone.Marionette.ItemView.extend({
     template:template
  });
});