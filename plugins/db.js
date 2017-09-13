"use strict";

const mongoose = require("mongoose");
const Bcrypt = require("bcrypt");
const model = require("./models");
mongoose.Promise = global.Promise;

exports.register = (server, options, next) => {
    mongoose.connect("mongodb://localhost/social-bookmakrs");
    const db = mongoose.connection;
    db.once("open", () => {
        console.log("it has connected");
    })
    server.expose("User", model.User);
    server.expose("Bookmark", model.Bookmark);

    //prepare markup user data

    const users = [{
        _id: '0a44ce1a-2cb9-11e6-b67b-9e71128cae77',
        username: 'john',
        password: Bcrypt.hashSync('doe', Bcrypt.genSaltSync()),
        token: '450ca305d7042c0a0f19'
    }, {
        _id: '0c45d7b4-5881-4e64-8fd3-2057325e2afe',
        username: 'jane',
        password: Bcrypt.hashSync('doe', Bcrypt.genSaltSync()),
        token: '11e6b67b9e71128cae77'
    }];
      const bookmarks = [{
        "title": "CNN",
        "url": "http://cnn.com/",
        "created": new Date(),
        "creator": "0a44ce1a-2cb9-11e6-b67b-9e71128cae77",
        "upvoters": [ "sasas"

        ]
    }, {
        "title": "Huffington Post",
        "url": "http://www.huffingtonpost.com",
        "created": new Date(),
        "creator": "0a44ce1a-2cb9-11e6-b67b-9e71128cae77",
        "upvoters": [

        ]
    }];
    function saveContacts(data, model) {
        data.forEach(user => {
            const newRecord = new model({username: user.username, password: user.password, token: user.token});
            newRecord.save((result, err) => {
                if (err) next(err);
            });
        });
    }

     function saveBookmarks(data, model) {
        data.forEach(bookmark => {
            const newRecord = new model({title: bookmark.title, url: bookmark.url, creator: bookmark.creator, upvoters: bookmark.upvoters});
            newRecord.save((result, err) => {
                if (err) next(err);
            });
        });
    }

    model.User.remove({}, (err, result)=> {
        if (err) next(err);
        console.log("users collection was removed");
        saveContacts(users, model.User);
    });
    model.Bookmark.remove({}, (err, result) => {
        if (err) next(err);
        console.log("bookmarks collection was removed");
        saveBookmarks(bookmarks, model.Bookmark);
    });
    next();
    
}

exports.register.attributes = {
    name: 'db',
}