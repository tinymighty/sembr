define( ['sembr', 'backbone', 'marionette', 'jquery', 'hbs!..templates/welcome'],
    function(sembr, Backbone, Marionette, $, template) {
        //ItemView provides some default rendering logic
        return Backbone.Marionette.ItemView.extend( {
            template: template,

            // View Event Handlers
            events: {

            }
        });
    });