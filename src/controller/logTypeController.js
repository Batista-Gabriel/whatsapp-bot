const logTypeRepository = require("../repository/logTypeRepository")


module.exports = {
    async create(req, res) {

        var data = req.body
        //those 2 data types can't be send in the Course creation
        delete data.createdAt
        delete data.lastEditedAt

        let response = await logTypeRepository.create(data)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send(response)
    },

    async update(req, res) {

        const { name, description } = req.body
        let data = { name, description }

        const isDataEmpty = Object.values(data).every(x => x === null || x === '');

        if (isDataEmpty)
            return res.status(400).send("Data not found")
        const id = req.params.id

        let response = await logTypeRepository.update(id, data)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send(response)
    },

    async find(req, res) {

        const { id } = req.params

        let response = await logTypeRepository.find(id)
        if (response.error)
            return res.status(400).send(response)
        else {
            return res.send(response)
        }

    },

    async findByName(req, res) {

        const { name } = req.params
        let response = await logTypeRepository.findByName(name)
        if (response.error)
            return res.status(400).send(response)
        else {
            return res.send(response)
        }

    },

    async list(req, res) {
        let response = await logTypeRepository.list()

        for (let course of response) {
        }
        res.send(response)
    },

    async delete(req, res) {
        const { id } = req.params
        let response = await logTypeRepository.delete(id)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send({ success: true })
    }

}