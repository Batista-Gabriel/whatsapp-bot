const mongoose = require('../index')
const { capitalizeName} = require('../utils/utils')
const mongoosePaginate = require('mongoose-paginate-v2');

const dependentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
        uppercase:true
    },
    church: {
        type: String,
        trim: true,
        uppercase:true
    },
    observation: {
        type: String,
        trim: true
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

    if (this._update.createdAt)
        delete this._update.createdAt

    next()
})
dependentSchema.pre('save', async function (next) {

    this.createdAt = Date.now()

    this.name = capitalizeName(this.name)
    next();
})

const Dependent = mongoose.model("dependent", dependentSchema)

Dependent.paginate().then({});
module.exports = Dependent
