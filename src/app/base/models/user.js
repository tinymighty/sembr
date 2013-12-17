define(["sembr", 'sembr.model'],
function(sembr, Model) {

    var User = Model.extend({

        type:'user'

    });

    return User;
});