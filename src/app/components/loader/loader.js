define(['sembr', 'backbone', 'jquery', 'hbs!./loader.tpl', ],
function (Sembr, Backbone, $, template) {
  return Backbone.Marionette.ItemView.extend({
     template:template
  });
});