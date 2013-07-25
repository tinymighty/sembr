define(['sembr', 'backbone','../views/dashboard.js'],
function (Sembr, Backbone, DashboardView, HeaderView) {
    return Backbone.Marionette.Controller.extend({

        //gets mapped to in AppRouter's appRoutes
        home: function() {
            Sembr.layout.setContent(new DashboardView());
        }
    });
});