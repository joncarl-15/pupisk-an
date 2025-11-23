require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || '';
console.log('URI Length:', uri.length);
// Log start/end to check for double prefixes or missing parts, but hide password
if (uri.length > 20) {
    console.log('URI Start:', uri.substring(0, 15) + '...');
    console.log('URI End:', '...' + uri.substring(uri.length - 10));
} else {
    console.log('URI is very short:', uri);
}

mongoose.set('strictQuery', false);
mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('ERROR: Could not connect.');
        console.error(err.message);
        process.exit(1);
    });
