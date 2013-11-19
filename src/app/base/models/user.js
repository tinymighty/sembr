define(["sembr", 'sembr.model'],
function(sembr, Model) {

    var User = Model.extend({

        defaults: {
            type: 'user'
        },

        docType: 'user'

    });

    return User;
});