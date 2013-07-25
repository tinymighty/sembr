define(['backbone', 'marionette'], function(Backbone, Marionette){
  var ModuleRouter = Backbone.Router.extend({



    constructor: function(options){
      var args = Array.prototype.slice.apply(arguments);
      Backbone.Router.prototype.constructor.apply(this, args);
      //console.log('ModuleRouter options: ',options);
      if(!options || !options.module){
        throw 'Missing module option. Please pass a module instance to the ModuleRouter';
      }
      this.module = options.module;


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

      //keeping in mind the prefix can be an empty string for the base module
      var prefix = this.urlPrefix === undefined ? this.module.moduleName : this.urlPrefix;
      if(prefix.length > 0 && prefix[prefix.length]!=='/'){
        prefix += '/';
      }

      for(route in moduleRoutes){
        if (moduleRoutes.hasOwnProperty(route)){
          //console.log('Adding route', route);
          //console.log(router);
          routes.unshift([prefix+route, moduleRoutes[route] ]);
        }
      }

      routesLength = routes.length;
      for (i = 0; i < routesLength; i++){
        route = routes[i][0];
        controller = routes[i][1].controller;
        methodName = routes[i][1].method;
        controllerOpts = routes[i][1].options || {};
        func = function(r, c, mN, cO){
          return function(){
            var ci;
            //console.log("Matched route!", r, router.module.moduleName, mN, arguments, Math.random()*1000);
            //console.log('Router controller instances...', router.controllerInstances);
            //if we haven't already got an instance of the controller, make one and save it for later
            if(!router.controllerInstances[ c ]){
              ci = router.controllerInstances[ c ] = new c( cO )
            }else{
              ci = router.controllerInstances[ c ]
            }
            if(_(ci['beforeModuleRoute']).isFunction()){
              ci['beforeModuleRoute'].apply(ci, arguments);
            }
            //call the controller method specified for this route, passing along the data from Backbone.Router
            ci[ mN ].apply(ci, arguments);
          }
        }(route, controller, methodName, controllerOpts);
        router.route(route, (controller.name||'')+methodName, func);
      }
    }


  });
  return ModuleRouter;
});