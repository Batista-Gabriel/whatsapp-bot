const userTypeRepository = require("../repository/userTypeRepository")


module.exports = {
    async create(req, res) {

        var data = req.body
        //those 2 data types can't be send in the Course creation
        delete data.createdAt
        delete data.lastEditedAt

        let response = await userTypeRepository.create(data)
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

        let response = await userTypeRepository.update(id, data)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send(response)
    },

    async find(req, res) {

        const { id } = req.params

        let response = await userTypeRepository.find(id)
        if (response.error)
            return res.status(400).send(response)
        else {
            return res.send(response)
        }

    },

    async findByCode(req, res) {

        const { code } = req.params
        let response = await userTypeRepository.findByCode(code)
        if (response.error)
            return res.status(400).send(response)
        else {
            return res.send(response)
        }

    },

    async list(req, res) {
        let response = await userTypeRepository.list()

        for (let course of response) {
        }
        res.send(response)
    },

    async delete(req, res) {
        const { id } = req.params
        let response = await userTypeRepository.delete(id)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.send({ success: true })
    }

}