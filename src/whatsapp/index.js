const fs = require('fs');
const { create } = require('venom-bot');
const { initialTxt, generalTxt, registrationTxt } = require("./responses")
const userRepository = require("../repository/userRepository")
const dependentRepository = require("../repository/dependentRepository")


const path = './src/whatsapp/tokens'
// definindo arquivo padrão para checagem de token
const sessionPath = `${path}/sessionTokens.json`

var sessionToken = readToken()

function initialize() {

    create(
        // nome da sessão
        "bot-acampa",
        // recuperando dados do qr code, se existir.
        (base64Qr, asciiQR, attempts, urlCode) => {

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
            disableWelcome: true
        },
        // parameter to create session
        sessionToken
    )

        .then(async (client) => {
            start(client)
            if (!sessionToken)
                saveToken(client)

        })
        .catch((erro) => {
            console.log(erro);
        });

}
function start(client) {

    client.onMessage(async (message) => {

        if (message.isGroupMsg === false) {
            let number = message.from.split("@")[0]
            let userFound = await userRepository.findByNumber(number)
            let startQuestion = initialTxt.find(question => { return question.tag == "start" })
            // if user not found
            if (userFound.error) {

                let firstTimeQuestion = initialTxt.find(question => { return question.tag == "firstTime" })
                // birthdayQuestion.title = birthdayQuestion.title.replace("{dependent}", dependentName)

                let name
                for (let helper of firstTimeQuestion.helper) {
                    if (message.body.toLowerCase().includes(helper)) {
                        name = message.body.split(helper)[1]
                        break
                    }
                }

                // ask user to say the name
                if (!name) {
                    client.sendText(message.from, firstTimeQuestion.title)

                } else {
                    let newUser = await userRepository.create({ name: name, phoneNumber: number })

                    startQuestion.title = startQuestion.title.replace("{username}", newUser.name.split(" ")[0].trim())

                    client.sendButtons(message.from, startQuestion.title, startQuestion.buttons, startQuestion.description)

                }

            }
            // if user found
            else {
                let username = userFound.name.split(" ")[0].trim()

                startQuestion.title = startQuestion.title.replace("{username}", username)

                let dependentList = await dependentRepository.findByNumber(number)

                let isPending = false
                // registration process
                if (dependentList.length > 0) {
                    let lastDependent = dependentList[dependentList.length - 1]
                    let dependentName = lastDependent.name.split(" ")[0].trim()

                    //if birthday is not saved
                    if (!lastDependent.birthday) {
                        isPending = true
                        let birthdayQuestion = registrationTxt.find(question => { return question.tag == "birthday" })
                        birthdayQuestion.title = birthdayQuestion.title.replace("{dependent}", dependentName)

                        let birthday = null

                        for (let helper of birthdayQuestion.helper) {
                            if (message.body.toLowerCase().includes(helper)) {
                                birthday = message.body.split(helper)[1]
                                break
                            }
                        }

                        if (!birthday) {
                            client.sendText(message.from, birthdayQuestion.title)
                        } else {
                            await dependentRepository.update(lastDependent._id, { birthday })

                            let sexQuestion = registrationTxt.find(question => { return question.tag == "sex" })
                            sexQuestion.title = sexQuestion.title.replace("{dependent}", dependentName)

                            client.sendButtons(message.from, sexQuestion.title, sexQuestion.buttons, sexQuestion.description)

                        }


                    }

                    // if sex is not saved
                    else if (!lastDependent.sex) {
                        isPending = true

                        let sexQuestion = registrationTxt.find(question => { return question.tag == "sex" })
                        sexQuestion.title = sexQuestion.title.replace("{dependent}", dependentName)

                        let sex = null

                        for (let helper of sexQuestion.helper) {
                            if (message.body.toLowerCase() == helper) {
                                sex = helper
                                break
                            }
                        }

                        if (!sex) {
                            sexQuestion.title = sexQuestion.title.replace("{dependent}", dependentName)

                            client.sendButtons(message.from, sexQuestion.title, sexQuestion.buttons, sexQuestion.description)

                        } else {
                            await dependentRepository.update(lastDependent._id, { sex })

                            let observationQuestion = registrationTxt.find(question => { return question.tag == "observation" })
                            observationQuestion.title = observationQuestion.title.replace("{dependent}", dependentName)

                            client.sendText(message.from, observationQuestion.title)

                        }


                    }

                    // if observation is not saved
                    else if (!lastDependent.observation) {
                        isPending = true

                        let observationQuestion = registrationTxt.find(question => { return question.tag == "observation" })
                        observationQuestion.title = observationQuestion.title.replace("{dependent}", dependentName)

                        let observation = null

                        for (let helper of observationQuestion.helper) {
                            if (message.body.toLowerCase().includes(helper)) {
                                observation = message.body.split(helper)[1]
                                break
                            }
                        }

                        if (!observation) {
                            observationQuestion.title = observationQuestion.title.replace("{dependent}", dependentName)

                            client.sendText(message.from, observationQuestion.title)

                        } else {
                            await dependentRepository.update(lastDependent._id, { observation })

                            let endQuestion = registrationTxt.find(question => { return question.tag == "end" })
                            endQuestion.title = endQuestion.title.replace("{dependent}", dependentName)

                            client.sendText(message.from, endQuestion.title)

                        }


                    }

                }
                // if there is not anything pending
                if (isPending == false) {

                    let registrationQuestion = registrationTxt.find(question => { return question.tag == "registration" })
                    let isOver = false //if it needs or not a next step

                    //if user is trying to register a dependent
                    for (let question of registrationQuestion.question) {
                        if (message.body.toLowerCase().trim() == question) {
                            client.sendButtons(message.from, registrationQuestion.title, registrationQuestion.buttons, registrationQuestion.description)
                            isOver = true
                            break
                        }
                    }

                    // if user is not the responsible
                    if (!isOver) {
                        let responsibleErrorQuestion = registrationTxt.find(question => { return question.tag == "responsibleError" })

                        for (let question of responsibleErrorQuestion.question) {
                            if (message.body.toLowerCase().trim() == question) {
                                client.sendText(message.from, responsibleErrorQuestion.title)
                                isOver = true
                                break
                            }
                        }
                    }

                    // save dependent name
                    if (!isOver) {
                        let nameQuestion = registrationTxt.find(question => { return question.tag == "name" })
                        let name = null

                        for (let question of nameQuestion.question) {
                            if (message.body.toLowerCase().trim() == question) {
                                client.sendText(message.from, nameQuestion.title)
                                isOver = true
                                break
                            }

                        }
                        if (!isOver) {
                            for (let helper of nameQuestion.helper) {
                                if (message.body.toLowerCase().includes(helper)) {
                                    name = message.body.toLowerCase().split(helper)[1]
                                    if (name) {

                                        let newDependent = await dependentRepository.create({ name, responsible: userFound._id })
                                        let birthdayQuestion = registrationTxt.find(question => { return question.tag == "birthday" })
                                        birthdayQuestion.title = birthdayQuestion.title.replace("{dependent}", newDependent.name)

                                        client.sendText(message.from, birthdayQuestion.title)

                                    }
                                    isOver = true
                                    break
                                }
                            }
                        }

                    }

                    //if it is not registration process
                    if (!isOver) {
                        for (let response of generalTxt) {
                            for (let question of response.question) {

                                if (message.body.toLowerCase().includes(question)) {
                                    if (response.buttons) {
                                        client.sendButtons(message.from, response.title, response.buttons, response.description)
                                            .catch((erro) => {
                                                console.error('Error when sending: ', erro); //return object error
                                            });
                                    } else {
                                        client.sendText(message.from, response.title)
                                            .catch((erro) => {
                                                console.error('Error when sending: ', erro); //return object error
                                            });
                                    }

                                    isOver = true
                                    break
                                }
                                if (isOver)
                                    break
                            }
                        }
                    }
                    //if it is not a listed question, it will send welcome message
                    if (!isOver) {

                        client.sendButtons(message.from, startQuestion.title, startQuestion.buttons, startQuestion.description)
                    }

                }

            }
        }
    });
}


// definindo pasta padrão para checagem de tokens


/**
 * salvar arquivo token
 * @param client 
 */
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


module.exports = {
    initialize
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