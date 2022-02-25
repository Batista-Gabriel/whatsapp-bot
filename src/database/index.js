const mongoose = require('mongoose')

require('dotenv/config');
const uri = "mongodb+srv://"+process.env.DB_USERNAME+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+ "/"+ process.env.DB_NAME+"?retryWrites=true&w=majority"

// Localhost
//const uri = 'mongodb://'+process.env.DB_HOST1+ '/'+ process.env.DB_NAME1
let options ={ useUnifiedTopology: true,  useNewUrlParser: true }
mongoose.connect(uri,options)
mongoose.Promise=global.Promise
// connection state
// console.log(mongoose.connection.readyState)
module.exports = mongoose