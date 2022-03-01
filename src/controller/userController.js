const jwt = require("jsonwebtoken")
const { authMiddleware } = require('../middleware/auth')
const { isSameUser, isAdmin } = require("../utils/utils")
const userRepository = require("../repository/userRepository")
const bcrypt = require("bcryptjs")

function generateToken(params = {}, expiration) {
    return jwt.sign(params, process.env.SECRET, { expiresIn: expiration })
}

module.exports = {
    async create(req, res) {
        var data = req.body
        let response = await userRepository.create(data)
        if (response.error)
            return res.status(400).send(response)
        else
            return res.status(201).send({
                user: response,
                token: generateToken({ id: response._id, userType: response.userType.name }, "30d")
            })

    },

    async update(req, res) {

        try {
            const userId = req.params.id
            const { name, username, phoneNumber, password } = req.body
            let data = { name, username, phoneNumber, password }

            const isDataEmpty = Object.values(data).every(x => x === null || x === '');

            if (isDataEmpty)
                return res.status(400).send("Data not found")

            let response = await userRepository.update(userId, data)
            if (response.error)
                return res.status(404).send(response)
            else
                return res.send(response)


        } catch (e) {
            await createLog(e, "Error")
        }
    },

    //once user logs in, will receive an authentication token 
    async authenticate(req, res) {
        const { username, password } = req.body;
        let response = await authenticateUser(username, password)
        if (response.error)
            return res.status(400).send(response)
        else {
            let token = generateToken({ id: response._id, userType: response.userType.name }, "30d")
            return res.send({ user: response, token })
        }
    },


    async find(req, res) {
        let authorization = req.headers.authorization
        let auth = authMiddleware(authorization)
        if (auth.error)
            return res.status("401").send(auth)

        const { id } = req.params
        if (id == "no") {

            let response = await userRepository.find(auth.userId)
            if (response.error)
                return res.status(404).send(response)
            else
                return res.send(response)

        }
        if (isSameUser(id, auth.userId) || isAdmin(auth.userType)) {

            let response = await userRepository.find(id)
            if (response.error)
                return res.status(404).send(response)
            else
                return res.send(response)
        } else {

            return res.status(401).send("Unauthorized")
        }

    },

    async findByNumber(req, res) {
        let authorization = req.headers.authorization
        let { number } = req.params
        // let auth = authMiddleware(authorization)
        // if (auth.error)
        //     return res.status("401").send(auth)

        let response = await userRepository.findByNumber(number)
        if (response.error)
            return res.status(404).send(response)
        else
            return res.send(response)



    },
    async checkAuth(req, res) {

        let authorization = req.headers.authorization
        let auth = authMiddleware(authorization)
        let history
        let response = {}
        response.user = {}
        response.history = []
        if (auth.error)
            return res.status("401").send(auth)
        let user = await userRepository.find(auth.userId)
        if (user.error)
            return res.status(404).send(user)
        response.user.name = user.name
        response.user.email = user.email
        response.user.surname = user.surname
        response.user.enrollment = user.enrollment
        response.user.courseCode = user.courseGrid.course.code
        response.user.coursePeriod = user.courseGrid.creationPeriod
        response.user.id = user._id
        response.user.userType = user.userType.name
        return res.send(response)

    },

    async list(req, res) {

        const { page, limit } = req.query
        const { sortBy } = req.body

        res.send(await userRepository.list(page, sortBy, limit))

    },

    async delete(req, res) {

        let authorization = req.headers.authorization
        let auth = authMiddleware(authorization)
        let password = req.body.password
        let response

        if (!password)
            return res.status(400).send({ error: "Password is missing." })

        if (auth.error)
            return res.status("401").send(auth)

        const { id } = req.params

        if (isSameUser(id, auth.userId)) {

            let user = await userRepository.find(auth.userId)
            let userInfo = await authenticateUser(user.email, password)

            if (userInfo.error)
                return res.status(404).send(userInfo)
            else
                response = await userRepository.delete(id)

        } else if (isAdmin(auth.userType)) {

            response = await userRepository.delete(id)
        } else {

            return res.status(401).send("Unauthorized")
        }

        if (response.error)
            return res.status(400).send(response)
        else
            return res.send({ success: true })
    }


}


async function authenticateUser(username, password) {
    let response = await userRepository.findByUsername(username)
    if (response.error)
        return response
    else {
        if (!await bcrypt.compare(password, response.password))
            return { error: "invalid password" }
        response.password = undefined
        return response
    }
}