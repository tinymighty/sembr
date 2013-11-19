define( ['sembr', 'backbone', 'marionette', 'jquery', 'flatui-checkbox', 'timelinejs', 'hbs!../templates/dashboard'],
    function(sembr, Backbone, Marionette, $, flatui, createStoryJS, template) {
        //ItemView provides some default rendering logic
        return Backbone.Marionette.ItemView.extend( {
            template: template,

            // View Event Handlers
            events: {

            },

            onRender: function(){

            }
        });
    });