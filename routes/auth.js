"use strict";

const { User } = require("../plugins/models");
const Boom = require("boom");
const Bcrypt = require("bcrypt");
const Joi = require("joi");

exports.register = (server, options, next) => {

    server.route({
        method: "POST",
        path: "/login",
        handler: (request, reply) => {
            User.findOne({
                username: request.payload.username
            }, (err, user) => {
                if (err) throw err;
                if (!user) reply(Boom.unauthorized("This username doesn't exist"));
                else {
                    Bcrypt.compare(request.payload.password, user.password, (err, result) => {
                        if (err) throw err;
                        if (!result) reply(Boom.unauthorized("This password is invalid"));
                        return reply({
                            token: user.token,
                            username: user.username
                        });
                    });
                }
            });
        },
        config: {
            validate: {
                payload: {
                   username: Joi.string().min(1).max(20).required(),
                   password: Joi.string().min(3).max(20).required() 
                }
            }
        }
    })

    next();
}

exports.register.attributes = {
    name: "routes-auth",
    dependancies: ['hapi-auth-bearer-token', 'db']
}