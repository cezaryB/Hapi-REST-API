"use strict"

 const uuid = require("node-uuid");
 const Joi = require("joi");
 const Boom = require("boom");
 const { Bookmark } = require("../plugins/models");

exports.register = (server, options, next) => {

    const User = server.plugins.db.User;
    
    function changeIdKey(element) {
        element.id = element._id;
        delete element._id;
        delete element.creator;
        delete element.upvoters;
    }

    //Creating routes

    server.route({
        method: 'GET',
        path: '/bookmarks',
        handler: (request, reply) => {
            let sort;

            if (request.query.sort === "top") {
                sort = {
                    $sort: {
                        upvotes: -1
                    }
                }
            }
            else {
                sort = {
                    $sort: {
                        created: -1
                    }
                }
            }

            Bookmark.aggregate({
                $project: {
                    title: 1,
                    url: 1,
                    crated: 1,
                    upvotes: {
                        $size: '$upvoters'
                    }
                }
            }, sort, (err, docs) => {
                if (err) throw err;
                docs.forEach(changeIdKey);
                reply(docs);
            });
        },
        config: {
            validate: {
                query: {
                    sort: Joi.string().valid("top", "new").default("top")
                }
            }
        } 
    });


    server.route({
        method: 'GET',
        path: '/bookmarks/{id}',
        handler: (request, reply) => {
            Bookmark.findOne({_id: request.params.id}, (err, result) => {
                if (err) throw err;
                else if (!result) return reply("Sorry, this bookmark doesn't exist").code(404);
                result.upvotes = result.upvoters.length;
                changeIdKey(result);
                return reply(result);
            });
        } 
    });


    server.route({
        method: 'POST',
        path: '/bookmarks',
        handler: (request, reply) => {
            const bookmark = new Bookmark(request.payload);
            bookmark.id = uuid.v1();
            bookmark.created = new Date();
            bookmark.creator = request.auth.credentials._id;
            bookmark.upvoters = [];
            bookmark.upvotes = 0;
            bookmark.save((err, result) => {
                if (err) throw err;
                changeIdKey(result);
                console.log(bookmark);
                return reply(bookmark).code(201);
            });
        },
        config: {
            auth: 'bearer',
            validate: {
                payload: {
                    title: Joi.string().min(1).max(100).required(),
                    url: Joi.string().required()
                }
            }
        } 
    });

    server.route({
        method: 'PATCH',
        path: '/bookmarks/{id}',
        handler: (request, reply) => {
            Bookmark.findOneAndUpdate({_id: request.params.id}, {$set: request.payload}, (err, result) => {
                if (err) throw err;
                if (!result) reply(Boom.notFound("Query doesn't exist"));
                return reply(result).code(204);
            });
        },
        config: {
            auth: 'bearer',
            validate: {
                payload: Joi.object({
                    title: Joi.string().min(1).max(100).optional(),
                    url: Joi.string().uri().optional()
                }).required().min(1)
            }
        } 
    });

    server.route({
        method: 'DELETE',
        path: '/bookmarks/{id}',
        handler: (request, reply) => {
            Bookmark.findOneAndRemove({_id: request.params.id}, (err, result) => {
                if (err) throw err;
                if (!result) reply(Boom.notFound("Query doesn't exist"));
                reply(`${result} was deleted`).code(204);
            });
        },
        config: {
            auth: 'bearer'
        } 
    });

    server.route({
        method: 'POST',
        path: '/bookmarks/{id}/upvote',
        handler: (request, reply) => {
            Bookmark.findOneAndUpdate({_id: request.params.id}, {$addToSet: {upvoters: request.auth.credentials._id}}, (err, result) => {
                if (err) throw err;
                if (!result) reply(Boom.notFound("Query doesn't exist"));
                reply(result).code(204);
            });
        },
        config: {
            auth: 'bearer'
        } 
    });

    return next();
}

exports.register.attributes = {
    name: 'routes-bookmarks',
    dependencies: 'db'
}