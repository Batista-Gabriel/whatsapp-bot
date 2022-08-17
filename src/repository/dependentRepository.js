const Dependent = require("../database/models/Dependent")
const { getUserName } = require('../utils/utils')

module.exports = {
    async create(input) {
        try {
            delete input.createdAt
            delete input.lastEditedAt
            if (!input.username) {
                if (input.name)
                    input.username = getUserName(input.name.trim())
                else
                    input.username = getUserName(input.sex.substr(0, 3))
            }

            let dependent = await Dependent.create(input)
            let dependentId = dependent._id
            dependent = await Dependent.findOne({ _id: dependentId })

            return dependent

        } catch (e) {
            if (e.message.includes("is required")) {
                required = e.message.split("`")[1]
                return { error: required + " is required." }
            }
            console.log(e)
            return { error: "user registration failed" }
        }
    },

    async update(dependentId, input) {
        try {
            let foundDependent = await Dependent.find({ _id: dependentId })
            if (!foundDependent)
                return { error: "user not Found" }

            for (info in input) {
                if (input[info] == null)
                    delete input[info]
            }
            if (input.name && (foundDependent[0].username.substr(0, 3) == "Mas" || foundDependent[0].username.substr(0, 3) == "Fem")) {
                input.username = getUserName(input.name.trim())
            }
            await Dependent.updateOne({ _id: dependentId }, input)

            return await Dependent.findOne({ _id: dependentId }).populate('responsible')

        } catch (e) {
            console.log(e)
            return { error: "Registration failed" }
        }
    },

    async find(id) {

        if (id.length != 24)
            return { error: "user not found" }

        let response = await Dependent.findOne({ _id: id })
            .populate('responsible')
            .lean().then((dependent) => {

                if (!dependent)
                    return { error: "dependent not found" }
                return dependent
            })
        return response

    },

    async findByUsername(username) {


        let response = await Dependent.findOne({ username: username })
            .populate('responsible')
            .lean().then((dependent) => {

                if (!dependent)
                    return { error: "dependent not found" }
                return dependent
            })
        return response

    },

    async findByName(name) {
        name = name.trim().toLowerCase()
        let response = []
        await Dependent.paginate({}, {
            lean: true,
            leanWithId: true,
            sort: { name: 1 },
            populate: [{
                path: "responsible",
            }],
        }, function (err, result) {
            if (err)
                return { error: err }
            result.docs.forEach(dependent => {
                if (dependent.name.toLowerCase().includes(name)) {
                    response.push(dependent)
                }
            })
            return result
        });

        return response

    },


    async findByNumber(number) {

        let response = []
        await Dependent.paginate({}, {
            sort: { _id: 1 },
            lean: true,
            leanWithId: true,
            populate: [{
                path: "responsible",
            }],
        }, function (err, result) {
            if (err)
                return { error: err }
            result.docs.forEach(dependent => {
                if (dependent.responsible) {
                    if (dependent.responsible.phoneNumber == number) {
                        response.push(dependent)
                    }
                }
            })
            return result
        });

        return response

    },


    async list(page = 1, sortBy) {
        return await Dependent.paginate({}, {
            lean: true,
            leanWithId: true,
            sort: sortBy,
            page: page, limit: 10, populate: [{
                path: "responsible",
                select: "name , phoneNumber"
            }],
        }, function (err, result) {
            if (err)
                return { error: err }
            return result
        });
    },

    async delete(id) {

        let dependent = await Dependent.findOne({ _id: id })
        if (!dependent)
            return { error: "dependent not Found" }

        await Dependent.deleteOne({ _id: id })
        return true
    }

}