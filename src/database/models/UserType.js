const { capitalizeName } = require('../utils/utils')
const mongoose = require('../index')


const UserTypeSchema = new mongoose.Schema({

    name: {
        type: String,
        unique: true,
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastEditedAt: {
        type: Date,
        default: Date.now
    },

})

UserTypeSchema.pre('save', function (next) {

    this.lastEditedAt = Date.now()
    this.createdAt = Date.now()
    this.name = capitalizeName(this.name)
    next();
})

UserTypeSchema.pre('updateOne', async function (next) {
    if (this._update.createdAt)
        delete this._update.createdAt
    if (this._update.name)
        this._update.name = capitalizeName(this._update.name)


    this._update.lastEditedAt = Date.now();
    next();
})

const UserType = mongoose.model("userType", UserTypeSchema)
module.exports = UserType