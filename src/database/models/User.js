const mongoose = require('../index')
const bcrypt = require("bcryptjs")
const { capitalizeName, getUserName } = require('../utils/utils')
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        select: false,
        trim: true
    },
    userType:
        { type: mongoose.Schema.Types.ObjectId, ref: 'userType', }
    ,
    createdAt: {
        type: Date,
        default: Date.now
    },

})

UserSchema.plugin(mongoosePaginate)

UserSchema.pre('updateOne', async function (next) {
    if (this._update.name)
        this._update.name = capitalizeName(this._update.name)

    if (this._update.password) {
        const hash = await bcrypt.hash(this._update.password, 10)
        this._update.password = hash;
    }

    if (this._update.createdAt)
        delete this._update.createdAt

    next()
})
UserSchema.pre('save', async function (next) {
    this.createdAt = Date.now()
    if (!this.username) {
        this.username = getUserName(this.name.trim())
    }

    this.name = capitalizeName(this.name)
    if (this.password) {
        const hash = await bcrypt.hash(this.password, 10)
        this.password = hash;
    }
    next();
})

const User = mongoose.model("user", UserSchema)

User.paginate().then({});
module.exports = User
