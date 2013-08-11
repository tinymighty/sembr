define(['sembr', 'backbone', 'sembr.controller', '../views/dashboard.js'],
function (Sembr, Backbone, Controller, DashboardView, HeaderView) {
    return Controller.extend({

        //gets mapped to in AppRouter's appRoutes
        home: function() {
            Sembr.layout.setContent(new DashboardView());
        }
    });
});