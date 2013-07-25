define(['backbone', 'marionette'], function(Backbone, Marionette){
  var AppRouter = Backbone.Router.extend({



    constructor: function(options){
      var args = Array.prototype.slice.apply(arguments);
      Backbone.Router.prototype.constructor.apply(this, args);

      this.options = options;

      this.controllerInstances = {};

      if (this.moduleRoutes){
        var controller = Marionette.getOption(this, "controller");
        this.processAppRoutes(controller, this.moduleRoutes);
      }
    },

    // Internal method to process the `appRoutes` for the
    // router, and turn them in to routes that trigger the
    // specified method on the specified `controller`.
    processAppRoutes: function(controller, moduleRoutes){
      var methodName, controller, controllerOpts, func, controllerInst;
      var route, routesLength, i;
      var routes = [];
      var router = this;

      /*for(route in appRoutes){
        if (appRoutes.hasOwnProperty(route)){
          routes.unshift([route, appRoutes[route]]);
        }
      }*/

      for(route in moduleRoutes){
        if (moduleRoutes.hasOwnProperty(route)){
          console.log('Adding route', route);
          console.log(router);
          routes.unshift([route, moduleRoutes[route] ]);
        }
      }

      console.log('Route array', routes);

      routesLength = routes.length;
      for (i = 0; i < routesLength; i++){
        route = routes[i][0];
        controller = routes[i][1].controller;
        methodName = routes[i][1].method;
        controllerOpts = routes[i][1].options || {};
        func = function(){
          //if we haven't already got an instance of the controller, make one and save it for later
          controllerInst = (!router.controllerInstances[ controller ]) ?  new controller( controllerOpts ) : router.controllerInstances[ controller ];
          //call the controller method specified for this route, passing along the data from Backbone.Router
          controllerInst[ methodName ].apply(controllerInst, arguments);
        }
        router.route(route, (controller.name||'')+methodName, func);
      }
    }


  });
  return ModuleRouter;
});