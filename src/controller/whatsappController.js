
const whatsapp = require("../whatsapp/index")

module.exports = {
    async addToGroup(req, res) {
        var { contacts, groupId } = req.body
        // if(!isAdmin(id))
        // return res.status(401).send("Unauthorized")

        if (!contacts || !groupId)
            return res.status(400).send("Contacts our group Id not found")
        else {
            let response = await whatsapp.addToGroup(groupId, contacts)

            if (response.error)
                return res.status("400").send(response)
            else
                return res.send(response)
        }
    },

    async sendMessage(req, res) {
        var { contacts, message, type } = req.body

        if (!contacts)
            return res.status(400).send("Contacts our group Id not found")
        else {
            let response = await whatsapp.sendMessage(message, contacts,type)

            if (response.error)
                return res.status("400").send(response)
            else
                return res.send(response)
        }
    },


}
