const { authMiddleware } = require('../middleware/auth')
const { isAdmin } = require("../utils/utils")
const dependentRepository = require("../repository/dependentRepository")

module.exports = {
    async create(req, res) {
        var data = req.body
        let response = await dependentRepository.create(data)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.status(201).send(response)

    },

    async update(req, res) {

        try {
            let authorization = req.headers.authorization
            let auth = authMiddleware(authorization)
            if (auth.error)
                return res.status("401").send(auth)
            const dependentId = req.params.id
            const { name, username, phoneNumber, isConfirmed, birthday, sex, observation } = req.body
            let data = { name, username, phoneNumber, isConfirmed, birthday, sex, observation }

            const isDataEmpty = Object.values(data).every(x => x === null || x === '');

            if (isDataEmpty)
                return res.status(400).send("Data not found")

            if (isAdmin(auth.userType)) {
                let response = await dependentRepository.update(dependentId, data)
                if (response.error)
                    return res.status(404).send(response)
                else
                    return res.send(response)

            } else {

                return res.status(401).send("Unauthorized")
            }

        } catch (e) {
            console.log(e)
        }
    },

    async find(req, res) {
        let authorization = req.headers.authorization
        let auth = authMiddleware(authorization)
        if (auth.error)
            return res.status("401").send(auth)

        const { id } = req.params
        if (isAdmin(auth.userType)) {

            let response = await dependentRepository.find(id)
            if (response.error)
                return res.status(404).send(response)
            else
                return res.send(response)
        } else {

            return res.status(401).send("Unauthorized")
        }

    },

    async findByNumber(req, res) {
        const { number } = req.params

            let response = await dependentRepository.findByNumber(number)
            if (response.error)
                return res.status(404).send(response)
            else
                return res.send(response)

    },

    async findByName(req, res) {
        const { name } = req.params

            let response = await dependentRepository.findByName(name)
            if (response.error)
                return res.status(404).send(response)
            else
                return res.send(response)

    },

    async findByUsername(req, res) {
        const { username } = req.params

            let response = await dependentRepository.findByUsername(username)
            if (response.error)
                return res.status(404).send(response)
            else
                return res.send(response)

    },
    async list(req, res) {

        const { page } = req.query
        const { sortBy } = req.body

        res.send(await dependentRepository.list(page, sortBy))

    },

    async delete(req, res) {

        let authorization = req.headers.authorization
        let auth = authMiddleware(authorization)
        let response

        if (auth.error)
            return res.status("401").send(auth)

        const { id } = req.params

        if (isAdmin(auth.userType)) {

            response = await dependentRepository.delete(id)
        } else {

            return res.status(401).send("Unauthorized")
        }

        if (response.error)
            return res.status(400).send(response)
        else
            return res.send({ success: true })
    }


}
