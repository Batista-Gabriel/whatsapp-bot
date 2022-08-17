const Log = require("../database/models/Log")


module.exports = {
    async create(input) {
        try {
            let logList = await Log.find({})
            if (logList.length > 0) {
                let newLog = new Date()
                let lastLog = logList[logList.length - 1].createdAt
                const minutes = parseInt(Math.abs(lastLog.getTime() - newLog.getTime()) / (1000 * 60) % 60);

                if (input.description == logList[logList.length - 1].description && minutes < 2)
                    return
            }
            const log = await Log.create(input)
            return log

        } catch (e) {
            if (e.message.includes("is required")) {
                required = e.message.split("`")[1]
                console.log(e.message)
                return { error: required + " is required." }
            }
            return { error: "log registration failed" }
        }
    },


    async find(id) {

        if (id.length != 24)
            return { error: "log not found" }

        let response = await Log.findOne({ _id: id }).lean()
            .populate("logType", "name description")
            .populate("user", "name email")
            .populate("course", "name code acronym")
            .populate("subject", "name code")
            .populate("courseGrid")
            .then((log) => {

                if (!log)
                    return { error: "log not found" }
                return log
            })
        return response

    },

    async findByType(type) {


        let response = await Log.find({}).lean()
            .populate('logType', "name")
            .then((logs) => {

                if (!logs)
                    return { error: "log not found" }

                let newLogs = []
                for (let log of logs) {
                    if (log.logType.name.toLowerCase() == type.toLowerCase()) {
                        newLogs.push(log)
                    }
                }
                return newLogs
            })
        return response

    },

    async list() {
        return await Log.find({})
            .populate("logType", "name description")
            .populate("user", "name email")
            .populate("course", "name code acronym")
            .populate("subject", "name code")
            .populate("courseGrid")
            .lean().then(logs => {
                var logMap = [];

                logs.forEach(function (log) {
                    logMap.push(log);
                });
                return logMap
            });
    },

    async delete(id = null) {
        if (id == null) {
            await Log.deleteMany({})
            return true
        }
        else
            if (id.length != 24)
                return { error: "log not found" }

        let log = await Log.findOne({ _id: id })
        if (!log)
            return { error: "log not Found" }

        await Log.deleteOne({ _id: id })

        return true
    },

    async deleteByType(type) {


        let logs = await Log.find({}).lean()
            .populate('logType', "name")
            .then((logs) => {

                if (!logs)
                    return { error: "log not found" }

                let newLogs = []
                for (let log of logs) {
                    if (log.logType.name.toLowerCase() == type.toLowerCase()) {
                        newLogs.push(log)
                    }
                }
                return newLogs
            })

        for (let log of logs) {

            await Log.deleteOne({ _id: log._id })
        }

        return true

    },

}
