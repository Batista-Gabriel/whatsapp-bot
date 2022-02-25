
const UserType = require("../database/models/UserType")
const{createLog}= require("../utils/utils")

module.exports = {
    async create(input) {
        try {

            let userTypeList = await UserType.find({})

            let foundUserType = userTypeList.find(userType =>{
                return userType.name.toLowerCase() == input.name.toLowerCase()
            })
            if (foundUserType)
                return {error: "userType already exists"}

            const userType = await UserType.create(input)
            return userType

        } catch (e) {
            if (e.message.includes("is required")) {
                required = e.message.split("`")[1]
                console.log(e.message)
                return { error: required + " is required." }
            }
            await createLog(e,"Error")
            return { error: "userType registration failed" }
        }
    },

    async update(id, input) {
        try {
            let userType = await UserType.findOne({ _id: id })
            if (!userType)
                return { error: "userType not Found" }
            let userTypeList = await UserType.find({})
            let foundUserType = userTypeExists(userTypeList, input, userType._id)
            if (foundUserType)
                return foundUserType

            for (info in input) {
                if (input[info] == null)
                    delete input[info]
            }
            await UserType.updateOne({ _id: id }, input)

            let newUserType = await UserType.findOne({ _id: id })

            return newUserType

        } catch (e) {
            if (e.message.includes("userType validation failed"))
                return { error: "Constraint validation failed" }
                await createLog(e,"Error")
            return { error: "Registration failed" }
        }
    },

    async find(id) {

        if (id.length != 24)
            return { error: "userType not found" }

        let response = await UserType.findOne({ _id: id }).lean().then((userType) => {

            if (!userType)
                return { error: "userType not found" }
            return userType
        })
        return response

    },

    async list() {
        return await UserType.find({}).lean().then(userTypes => {
            var userTypeMap = [];

            userTypes.forEach(function (userType) {
                userTypeMap.push(userType);
            });
            return userTypeMap
        });
    },

    async delete(id) {
        
        let userType = await UserType.findOne({ _id: id })
        if (!userType)
            return { error: "UserType not Found" }

        await UserType.deleteOne({ _id: id })
        return true
    }

}

function userTypeExists(userTypeList, input, id = null) {
    const isSameUserType = (id1, id2) => { return id1 == id2 }
    let foundUserType
    if (input.name) {
        foundUserType = userTypeList.find(savedUserType => savedUserType.name.toLowerCase() == input.name.toLowerCase())

        if (foundUserType)
            if (!isSameUserType(foundUserType._id.toString(), (id ? id.toString() : null)))
                return { error: "name already in use." }
    }
    return false
}