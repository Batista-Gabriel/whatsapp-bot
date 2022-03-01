const fs = require('fs');
const { create } = require('venom-bot');
const responses = require("./responses")
const userRepository = require("../repository/userRepository")
const dependentRepository = require("../repository/dependentRepository")


const path = './src/whatsapp/tokens'
// definindo arquivo padrão para checagem de token
const sessionPath = `${path}/sessionTokens.json`
let wpClient

var sessionToken = readToken()
function initialize() {

    create(
        // nome da sessão
        "bot-acampa",
        // recuperando dados do qr code, se existir.
        (base64Qr) => {

            if (base64Qr) {
                console.log('User Disconnected')
                sessionToken = null
            }
        },

        (statusSession, sessionName) => {
            console.log('STATUS SESSION: ', statusSession)
            console.log('SESSION NAME: ', sessionName)
        },

        {
            multidevice: false,
            disableWelcome: true,
        },
        // parameter to create session
        sessionToken
    )

        .then(async (client) => {
            wpClient = client
            await listen(client)
            if (!sessionToken)
                saveToken(client)

        })
        .catch((erro) => {
            console.log(erro);
        });

}
async function listen(client) {
    client.onMessage(async (message) => {
        // await client.sendListMenu(message.from, 'Title', 'subTitle', 'Description', 'Lista de adolescentes', list)

        if (message.isGroupMsg === false) {

            // if it is text message
            if (message.body) {
                let number = message.from.split("@")[0]
                let user = await userRepository.findByNumber(number)

                let startQuestion = responses.initialTxt.find(question => { return question.tag == "start" })
                // if user not found
                if (user.error) {

                    let firstTimeQuestion = responses.initialTxt.find(question => { return question.tag == "firstTime" })

                    let name
                    for (let helper of firstTimeQuestion.helper) {
                        if (message.body.toLowerCase().includes(helper)) {
                            name = message.body.toLowerCase().split(helper)[1]
                            break
                        }
                    }
                    // ask user to say the username
                    if (!name) {
                        client.sendText(message.from, firstTimeQuestion.title)

                    }
                    //save new user
                    else {
                        let newUser = await userRepository.create({ name: name, phoneNumber: number })

                        let title = startQuestion.title.replace("{username}", newUser.name.split(" ")[0].trim())

                        client.sendButtons(message.from, title, startQuestion.buttons, startQuestion.description)

                    }

                }
                // if user found
                else {
                    let dependentList = await dependentRepository.findByNumber(number)


                    // if it is a command
                    if (message.body.includes("\\") || message.body.includes("/")) {
                        let commands = responses.commands

                        // if user does not  have mod power
                        if (!isMod(user)) {
                            await wpClient.sendText(message.from, commands.error)

                        }

                        else {

                            // get witch command was set
                            for (let command of commands.list) {
                                if (message.body.includes(command.helper)) {
                                    // the info after command
                                    let info = message.body.split(command.helper)[1].trim()

                                    // if it does not have info , send description about this command
                                    if (info.length <= 2) {
                                        await wpClient.sendText(message.from, command.helper + " - " + command.description)

                                        // if it has info
                                    } else {
                                        // commands for moderator
                                        {
                                            if (command.tag == "confirm") {
                                                await setConfirmation(message.from, info, true)
                                            } else if (command.tag == "deny") {
                                                await setConfirmation(message.from, info, false)

                                            }
                                            else if (command.tag == "search") {
                                                let username = info
                                                let dependent = await dependentRepository.findByUsername(username)

                                                if (dependent.error) {
                                                    let title = command.error.replace("{username}", username)
                                                    await wpClient.sendText(message.from, title)
                                                } else {
                                                    let title = command.title
                                                        .replace("{username}", username)
                                                        .replace("{name}", dependent.name)
                                                        .replace("{sex}", dependent.sex)
                                                        .replace("{birthday}", dependent.birthday)
                                                        .replace("{observation}", dependent.observation)
                                                        .replace("{isConfirmed}", dependent.isConfirmed ? "Sim" : "Não")
                                                        .replace("{responsible}", dependent.responsible.name)
                                                        .replace("{phoneNumber}", dependent.responsible.phoneNumber)

                                                    await wpClient.sendText(message.from, title)
                                                }
                                            }
                                        }

                                        // commands for administrator
                                        if (isAdmin(user)) {
                                            if (command.tag == "send") {
                                                let contacts = await userRepository.list()
                                                await sendMessage(message.body.split(command.helper)[1].trim(), contacts)
                                            }
                                            else if (command.tag == "turnAdmin") {
                                                await setUserType(message.from, info, "Administrator")
                                            }
                                            else if (command.tag == "turnMod") {
                                                await setUserType(message.from, info, "Moderator")
                                            } else if (command.tag == "removeAdmin" || command.tag == "removeMod") {
                                                await setUserType(message.from, info, "Default")
                                            }
                                        }
                                    }

                                    return
                                }
                            }

                            // if there is not a recognized command
                            // List all the commands
                            let text = commands.title + "\n"
                            for (let command of commands.list) {
                                if ((isAdmin(user) && command.type == "Administrator") || isMod(user) && command.type == "Moderator")
                                    text += command.helper + " - " + command.description + "\n\n"
                            }
                            await wpClient.sendText(message.from, text)
                            return


                        }
                    }

                    // registration process
                    if (dependentList.length > 0) {

                        let lastDependent = dependentList[dependentList.length - 1]
                        let dependentName = lastDependent.name.trim().split(" ")[0]
                        // canceling the registration

                        let cancelQuestion = responses.registrationTxt.find(question => { return question.tag == "cancel" })
                        // cancel tag
                        if (!lastDependent.birthday || !lastDependent.sex || !lastDependent.observation || !lastDependent.church) {


                            for (let question of cancelQuestion.question) {
                                if (message.body.toLowerCase().trim().includes(question)) {
                                    await dependentRepository.delete(lastDependent._id)
                                    let title = cancelQuestion.title.replace("{dependent}", dependentName)
                                    client.sendText(message.from, title)
                                    return
                                }
                            }

                            // registration tag
                            //if birthday is not saved
                            if (!lastDependent.birthday) {
                                let birthdayQuestion = responses.registrationTxt.find(question => { return question.tag == "birthday" })

                                let birthday = getHelperInfo(message, birthdayQuestion.helper)

                                if (!birthday) {
                                    let title = birthdayQuestion.title.replace("{dependent}", dependentName)
                                    client.sendText(message.from, title)
                                } else {
                                    await dependentRepository.update(lastDependent._id, { birthday })

                                    let sexQuestion = responses.registrationTxt.find(question => { return question.tag == "sex" })
                                    let title = sexQuestion.title.replace("{dependent}", dependentName)

                                    client.sendButtons(message.from, title, sexQuestion.buttons, sexQuestion.description)

                                }

                                return
                            }

                            // if sex is not saved
                            else if (!lastDependent.sex) {

                                let sexQuestion = responses.registrationTxt.find(question => { return question.tag == "sex" })

                                let sex = getHelperInfo(message, sexQuestion.helper, 0)
                                if (!sex) {
                                    let title = sexQuestion.title.replace("{dependent}", dependentName)

                                    client.sendButtons(message.from, title, sexQuestion.buttons, sexQuestion.description)

                                } else {
                                    await dependentRepository.update(lastDependent._id, { sex })

                                    let churchQuestion = responses.registrationTxt.find(question => { return question.tag == "church" })
                                    let title = churchQuestion.title.replace("{dependent}", dependentName)

                                    client.sendText(message.from, title)

                                }

                                return
                            }

                            // if church is not saved
                            else if (!lastDependent.church) {

                                let churchQuestion = responses.registrationTxt.find(question => { return question.tag == "church" })

                                let church = getHelperInfo(message, churchQuestion.helper)
                                if (!church) {
                                    let title = churchQuestion.title.replace("{dependent}", dependentName)

                                    client.sendText(message.from, title)

                                } else {
                                    await dependentRepository.update(lastDependent._id, { church })

                                    let observationQuestion = responses.registrationTxt.find(question => { return question.tag == "observation" })
                                    let title = observationQuestion.title.replace("{dependent}", dependentName)

                                    client.sendText(message.from, title)

                                }
                                return

                            }

                            // if observation is not saved
                            else if (!lastDependent.observation) {

                                let observationQuestion = responses.registrationTxt.find(question => { return question.tag == "observation" })
                                observationQuestion.title = observationQuestion.title.replace("{dependent}", dependentName)

                                let observation = getHelperInfo(message, observationQuestion.helper)

                                if (!observation) {
                                    let title = observationQuestion.title.replace("{dependent}", dependentName)

                                    client.sendText(message.from, title)

                                } else {
                                    await dependentRepository.update(lastDependent._id, { observation })
                                    let endQuestion = responses.registrationTxt.find(question => { return question.tag == "end" })
                                    let title = endQuestion.title.replace("{dependent}", dependentName)
                                    title = title.replace("{username}", lastDependent.username)

                                    client.sendText(message.from, title)

                                }
                                return

                            }
                        }
                    }

                    //if user is trying to register a dependent
                    {
                        let registrationQuestion = responses.registrationTxt.find(question => { return question.tag == "registration" })

                        for (let question of registrationQuestion.question) {
                            if (message.body.toLowerCase().trim() == question) {
                                client.sendButtons(message.from, registrationQuestion.title, registrationQuestion.buttons, registrationQuestion.description)
                                return
                            }
                        }
                    }

                    // if user is not the responsible
                    {
                        let responsibleErrorQuestion = responses.registrationTxt.find(question => { return question.tag == "responsibleError" })

                        for (let question of responsibleErrorQuestion.question) {
                            if (message.body.toLowerCase().trim() == question) {
                                return
                            }
                        }
                    }

                    // save dependent name
                    {
                        let nameQuestion = responses.registrationTxt.find(question => { return question.tag == "name" })
                        let name = null

                        for (let question of nameQuestion.question) {
                            if (message.body.toLowerCase().trim() == question) {
                                client.sendText(message.from, nameQuestion.title)
                                return
                            }


                            for (let helper of nameQuestion.helper) {
                                if (message.body.toLowerCase().includes(helper)) {
                                    name = message.body.toLowerCase().trim().split(helper)[1]
                                    if (name) {

                                        let newDependent = await dependentRepository.create({ name, responsible: user._id })
                                        let birthdayQuestion = responses.registrationTxt.find(question => { return question.tag == "birthday" })
                                        let title = birthdayQuestion.title.replace("{dependent}", newDependent.name.split(" ")[0])

                                        client.sendText(message.from, title)

                                    }
                                    return
                                }

                            }
                        }
                    }

                    //if it is general questions
                    {
                        for (let response of responses.generalTxt) {
                            for (let question of response.question) {

                                if (message.body.toLowerCase().includes(question)) {
                                    if (response.buttons) {
                                        client.sendButtons(message.from, response.title, response.buttons, response.description)
                                    } else {
                                        client.sendText(message.from, response.title)
                                    }

                                    return
                                }
                            }
                        }
                    }

                    //if user has a different question
                    {
                        let anotherQuestion = responses.anotherTxt.find(question => { return question.tag == "question" })

                        for (let question of anotherQuestion.question) {
                            if (message.body.toLowerCase().trim() == question) {
                                client.sendText(message.from, anotherQuestion.title)
                                return
                            }

                        }
                    }

                    //after user sent a new question
                    {

                        let saveQuestion = responses.anotherTxt.find(question => { return question.tag == "save" })

                        let question = getHelperInfo(message, saveQuestion.helper)

                        if (question) {
                            client.sendText(message.from, saveQuestion.title)
                            return
                        }

                    }

                    //after user sent a new question
                    {

                        let registrationQuestion = responses.registrationTxt.find(question => { return question.tag == "getRegistration" })

                        for (let question of registrationQuestion.question) {

                            if (message.body.toLowerCase().trim() == question) {

                                if (dependentList.length < 1) {
                                    client.sendText(message.from, registrationQuestion.noDependent)
                                } else {
                                    let dependentInfo = ""
                                    for (dependent of dependentList) {
                                        let info = registrationQuestion.dependentInfo.replace("{username}", dependent.username)
                                        info = info.replace("{name}", dependent.name)
                                        info = info.replace("{isConfirmed}", dependent.isConfirmed ? "*Pagamento confirmado*" : "*Pagamento pendente*")
                                        dependentInfo += info
                                    }
                                    let text = registrationQuestion.title + dependentInfo + registrationQuestion.paymentInfo
                                    client.sendText(message.from, text)
                                }
                                return
                            }
                        }

                    }

                    //if it is asking the location
                    {

                        let churchLocation = responses.locationTxt.find(question => { return question.tag == "church" })

                        for (let question of churchLocation.question) {

                            if (message.body.toLowerCase().trim().includes(question)) {
                                client.sendText(message.from, churchLocation.title)
                                client.sendLocation(message.from, churchLocation.x, churchLocation.y, churchLocation.name)
                                return
                            }
                        }
                    }

                    //if it is not a listed question, it will send welcome message
                    {

                        let title = await startQuestion.title.replace("{username}", user.name.split(" ")[0].trim())

                        client.sendButtons(message.from, title, startQuestion.buttons, startQuestion.description)
                        return
                    }

                }
            }

            // if it is not textMessage
            else {

                let notTxt = responses.errorTxt.find(question => { return question.tag == "notTxt" })

                client.sendText(message.from, notTxt.title)
            }
        }
        // if it is a message from a group
        else {
            console.log(message)
        }
    });
}

async function sendMessage(message, contacts, type = "text") {

    let error = null
    if (!wpClient) {
        return { error: "Whatsapp client not initialized yet" }
    }


    for (let contact of contacts) {
        let message2 = message.replace("{username}", contact.name.split(" ")[0])
        if (type == "text")
            await wpClient.sendText(contact.phoneNumber + "@c.us", message2).catch(e => error = e)
    }

    if (error)
        return { error }

    else return { success: true }
}

async function addToGroup(groupId, contacts) {

    // testGroupId
    // 120363024915489451@g.us
    if (!wpClient) {
        return { error: "Whatsapp client not initialized yet" }
    }


    let error = null
    for (let contact of contacts) {
        await wpClient.addParticipant(groupId, contact.phoneNumber + "@c.us").catch(e => error = e)
    }
    if (error)
        return { error }

    else return { success: true }


}

async function setConfirmation(sender, dependentCode, isConfirmed) {
    let dependent = await dependentRepository.findByUsername(dependentCode)

    if (dependent.error) {
        return wpClient.sendText(sender, "Adolescente {" + dependentCode + "} não encontrado")
    }

    let dependent2 = await dependentRepository.update(dependent._id, { isConfirmed })

    if (dependent2) {
        let confirmation = dependent2.isConfirmed ? "confirmado" : "desconfirmado"
        let text = `*Cadastro confirmado* \n
        O cadastro de ` + dependent2.name + ` ( ` + dependent2.username + ` ) foi ` + confirmation

        wpClient.sendText(sender, text)

        if (dependent.responsible && dependent.isConfirmed != dependent2.isConfirmed) {
            wpClient.sendText(dependent.responsible.phoneNumber + "@c.us", text)
        }
    }
}

async function setUserType(sender, number, userType) {

    let user = await userRepository.findByNumber(number)
    let admin = await userRepository.findByNumber(sender.replace("@c.us", ""))

    if (user.error) {
        return wpClient.sendText(sender, "Usuário (" + number + ") não encontrado.")
    }

    let user2 = await userRepository.updateUserType(user._id, userType)
    if (!user2.error) {
        let userType, userType1

        if (user.userType.name.toLowerCase() == "default") userType1 = "Padrão"
        if (user.userType.name.toLowerCase() == "administrator") userType1 = "Administrador"
        if (user.userType.name.toLowerCase() == "moderator") userType1 = "Moderador"

        if (user2.userType.name.toLowerCase() == "default") userType = "Padrão"
        if (user2.userType.name.toLowerCase() == "administrator") userType = "Administrador"
        if (user2.userType.name.toLowerCase() == "moderator") userType = "Moderador"
        if (user.userType.name != user2.userType.name) {
            let userText = `         *Tipo de usuário alterado* \n
        O seu tipo de usuário foi alterado de ` + userType1 + ` para ` + userType + ` por `+ admin.name.split(" ")[0] + " " + admin.name.split(" ")[1]

            let adminText = `         *Tipo de usuário alterado* \n
        O tipo de usuário de `+ user2.name + ` (` + user.phoneNumber + `) foi alterado de ` + userType1 + ` para ` + userType

            wpClient.sendText(user.phoneNumber + "@c.us", userText)
            wpClient.sendText(sender, adminText)
            return
        }
        else {
            wpClient.sendText(sender, "Tipo de usuário não alterado.")
        }
    }
}

async function saveToken(client) {
    if (!fs.existsSync(path)) await fs.mkdirSync(path)
    // recuperando o token da sessão do navegador
    const browserSessionToken = await client.getSessionTokenBrowser()
    /**
     * verificando se a sessão existe;
     * se não existir a variável browserSessionToken será escrita na pasta
     */
    fs.writeFile(sessionPath, JSON.stringify(browserSessionToken), function (err) {
        if (err) throw err;
    })
}


function readToken() {
    try {
        return JSON.parse(fs.readFileSync(sessionPath, 'utf-8'))
    } catch (error) {
        console.log({
            status: 404,
            message: 'o arquivo token não existe.',
        })
        return null
    }
}

function getHelperInfo(message, qHelper, position = 1) {
    let response = null
    for (let helper of qHelper) {
        if (message.body.toLowerCase().includes(helper)) {
            if (position == 0)
                response = helper

            else
                response = message.body.toLowerCase().split(helper)[position]

            break
        }
    }
    return response
}

function isMod(user) {
    return isAdmin(user) || user.userType.name == "Mod" || user.userType.name == "Moderator"
}

function isAdmin(user) {
    return user.userType.name == "Administrator" || user.userType.name == "Admin"
}
module.exports = {
    initialize, sendMessage, addToGroup
}

// Beta mode doesnt alow buttons
// create({
//     session: 'acampa', //name of session
//     multidevice: true, // for version not multidevice use false.(default: true)
//     folderNameToken: 'tokens', //folder name when saving tokens
//     mkdirFolderToken: './src/whatsapp', //folder name when saving tokens
//     createPathFileToken: true
// },
// )