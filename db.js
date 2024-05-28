const mongoose = require('mongoose');

const dbURI = 'mongodb://127.0.0.1:27017/iNoteBook';

const connectToMongo = () => {
    mongoose.connect(dbURI).then(() => {
        console.log("Connected to Database");
    }).catch((err) => {
        console.log("Not Connected to Database ERROR! ", err);
    });
}

module.exports = connectToMongo
