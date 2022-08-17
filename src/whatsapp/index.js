const fs = require('fs');
const { create } = require('venom-bot');
const responses = require("./responses")
const userRepository = require("../repository/userRepository")
const dependentRepository = require("../repository/dependentRepository")
const dialogFlow = require("../controller/dialogFlowController")
const { getAge, capitalizeName } = require("../utils/utils")
const { minAge, maxAge, acampaDay } = require("../utils/consts")

const path = './src/whatsapp/tokens'
// definindo arquivo padrão para checagem de token
const sessionPath = `${path}/sessionTokens.json`
let wpClient

var sessionToken = readToken()

create({
    session: 'bot-acampa', //name of session
    multidevice: true, // for version not multidevice use false.(default: true)
    folderNameToken: 'tokens', //folder name when saving tokens
    mkdirFolderToken: './src/whatsapp', //folder name when saving tokens
    createPathFileToken: true
},
)

    .then(async (client) => {
        wpClient = client
        await listen()
        if (!sessionToken)
            saveToken(client)

    })
    .catch((erro) => {
        console.log(erro);
    });


async function listen() {
    wpClient.onMessage(async (message) => {

        if (message.isGroupMsg === false) {
            // if it is text message
            if (message.body) {
                let number = message.from.split("@")[0]
                let user = await userRepository.findByNumber(number)
                // if user not found
                if (user.error) {
                    await userRepository.create({ phoneNumber: number })
                    user = await userRepository.findByNumber(number)
                }
                // if its not talking with a person
                 {
                    // if it is a command (use validation to see if that user is talking with a human)
                    if (message.body.includes("\\") || message.body == "comandos") {
                        let commands = responses.commands

                        await userRepository.update(user._id, { errorCount: 0 })
                        // if user does not  have mod power
                        if (!isMod(user)) {
                            await wpClient.sendText(message.from, commands.error)

                        }

                        else {

                            // get witch command was set
                            for (let command of commands.list) {
                                if (message.body.toLowerCase().includes(command.helper.toLowerCase())) {
                                    // the info after command
                                    let info = message.body.toLowerCase().split(command.helper.toLowerCase())[1].trim()

                                    // if it does not have info , send description about this command
                                    if (info.length <= 2 && !command.helper.includes("listar")) {
                                        await wpClient.sendText(message.from, command.helper + " - " + command.description)
                                        return
                                        // if it has info
                                    }
                                    else {
                                        // commands for moderator
                                        {
                                            if (command.tag == "confirm") {
                                                await setConfirmation(message.from, info, true)
                                            }
                                            else if (command.tag == "deny") {
                                                await setConfirmation(message.from, info, false)

                                            }
                                            else if (command.tag == "contact") {
                                                let username = info
                                                let dependent = await dependentRepository.findByUsername(username)
                                                if (dependent.error) {
                                                    let response = command.error.replace("{username}", username)
                                                    await wpClient.sendText(message.from, response)
                                                    return
                                                }
                                                else if (!dependent.responsible) {
                                                    let response = command.contactError.replace("{username}", username).replace("{name}", dependent.name)
                                                    await wpClient.sendText(message.from, response)
                                                    return
                                                } else {
                                                    let response = command.response.replace("{username}", username).replace("{name}", dependent.name)
                                                    await wpClient.sendText(message.from, response)
                                                    await wpClient.sendContactVcard(message.from, dependent.responsible.phoneNumber + "@c.us", dependent.responsible.name).catch(e => console.log(e))
                                                    return
                                                }

                                            }

                                            else if (command.tag == "search") {
                                                let username = info
                                                let dependent = await dependentRepository.findByUsername(username)

                                                if (dependent.error) {
                                                    let response = command.error.replace("{username}", username)
                                                    await wpClient.sendText(message.from, response)
                                                } else {
                                                    let response = command.response
                                                        .replace("{username}", username)
                                                        .replace("{name}", dependent.name)
                                                        .replace("{sex}", dependent.sex)
                                                        .replace("{birthday}", dependent.birthday)
                                                        .replace("{observation}", dependent.observation)
                                                        .replace("{isConfirmed}", dependent.isConfirmed ? "Sim" : "Não")
                                                        .replace("{responsible}", dependent.responsible.name)
                                                        .replace("{phoneNumber}", dependent.responsible.phoneNumber)

                                                    await wpClient.sendText(message.from, response)
                                                }
                                            }
                                            else if (command.tag == "searchByName") {
                                                let name = info
                                                let dependents = await dependentRepository.findByName(name)

                                                if (dependents.length < 1) {
                                                    let response = command.error.replace("{name}", name)
                                                    await wpClient.sendText(message.from, response)
                                                }
                                                else {
                                                    let text = command.response
                                                    for (let i in dependents) {
                                                        let dependent = dependents[i]
                                                        let birthday = "erro"
                                                        if (dependent.birthday) {
                                                            let [year, month, day] = dependent.birthday.split("/")
                                                            birthday = day + "/" + month + "/" + year
                                                        }
                                                        text += command.dependent
                                                            .replace("{name}", dependent.name)
                                                            .replace("{number}", Number(i) + 1)
                                                            .replace("{birthday}", birthday)
                                                            .replace("{username}", dependent.username)

                                                    }
                                                    await wpClient.sendText(message.from, text)
                                                }
                                            }
                                        }

                                        // commands for monitors
                                        if (isMonitor(user) && (command.type == "Monitor" || command.type == "Administrator")) {

                                            if (command.tag == "checkIn") {
                                                await setCheckIn(message.from, info, true)
                                            }
                                            else if (command.tag == "rmvCheckIn") {
                                                await setCheckIn(message.from, info, false)
                                            }
                                        }

                                        // commands for administrator
                                        if (isAdmin(user) && command.type == "Administrator") {
                                            if (command.tag == "send") {
                                                let contacts = await userRepository.list()
                                                await sendMessage(message.body.split(command.helper)[1].trim(), contacts)
                                            }
                                            else if (command.tag == "turnAdmin") {
                                                await setUserType(message.from, info, "Administrator")
                                            }
                                            else if (command.tag == "turnMod") {
                                                await setUserType(message.from, info, "Moderator")
                                            }
                                            else if (command.tag == "turnMonitor") {
                                                await setUserType(message.from, info, "Monitor")
                                            }
                                            else if (command.tag == "removeAdmin" || command.tag == "removeMod" || command.tag == "removeMonitor") {
                                                await setUserType(message.from, info, "Default")
                                            }
                                            else if (command.tag == "getAdmin") {
                                                await getByUserType(message.from, "admin")
                                            }
                                            else if (command.tag == "getMonitor") {
                                                await getByUserType(message.from, "monitor")
                                            }
                                            else if (command.tag == "getMod") {
                                                await getByUserType(message.from, "mod")
                                            }
                                        }
                                    }

                                    return
                                }
                            }

                            // if there is not a recognized command
                            // List all the commands
                            let text = commands.response + "\n"
                            for (let command of commands.list) {
                                if ((isAdmin(user) && command.type == "Administrator") || isMod(user) && command.type == "Moderator" || isMonitor(user) && command.type == "Monitor")
                                    text += command.helper + " - " + command.description + "\n\n"
                            }
                            await wpClient.sendText(message.from, text)
                            return

                        }
                    }

                    let dialog = await dialogFlow.detectIntent("pt-br", message.body, number)
                    let intent = dialog.intent.toLowerCase()

                    // if it is from intent
                    {
                        if (intent == "savename" && !user.name) {
                            let name = capitalizeName(dialog.data.name)
                            let resp = await userRepository.update(user._id, { name })
                            console.log(resp)
                            let text = dialog.data.response.replace("{name}", name.split(" ")[0])
                            wpClient.sendText(message.from, text)
                            return
                        }

                        // if that is a question
                        if (intent.includes("question")) {
                            wpClient.sendText(message.from, dialog.text)

                            await userRepository.update(user._id, { errorCount: 0 })
                            if (intent.includes("location")) {

                                let churchLocation = responses.locationTxt.find(question => { return question.tag == "church" })

                                setTimeout(function () {
                                    wpClient.sendLocation(message.from, churchLocation.x, churchLocation.y, churchLocation.name)
                                }, 1500);
                            }

                            return
                        }
                        // if it is starting a registration
                        else if (intent.includes("registrationinit")) {

                            await userRepository.update(user._id, { errorCount: 0 })
                            let registrationQuestion = responses.registrationTxt.find(question => { return question.tag == "registrationInit" })

                            wpClient.sendText(message.from, registrationQuestion.response)
                            // wpClient.sendButtons(message.from, registrationQuestion.response, registrationQuestion.buttons, registrationQuestion.description)
                            await userRepository.update(user._id, { lastInteraction: "regInit" })
                            return
                        }

                        // if it is in the middle of a registration
                        if (user.lastInteraction.includes("reg")) {
                            await userRepository.update(user._id, { errorCount: 0 })

                            let dependentList = await dependentRepository.findByNumber(number)
                            let lastDependent = dependentList[dependentList.length - 1]

                            let errorMessage = responses.errorTxt.find(question => { return question.tag == "notUnderstood" })


                            // if user wants to cancel the process
                            if (intent.includes("cancel")) {

                                let cancelQuestion = responses.registrationTxt.find(question => { return question.tag == "cancelRegistration" })
                                await userRepository.update(user._id, { lastInteraction: "" })

                                wpClient.sendText(message.from, cancelQuestion.response)
                                await dependentRepository.delete(lastDependent._id)
                                return
                            }

                            if (user.lastInteraction == "regInit") {

                                // if this user is not the responsible
                                if (intent.includes("no")) {

                                    let responsibleQuestion = responses.registrationTxt.find(question => { return question.tag == "notResponsible" })
                                    await userRepository.update(user._id, { lastInteraction: "" })

                                    wpClient.sendText(message.from, responsibleQuestion.response)
                                    return
                                }

                                // if this user is the responsible
                                if (intent.includes("yes")) {

                                    if (!user.name) {
                                        let usernameQuestion = responses.registrationTxt.find(question => { return question.tag == "userName" })

                                        wpClient.sendText(message.from, usernameQuestion.response)
                                        return
                                    }

                                    // ask about sex
                                    let sexQuestion = responses.registrationTxt.find(question => { return question.tag == "sex" })

                                    wpClient.sendText(message.from, sexQuestion.response)
                                    // wpClient.sendButtons(message.from, sexQuestion.response, sexQuestion.buttons, sexQuestion.description)

                                    return
                                }

                                // save userName
                                else if (!user.name && intent.includes("getname")) {
                                    let name = dialog.data.name
                                    await userRepository.update(user._id, { name, responsible: user._id })

                                    // ask about sex
                                    wpClient.sendText(message.from, sexQuestion.response)
                                    // wpClient.sendButtons(message.from, sexQuestion.response, sexQuestion.buttons, sexQuestion.description)

                                    return
                                }


                                //save sex and ask for birthday
                                if (intent.includes("getsex")) {
                                    let sex = dialog.data.sex
                                    await dependentRepository.create({ responsible: user._id, sex })

                                    let birthdayQuestion = responses.registrationTxt.find(question => { return question.tag == "birthday" })
                                    let resp1, resp2
                                    if (sex == "masculino") {
                                        resp1 = birthdayQuestion.response[0].replace("{article}", "um").replace("{sex}", "menino")
                                        resp2 = birthdayQuestion.response[1].replace("{article}", "dele")
                                    }
                                    else if (sex == "feminino") {
                                        resp1 = birthdayQuestion.response[0].replace("{article}", "uma").replace("{sex}", "menina")
                                        resp2 = birthdayQuestion.response[1].replace("{article}", "dela")
                                    }
                                    wpClient.sendText(message.from, resp1)
                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp2)
                                    }, 1500);
                                    // change the last interaction
                                    await userRepository.update(user._id, { lastInteraction: "regGetSex" })
                                    return
                                }

                                // if intent is not sex
                                else {
                                    let sexQuestion = responses.registrationTxt.find(question => { return question.tag == "sex" })
                                    wpClient.sendText(message.from, errorMessage.response)

                                    setTimeout(function () {
                                        wpClient.sendText(message.from, sexQuestion.response)
                                        // wpClient.sendButtons(message.from, sexQuestion.response, sexQuestion.buttons, sexQuestion.description)
                                    }, 1500);
                                    return

                                }
                            }

                            // save dependent birthday and ask for name
                            else if (user.lastInteraction == "regGetSex") {

                                let sex = lastDependent.sex.toLowerCase()

                                //save birthday and ask for name
                                if (intent.includes("getbirthday")) {
                                    let birthday = dialog.data.birthday.replace("-", "/").replace("-", "/")

                                    let nameQuestion = responses.registrationTxt.find(question => { return question.tag == "name" })
                                    let age = getAge(birthday, acampaDay)
                                    // if it is an invalid age
                                    if (age < minAge || age > maxAge) {

                                        let resp = nameQuestion.negativeResponse.replace("{age}", age)
                                        wpClient.sendText(message.from, resp)
                                        await dependentRepository.delete(lastDependent._id)
                                        await userRepository.update(user._id, { lastInteraction: "" })
                                        return

                                    }
                                    await dependentRepository.update(lastDependent.id, { birthday })

                                    let resp1, resp2
                                    if (sex == "masculino") {
                                        resp1 = nameQuestion.response[0].replace("{article}", "Ele").replace("{age}", age)
                                        resp2 = nameQuestion.response[1].replace("{article}", "dele")
                                    }
                                    else if (sex == "feminino") {
                                        resp1 = nameQuestion.response[0].replace("{article}", "Ela").replace("{age}", age)
                                        resp2 = nameQuestion.response[1].replace("{article}", "dela")
                                    }
                                    wpClient.sendText(message.from, resp1)
                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp2)
                                    }, 1500);
                                    // change the last interaction
                                    await userRepository.update(user._id, { lastInteraction: "regGetBirthday" })
                                    return
                                }
                                // if birthday not found, asks again
                                else {
                                    let birthdayQuestion = responses.registrationTxt.find(question => { return question.tag == "birthday" })
                                    wpClient.sendText(message.from, errorMessage.response)

                                    let resp1
                                    if (sex == "masculino") {
                                        resp1 = birthdayQuestion.response[1].replace("{article}", "dele")
                                    }
                                    else if (sex == "feminino") {
                                        resp1 = birthdayQuestion.response[1].replace("{article}", "dela")
                                    }

                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp1)
                                    }, 1500);
                                    return

                                }
                            }

                            //save name and ask for church
                            else if (user.lastInteraction == "regGetBirthday") {

                                let sex = lastDependent.sex.toLowerCase()
                                if (intent.includes("getname")) {
                                    let name = dialog.data.name
                                    let dependent = await dependentRepository.update(lastDependent.id, { name })

                                    let churchQuestion = responses.registrationTxt.find(question => { return question.tag == "church" })
                                    let resp1, resp2
                                    if (sex == "masculino") {
                                        resp1 = churchQuestion.response[0].replace("{article}", "o").replace("{name}", dependent.name.split(" ")[0])
                                        resp2 = churchQuestion.response[1].replace("{article}", "Ele")
                                    }
                                    else if (sex == "feminino") {
                                        resp1 = churchQuestion.response[0].replace("{article}", "a").replace("{name}", dependent.name.split(" ")[0])
                                        resp2 = churchQuestion.response[1].replace("{article}", "Ela")
                                    }
                                    wpClient.sendText(message.from, resp1)
                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp2)
                                    }, 1500);
                                    // change the last interaction
                                    await userRepository.update(user._id, { lastInteraction: "regGetName" })
                                    return
                                }
                                else {
                                    let nameQuestion = responses.registrationTxt.find(question => { return question.tag == "name" })
                                    wpClient.sendText(message.from, errorMessage.response)

                                    let resp1
                                    if (sex == "masculino") {
                                        resp1 = nameQuestion.response[1].replace("{article}", "dele")
                                    }
                                    else if (sex == "feminino") {
                                        resp1 = nameQuestion.response[1].replace("{article}", "dela")
                                    }

                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp1)
                                    }, 1500);
                                    return

                                }
                            }

                            //save church and ask for observation
                            else if (user.lastInteraction == "regGetName") {

                                let sex = lastDependent.sex.toLowerCase()
                                let observationQuestion = responses.registrationTxt.find(question => { return question.tag == "observation" })

                                // if there is church
                                if (intent.includes("getname")) {
                                    let church = dialog.data.name
                                    await dependentRepository.update(lastDependent.id, { church })

                                    let resp1 = observationQuestion.response[0]
                                    let resp2
                                    if (sex == "masculino") {
                                        resp2 = observationQuestion.response[1].replace("{article}", "Ele")
                                    }
                                    else if (sex == "feminino") {
                                        resp2 = observationQuestion.response[1].replace("{article}", "Ela")
                                    }
                                    wpClient.sendText(message.from, resp1)
                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp2)
                                    }, 1500);
                                    // change the last interaction
                                    await userRepository.update(user._id, { lastInteraction: "regGetChurch" })
                                    return
                                }
                                // if no church
                                else if (intent.includes("no")) {
                                    await dependentRepository.update(lastDependent.id, { church: "nenhuma" })

                                    let resp1, resp2
                                    if (sex == "masculino") {
                                        resp1 = observationQuestion.negativeResponse[0].replace("{article}", "ele")
                                        resp2 = observationQuestion.negativeResponse[1].replace("{article}", "Ele")
                                    }
                                    else if (sex == "feminino") {
                                        resp1 = observationQuestion.negativeResponse[0].replace("{article}", "ele")
                                        resp2 = observationQuestion.negativeResponse[1].replace("{article}", "Ela")
                                    }
                                    wpClient.sendText(message.from, resp1)
                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp2)
                                    }, 1500);
                                    // change the last interaction
                                    await userRepository.update(user._id, { lastInteraction: "regGetChurch" })
                                    return
                                }

                                else {
                                    let churchQuestion = responses.registrationTxt.find(question => { return question.tag == "church" })
                                    wpClient.sendText(message.from, errorMessage.response)

                                    let resp1
                                    if (sex == "masculino") {
                                        resp1 = churchQuestion.response[1].replace("{article}", "Ele")
                                    }
                                    else if (sex == "feminino") {
                                        resp1 = churchQuestion.response[1].replace("{article}", "Ela")
                                    }

                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp1)
                                    }, 1500);
                                    return

                                }
                            }


                            //save observation and ask finish
                            else if (user.lastInteraction == "regGetChurch") {

                                let sex = lastDependent.sex.toLowerCase()
                                let endRegistration = responses.registrationTxt.find(question => { return question.tag == "endRegistration" })


                                if (intent.includes("getname") || intent.includes("no")) {
                                    let observation = intent.includes("getname") ? dialog.data.name : "Nenhuma"
                                    await dependentRepository.update(lastDependent.id, { observation })
                                    let resp1
                                    let resp2 = endRegistration.response[1]
                                    if (sex == "masculino") {
                                        resp1 = endRegistration.response[0].replace("{article}", "do").replace("{name}", lastDependent.name.split(" ")[0])
                                            .replace("{article2}", "dele").replace("{username}", lastDependent.username)
                                    }
                                    else if (sex == "feminino") {
                                        resp1 = endRegistration.response[0].replace("{article}", "da").replace("{name}", lastDependent.name.split(" ")[0])
                                            .replace("{article2}", "dela").replace("{username}", lastDependent.username)
                                    }
                                    wpClient.sendText(message.from, resp1)
                                    setTimeout(function () {
                                        wpClient.sendText(message.from, resp2)
                                    }, 1500);
                                    // change the last interaction
                                    await userRepository.update(user._id, { lastInteraction: "" })
                                    return
                                }
                            }

                        }

                        // if that one of those, just answer
                        else if (intent.includes("help") || intent == "welcome" || intent == "thanks") {
                            wpClient.sendText(message.from, dialog.text)
                            await userRepository.update(user._id, { errorCount: 0 })
                            return
                        }

                        // list dependents
                        else if (intent.includes("listdependents")) {

                            let dependentList = await dependentRepository.findByNumber(number)
                            let regList = responses.registrationTxt.find(question => { return question.tag == "getList" })

                            if (dependentList.length < 1) {
                                wpClient.sendText(message.from, regList.noDependent)
                            } else {
                                let dependentInfo = ""
                                for (dependent of dependentList) {
                                    let info = regList.dependentInfo.replace("{username}", dependent.username)
                                    info = info.replace("{name}", dependent.name)
                                    info = info.replace("{isConfirmed}", dependent.isConfirmed ? "*Pagamento confirmado*" : "*Pagamento pendente*")
                                    dependentInfo += info
                                }
                                let text = regList.title + dependentInfo + regList.paymentInfo
                                wpClient.sendText(message.from, text)
                            }
                            return
                        }

                        else if ((intent == "talktoperson") || (intent == "yes" && user.errorCount == 2)) {
                            if (intent == "talktoperson") {
                                wpClient.sendText(message.from, dialog.text)
                            } else if (intent == "yes") {
                                let errorMessage = responses.errorTxt.find(question => { return question.tag == "askSomebody" })
                                wpClient.sendText(message.from, errorMessage.delegate)

                            }
                            await wpClient.pinChat(message.from, true, false)
                            await userRepository.update(user._id, { errorCount: 0 })
                            return
                        }

                        // if the message scope is unknown
                        else {
                            if (user.errorCount == 0) {
                                let errorMessage = responses.errorTxt.find(question => { return question.tag == "notUnderstood" })
                                wpClient.sendText(message.from, errorMessage.response)
                                await userRepository.update(user._id, { errorCount: 1 })
                            }
                            if (user.errorCount > 0) {
                                let errorMessage = responses.errorTxt.find(question => { return question.tag == "askSomebody" })
                                wpClient.sendText(message.from, errorMessage.response)
                                await userRepository.update(user._id, { errorCount: 2 })
                            }
                        }
                    }
                }
            }
            // if it is not textMessage
            else {

                let notTxt = responses.errorTxt.find(question => { return question.tag == "notTxt" })

                wpClient.sendText(message.from, notTxt.response)
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

async function rmvFromGroup(groupId, contacts) {

    // testGroupId
    // 120363024915489451@g.us
    if (!wpClient) {
        return { error: "Whatsapp client not initialized yet" }
    }


    let error = null
    for (let contact of contacts) {
        await wpClient.removeParticipant(groupId, contact.phoneNumber + "@c.us").catch(e => error = e)
    }
    if (error)
        return { error }

    else return { success: true }


}

async function setConfirmation(sender, dependentCode, isConfirmed) {
    dependentCode = capitalizeName(dependentCode)
    let dependent = await dependentRepository.findByUsername(dependentCode)
    if (dependent.error) {
        return wpClient.sendText(sender, "Adolescente {" + dependentCode + "} não encontrado")
    }

    let dependent2 = await dependentRepository.update(dependent._id, { isConfirmed })

    if (dependent2) {
        let confirmation = dependent2.isConfirmed ? "confirmado" : "desconfirmado"
        let article = dependent.sex == "Masculino" ? "do" : "da"
        let text = `*Cadastro confirmado* \n
        O cadastro `+ article + ` ` + dependent2.name + ` ( ` + dependent2.username + ` ) foi ` + confirmation

        wpClient.sendText(sender, text)

        if (dependent.responsible && dependent.isConfirmed != dependent2.isConfirmed) {
            wpClient.sendText(dependent.responsible.phoneNumber + "@c.us", text)
        }
    }
}

async function setCheckIn(sender, dependentCode, checkIn) {
    dependentCode = capitalizeName(dependentCode)
    let dependent = await dependentRepository.findByUsername(dependentCode)

    if (dependent.error) {
        return wpClient.sendText(sender, "Adolescente {" + dependentCode + "} não encontrado")
    }

    let dependent2 = await dependentRepository.update(dependent._id, { checkIn })

    if (dependent2) {
        let confirmation = dependent2.checkIn ? "confirmado" : "desconfirmado"
        let article = dependent.sex == "Masculino" ? "do" : "da"
        let text = `*CheckIn* \n
        O checkIn `+ article + ` ` + dependent2.name + ` ( ` + dependent2.username + ` ) foi ` + confirmation

        wpClient.sendText(sender, text)

        if (dependent.responsible && dependent.checkIn != dependent2.checkIn) {
            wpClient.sendText(dependent.responsible.phoneNumber + "@c.us", text)
        }
    } else {
        wpClient.sendText(sender, "Erro ao confirmar o cadastro")
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
        if (user.userType.name.toLowerCase() == "monitor") userType1 = "Monitor"

        if (user2.userType.name.toLowerCase() == "default") userType = "Padrão"
        if (user2.userType.name.toLowerCase() == "administrator") userType = "Administrador"
        if (user2.userType.name.toLowerCase() == "moderator") userType = "Moderador"
        if (user2.userType.name.toLowerCase() == "monitor") userType = "Monitor"
        if (user.userType.name != user2.userType.name) {
            let userText = `         *Tipo de usuário alterado* \n
        O seu tipo de usuário foi alterado de ` + userType1 + ` para ` + userType + ` por ` + admin.name.split(" ")[0] + " " + admin.name.split(" ")[1]

            if (userType != "Padrão")
                userText += "\n Agora você tem acesso aos comandos.\nDigite \\comandos para visualizar a lista."

            wpClient.sendText(user.phoneNumber + "@c.us", userText)

            let adminText = `         *Tipo de usuário alterado* \n
        O tipo de usuário de `+ user2.name + ` (` + user.phoneNumber + `) foi alterado de ` + userType1 + ` para ` + userType

            wpClient.sendText(sender, adminText)
            return
        }
        else {
            wpClient.sendText(sender, "Tipo de usuário não alterado.")
        }
    }
    else {
        wpClient.sendText(sender, "Error ao alterar tipo de usuário")
    }
    return
}


async function getByUserType(sender, userType) {
    let users = await userRepository.findByUserType(userType)
    if (users.length < 1) {
        wpClient.sendText(sender, "Nenhum usuário desse tipo encontrado")
    }
    else {
        let command
        if (userType == "mod") {
            command = responses.commands.list.find(command => { return command.tag == "getMod" })
        }
        else if (userType == "admin") {
            command = responses.commands.list.find(command => { return command.tag == "getAdmin" })
        }
        else if (userType == "monitor") {
            command = responses.commands.list.find(command => { return command.tag == "getMonitor" })
        }
        let text = command.response
        for (let i in users) {
            let user = users[i]
            let info = command.template.replace("{number}", Number(i) + 1).replace("{name}", user.name).replace("{phoneNumber}", user.phoneNumber)
            text += info
        }
        wpClient.sendText(sender, text)
    }
    return
}

async function saveToken() {
    if (!fs.existsSync(path)) await fs.mkdirSync(path)
    // recuperando o token da sessão do navegador
    const browserSessionToken = await wpClient.getSessionTokenBrowser()
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

function isMod(user) {
    return isMonitor(user) || user.userType.name == "Mod" || user.userType.name == "Moderator"
}

function isMonitor(user) {
    return isAdmin(user) || user.userType.name == "Monitor"
}

function isAdmin(user) {
    return user.userType.name == "Administrator" || user.userType.name == "Admin"
}
module.exports = {
    sendMessage, addToGroup, rmvFromGroup
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

// create(
//     // nome da sessão
//     "bot-acampa",
//     // recuperando dados do qr code, se existir.
//     (base64Qr) => {

//         if (base64Qr) {
//             console.log('User Disconnected')
//             sessionToken = null
//         }
//     },

//     (statusSession, sessionName) => {
//         console.log('STATUS SESSION: ', statusSession)
//         console.log('SESSION NAME: ', sessionName)
//     },

//     {
//         multidevice: false,
//         disableWelcome: true,
//     },
//     // parameter to create session
//     sessionToken
// )


// create(
//     // nome da sessão
//     "bot-acampa",
//     // recuperando dados do qr code, se existir.
//     (base64Qr) => {

//         if (base64Qr) {
//             console.log('User Disconnected')
//             sessionToken = null
//         }
//     },

//     (statusSession, sessionName) => {
//         console.log('STATUS SESSION: ', statusSession)
//         console.log('SESSION NAME: ', sessionName)
//     },

//     {
//         multidevice: false,
//         disableWelcome: true,
//     },
//     // parameter to create session
//     sessionToken
// )