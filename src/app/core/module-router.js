define(['sembr', 'jquery', 'backbone', 'marionette'], function(sembr, $, Backbone, Marionette){
  var ModuleRouter = Backbone.Router.extend({



    constructor: function(options){
      var args = Array.prototype.slice.apply(arguments);
      Backbone.Router.prototype.constructor.apply(this, args);
      //sembr.log('ModuleRouter options: ',options);
      if(!options || !options.module){
        throw 'Missing module option. Please pass a module instance to the ModuleRouter';
      }
      this.module = options.module;


      this.options = options;

      this.controllerInstances = {};

      if (this.moduleRoutes){
        this.processAppRoutes(this.moduleRoutes);
      }
    },

    // Internal method to process the `appRoutes` for the
    // router, and turn them in to routes that trigger the
    // specified method on the specified `controller`.
    processAppRoutes: function(moduleRoutes){
      var methodName, controllerOpts, func, controllerInst;
      var route, routesLength, i;
      var routes = [];
      var router = this;
      var module = this.module;

      //keeping in mind the prefix can be an empty string for the base module
      var prefix = this.urlPrefix || this.module.moduleName;
      if(prefix==='default')
        prefix = '';
      if(prefix.length > 0 && prefix[prefix.length]!=='/'){
        prefix += '/';
      }

      for(route in moduleRoutes){
        if (moduleRoutes.hasOwnProperty(route)){
          //sembr.log(router);
          routes.unshift([prefix+route, moduleRoutes[route] ]);
        }
      }

      routesLength = routes.length;
      for (i = 0; i < routesLength; i++){
        sembr.log('Adding route', routes[i], i, routesLength);

        func = function(route){
          return function(){
            var ci,   //controller instance
                controller; //controller object


            sembr.log("Matched route!", route,  arguments);
            var route_args = Array.prototype.slice.call(arguments);
            controller = module.controllers[route[1].controller];
            if(!controller){
              throw sembr.error('Controller %o not found for module %o', route[1].controller, module);
            }
            if(!controller.id){
              throw sembr.error('No controller id specified for controller %o (%o) in module %o', route[1].controller, controller, module);
            }
            if(!module._isInitialized){
              sembr.initModule(module.name)
            }
            //when the module is ready, activate the route
            $.when(module.ready || true).then(function(){
              sembr.log('Routing...', route, route_args);
              //if we haven't already got an instance of the controller, make one and save it for later
              ci = router.controllerInstances[ controller.id ] || (router.controllerInstances[ controller.id ] = new controller(route[1].options));

              if(_(ci['beforeModuleRoute']).isFunction()){
                ci['beforeModuleRoute'].apply(ci, route_args);
              }

              //call the controller method specified for this route, passing along the data from Backbone.Route
              ci[ route[1].method ].apply(ci, route_args);

            });

          }
        }(routes[i]);

        router.route(routes[i][0], (routes[i][1].controller||'')+'.'+methodName, func);
      }
    }


  });
  return ModuleRouter;
});