"use strict";

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String
});
const User = mongoose.model("User", UserSchema);

const BookmarkSchema = new mongoose.Schema({
    title: String,
    url: String,
    created: {type: Date, default: Date.now},
    creator: String,
    upvoters: Array
});

const Bookmark = mongoose.model("Bookmark", BookmarkSchema);

module.exports = {
    User,
    Bookmark
}

