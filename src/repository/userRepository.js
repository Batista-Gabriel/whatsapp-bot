const User = require("../database/models/User")
const userTypeRepository = require("../repository/userTypeRepository")

module.exports = {
    async create(input) {
        try {
            delete input.createdAt
            delete input.lastEditedAt

            let userTypes = await userTypeRepository.list()
            input.userType = userTypes.find(userType => userType.name == "Default")

            let newUser = await User.create(input)
            let userId = newUser._id
            let user = await User.findOne({ _id: userId }).populate('userType')
            user.password = undefined
            user.createdAt = undefined
            user.lastLoggedAt = undefined

            return user

        } catch (e) {
            if (e.message.includes("is required")) {
                required = e.message.split("`")[1]
                return { error: required + " is required." }
            }
            console.log(e)
            return { error: "user registration failed" }
        }
    },

    async update(userId, input) {
        try {
            let foundUser = await User.find({ _id: userId })
            if (!foundUser)
                return { error: "user not Found" }


            for (info in input) {
                if (input[info] == null)
                    delete input[info]
            }
            await User.updateOne({ _id: userId }, input)

            return await User.findOne({ _id: userId }).populate('userType')

        } catch (e) {
            return { error: "Registration failed" }
        }
    },

    async find(id) {

        if (id.length != 24)
            return { error: "user not found" }

        let response = await User.findOne({ _id: id })
            .populate('userType')
            .lean().then((user) => {

                if (!user)
                    return { error: "user not found" }
                return user
            })
        return response

    },

    async findByNumber(number) {

        let response = await User.findOne({phoneNumber: number })
            .populate('userType')
            .lean().then((user) => {

                if (!user)
                    return { error: "user not found" }
                return user
            })
        return response

    },


    async list(page = 1, sortBy) {
        return await User.paginate({}, {
            sort:sortBy,
            page: page, limit: 10, populate: [ {
                path: "userType",
                select: "name"
            }],
        }, function (err, result) {
            if (err)
                return { error: err }
            // console.log(result)
            return result
        });
    },

    async delete(id) {

        let user = await User.findOne({ _id: id })
        if (!user)
            return { error: "user not Found" }

        await User.deleteOne({ _id: id })
        return true
    }

}