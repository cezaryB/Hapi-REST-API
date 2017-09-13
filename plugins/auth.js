
exports.register = (server, options, next) => {
    
    const User = server.plugins["db"].User;

    const validateFunction = (token, callback) => {
        User.findOne({token: token}, (err, user) => {
            if (err) return callback(err, false);
            if (!user) return callback(null, false);
            return callback(null, true, user);
        });

    }
    server.auth.strategy('bearer', 'bearer-access-token', {
        validateFunc: validateFunction
    });
    return next();
}

exports.register.attributes = {
    name: 'auth',
    dependancies: ['db', 'hapi-auth-bearer-token']
}

