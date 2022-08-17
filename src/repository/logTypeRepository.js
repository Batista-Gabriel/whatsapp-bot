const LogType = require("../database/models/LogType")

module.exports = {
    async create(input) {
        try {

            let logTypeList = await LogType.find({})

            let foundLogType = logTypeList.find(logType =>{
                return logType.name.toLowerCase() == input.name.toLowerCase()
            })
            if (foundLogType)
                return {error: "logType already exists"}

            const logType = await LogType.create(input)
            return logType

        } catch (e) {
            if (e.message.includes("is required")) {
                required = e.message.split("`")[1]
                console.log(e.message)
                return { error: required + " is required." }
            }
            return { error: "logType registration failed" }
        }
    },

    async update(id, input) {
        try {
            let logType = await LogType.findOne({ _id: id })
            if (!logType)
                return { error: "logType not Found" }
            let logTypeList = await LogType.find({})
            let foundLogType = logTypeExists(logTypeList, input, logType._id)
            if (foundLogType)
                return foundLogType

            for (info in input) {
                if (input[info] == null)
                    delete input[info]
            }
            await LogType.updateOne({ _id: id }, input)

            let newLogType = await LogType.findOne({ _id: id })

            return newLogType

        } catch (e) {
            if (e.message.includes("logType validation failed"))
                return { error: "Constraint validation failed" }
            return { error: "Registration failed" }
        }
    },

    async find(id) {

        if (id.length != 24)
            return { error: "logType not found" }

        let response = await LogType.findOne({ _id: id }).lean().then((logType) => {

            if (!logType)
                return { error: "logType not found" }
            return logType
        })
        return response

    },

    async findByName(name) {


        let response = await LogType.findOne({ name: name }).lean()
            .then((log) => {

                if (!log)
                    return { error: "log not found" }
                return log
            })
        return response

    },

    async list() {
        return await LogType.find({}).lean().then(logTypes => {
            var logTypeMap = [];

            logTypes.forEach(function (logType) {
                logTypeMap.push(logType);
            });
            return logTypeMap
        });
    },

    async delete(id) {
        
        let logType = await LogType.findOne({ _id: id })
        if (!logType)
            return { error: "logType not Found" }

        await LogType.deleteOne({ _id: id })
        return true
    }

}

function logTypeExists(logTypeList, input, id = null) {
    const isSameLogType = (id1, id2) => { return id1 == id2 }
    let foundLogType
    if (input.name) {
        foundLogType = logTypeList.find(savedLogType => savedLogType.name.toLowerCase() == input.name.toLowerCase())
        if (foundLogType)
            if (!isSameLogType(foundLogType._id.toString(), (id ? id.toString() : null)))
                return { error: "name already in use." }
    }
    return false
}