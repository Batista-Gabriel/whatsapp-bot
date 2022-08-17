const mongoose = require('../index')
const { capitalizeName, getUserName } = require('../utils/utils')
const mongoosePaginate = require('mongoose-paginate-v2');

const dependentSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    birthday: {
        type: String,
        lowercase: true,
        trim: true
    },
    sex: {
        type: String,
        trim: true,
    },
    church: {
        type: String,
        trim: true,
    },
    observation: {
        type: String,
        trim: true
    },
    checkIn: {
        type: Boolean,
        default: false,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    responsible:
        { type: mongoose.Schema.Types.ObjectId, ref: 'user', }
    ,
    createdAt: {
        type: Date,
        default: Date.now
    },

})

dependentSchema.plugin(mongoosePaginate)

dependentSchema.pre('updateOne', async function (next) {
    if (this._update.name)
        this._update.name = capitalizeName(this._update.name)

    if (this._update.church)
        this._update.church = capitalizeName(this._update.church)

    if (this._update.sex)
        this._update.sex = capitalizeName(this._update.sex)

    if (this._update.createdAt)
        delete this._update.createdAt

    next()
})
dependentSchema.pre('save', async function (next) {

    this.createdAt = Date.now()

    if (this.sex) {
        this.sex = capitalizeName(this.sex)
        this.username = getUserName(this.sex.substr(0, 3))
    }
    if (this.name) {
        this.name = capitalizeName(this.name)
        this.username = getUserName(this.name.trim())
    }

    next();
})

const Dependent = mongoose.model("dependent", dependentSchema)

Dependent.paginate().then({});
module.exports = Dependent
