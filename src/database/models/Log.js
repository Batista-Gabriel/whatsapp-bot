const mongoose = require('../index')


const LogSchema = new mongoose.Schema({

    logType:
        { type: mongoose.Schema.Types.ObjectId, ref: 'logType', }
    ,
    user:
        { type: mongoose.Schema.Types.ObjectId, ref: 'user', }
    ,
    course:
        { type: mongoose.Schema.Types.ObjectId, ref: 'course', }
    ,
    subject:
        { type: mongoose.Schema.Types.ObjectId, ref: 'subject', }
    ,
    courseGrid:
        { type: mongoose.Schema.Types.ObjectId, ref: 'courseGrid', }
    ,
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

})

LogSchema.pre('save', function (next) {

    this.createdAt = Date.now()
    next();
})

const Log = mongoose.model("log", LogSchema)
module.exports = Log