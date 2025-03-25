const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { Readable } = require('stream');

mongoose.connect(process.env.MONGODB_URI);
const conn = mongoose.connection;

let gfs, gridfsBucket;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
    console.log('✔ GridFS Initialized');
});

function getGridFSBucket() {
    if (!gridfsBucket) throw new Error('GridFSBucket not initialized');
    return gridfsBucket;
}

function getGFS() {
    if (!gfs) throw new Error('GridFS not initialized');
    return gfs;
}

module.exports = { mongoose, getGFS, getGridFSBucket, Readable };
