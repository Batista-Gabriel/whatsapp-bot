const logRepository = require("../repository/logRepository")


module.exports = {
    async create(req, res) {

        var data = req.body
        //those 2 data types can't be send in the Course creation
        delete data.createdAt
        delete data.lastEditedAt

        let response = await logRepository.create(data)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send(response)
    },

    async update(req, res) {
        return res.status(405).send("method deactivated")
    },

    async find(req, res) {

        const { id } = req.params

        let response = await logRepository.find(id)
        if (response.error)
            return res.status(400).send(response)
        else {
            return res.send(response)
        }

    },

    async findByType(req, res) {

        const { type } = req.params
        let response = await logRepository.findByType(type)
        if (response.error)
            return res.status(400).send(response)
        else {
            return res.send(response)
        }

    },

    async list(req, res) {
        let response = await logRepository.list()

        for (let course of response) {
        }
        res.send(response)
    },

    async delete(req, res) {
        const { id } = req.params
        let response = await logRepository.delete(id)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send({ success: true })
    },
    
    async deleteByType(req, res) {
        const { type } = req.params
        let response = await logRepository.deleteByType(type)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send({ success: true })
    },
    
    async deleteAll(req, res) {
        let response = await logRepository.delete()
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send({ success: true })
    }

}