"use strict"

const Hapi = require("hapi");
const server = new Hapi.Server();
const uuid = require("node-uuid");


server.connection({
    host: 'localhost',
    port: 3000
});


server.register([{
    register: require('good'),
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    log: '*',
                    response: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, {
    register: require("hapi-auth-bearer-token")
}, {
    register: require("./plugins/db")
}, {
    register: require("./plugins/auth")
}, {
    register: require("./routes/bookmarks")

}, {
    register: require("./routes/auth")
}], err => {
    if (err) console.error(err);
    server.start(() => {
        console.log(`${server.info.uri}`)
    });
});