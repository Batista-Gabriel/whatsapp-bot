const minAge = 11
const maxAge = 17

let registrationTxt = [
    // make registration
    {
        tag: "registrationInit",
        response: "Eba! Que bom que decidiu inscrever! Só pra lembrar, esse evento é para adolescentes de " + minAge + " até " + maxAge + " anos. E apenas o responsável pode fazer a inscrição \n\n *Você é responsável por este adolescente?*",
        description: "*Você é responsável por este adolescente?*",

        buttons: [
            {
                "buttonText": {
                    "displayText": "Sim"
                }
            },
            {
                "buttonText": {
                    "displayText": "Não"
                }
            }
        ]
    },

    // registration error
    {
        tag: "notResponsible",
        response: `Poxa, que pena! Mas você pode passar o meu número para a pessoa responsável para que esta possa fazer a inscrição 😉`,
    },

    // registration ok
    {
        tag: "responsibleOK",
        response: `Então ok! Vou te pedir alguns dados para concluir a inscrição. Tudo bem?`,
    },

    // save username
    {
        tag: "userName",
        response: `Para começar, por favor, diga o seu *nome completo*`,
    },

    //save sex
    {
        tag: "sex",
        response: `De qual sexo é o adolescente? \n\n *Gênesis 1:27*`,
        description: "*Gênesis 1:27*",

        buttons: [
            {
                "buttonText": {
                    "displayText": "Masculino"
                }
            },
            {
                "buttonText": {
                    "displayText": "Feminino"
                }
            }
        ],
    },

    // save birthday
    {
        tag: "birthday",
        response: ['Legal! Mais {article} {sex} pro acampa!', "Qual é a data de nascimento {article}? Lembrando que o acampa é para adolescentes *de" + minAge + " até " + maxAge + " anos*"],
    },

    // save name
    {
        tag: "name",
        response: ['Entendi!{article} tem {age} anos', `E qual é o nome completo {article}?`],
        negativeResponse: "{age} anos? Que pena! O acampa é para adolescentes *de" + minAge + " até " + maxAge + " anos*"
    },

    //save church
    {
        tag: "church",
        response: ['Pode relaxar pois {article} {name} vai gostar muito daqui ', '{article} é de alguma igreja? Se sim, qual?'],
    },

    //save observation
    {
        tag: "observation",
        negativeResponse: ['Que pena! Mas tomara que no final do acampa {article} decida ficar conosco 😄',
            "Ultima pergunta. Gostaria de adicionar alguma observação? {article} toma algum remédio? Precisa de ajuda pra se socializar? Se quiser deixar algum comentário, é só falar 😉"],

        response: ['Graças a Deus!!',
            "Ultima pergunta. Gostaria de adicionar alguma observação? {article} toma algum remédio? Precisa de ajuda pra se socializar? Se quiser deixar algum comentário, é só falar 😉"],
    },

    // end of registration
    {
        tag: "endRegistration",
        response: ['A pré inscrição {article} {name} foi feita com sucesso, para finalizar, por favor, realize o pagamento na igreja. O código {article2} é {username}'
            , 'Se quiser fazer outra inscrição ou tirar uma dúvida, só me chamar'],


    },
    // end of registration
    {
        tag: "cancelRegistration",
        response: 'A pré inscrição foi cancelada',
    },


    // get registration list
    {
        tag: "getList",
        title: `*Lista de adolescentes cadastrados* \n \n`,
        dependentInfo: `{username} - {name} - {isConfirmed} \n`,
        noDependent: "Nenhum adolescente encontrado para este número.",
        paymentInfo: "\n OBS: *O pagamento só pode ser realizado na igreja.*"
    },
]


// placement question
let locationTxt = [
    {
        tag: "church",
        name: "ADVEC Taquara",
        x: -22.9234746,
        y: -43.3708428,
    }
]

let errorTxt = [{

    // another question
    tag: "notTxt",
    response: `       *Desculpe!* \n
    Por enquanto não estamos podendo responder mensagens que não forem de texto.
    Por favor, digite a sua mensagem.😀
    `,
},
{
    tag: "notUnderstood",
    response: `Desculpe! Não entendi. Poderia dizer de uma forma mais simples?`,
},
{
    tag: "askSomebody",
    response: `Desculpe! Ainda não entendi. Gostaria de falar com um atendente?`,
    delegate: "Pode mandar sua mensagem. Solicitaremos alguém para te responder"
}
]

let commands =
// commands
{
    question: ["\\comando", "\\comandos"],
    response: `         *Aqui está a lista de comandos*\n
    Para ver essa parte é só digitar \comandos   
    `,
    error: " *ERRO* \n Os comandos são apenas para Moderadores e Administradores",

    list: [

        /*
        Commands for Moderators
        */

        // confirm
        {
            tag: "confirm",
            helper: "\\confirmar",
            type: "Moderator",
            description: "Confirmar cadastro de um acampante. \nExemplo: \\confirmar Lucas2381",
        },
        // deny
        {
            tag: "deny",
            helper: "\\desconfirmar",
            type: "Moderator",
            description: "Desconfirmar cadastro de um acampante. \nExemplo \\desconfirmar Lucas2381",
        },

        // contact
        {
            tag: "contact",
            helper: "\\contato",
            type: "Moderator",
            description: "Retorna o contato do responsável de um acampante. \nExemplo: \\contato Lucas2381",
            error: "Adolescente {username} não foi encontrado.",
            contactError: "O contato do responsável de {name} ({username}) não foi encontrado.",
            response: "Aqui está o contato do responsável por {name} ({username})."
        },


        // findByName
        {
            tag: "searchByName",
            helper: "\\buscarNome",
            type: "Moderator",
            description: "Buscar cadastro de um acampante pelo nome. Escrever \\buscar Lucas",
            response: `           --- *Lista de adolescentes* ---\n`,
            dependent: "#{number}: {username} - {name} - {birthday}\n ",
            error: "Nenhum adolescente com '{name}' foi encontrado."
        },

        // find
        {
            tag: "search",
            helper: "\\buscar",
            type: "Moderator",
            description: "Buscar cadastro de um acampante pelo código. Escrever \\buscar Lucas2381",
            response: `           --- *Usuário {username}* ---\n
            Nome: {name},
            Confirmado(a): {isConfirmed},
            Nascimento: {birthday},
            Sexo: {sex},
            Responsável: {responsible},
            Telefone do responsável: {phoneNumber},
            Observação: {observation}
            `,
            error: "Adolescente {username} não foi encontrado."
        },



        /*
        Commands for Monitors
        */

        // checkIn
        {
            tag: "checkIn",
            type: "Monitor",
            helper: "\\checkIn",
            description: "(Não implementado) Confirma entrada do adolescente. \nExemplo: \\checkIn Lucas2381",
        },
        // RmvCheckIn
        {
            tag: "rmvCheckIn",
            helper: "\\rmvCheckIn",
            type: "Monitor",
            description: "(Não implementado) Remove a confirmação de entrada do adolescente. \nExemplo: \\rmvCheckIn Lucas2381",
        },



        /*
        Commands for Admins
        */

        // getAdmin
        {
            tag: "getAdmin",
            helper: "\\listarAdmin",
            type: "Administrator",
            description: "Listar todos os administradores",
            response: `           --- *Lista de administradores* ---\n`,
            template: "#{number}: {name} - {phoneNumber}\n ",
        },
        // getMod
        {
            tag: "getMod",
            helper: "\\listarMod",
            type: "Administrator",
            description: "Listar todos os moderadores",
            response: `           --- *Lista de moderadores* ---\n`,
            template: "#{number}: {name} - {phoneNumber}\n ",
        },
        // getMonitor
        {
            tag: "getMonitor",
            helper: "\\listarMonitor",
            type: "Administrator",
            description: "Listar todos os monitores",
            response: `           --- *Lista de monitores* ---\n`,
            template: "#{number}: {name} - {phoneNumber}\n ",
        },

        // sendC
        {
            tag: "sendConfirmed",
            helper: "\\enviarC",
            type: "Administrator",
            description: "(Não implementado) Enviar texto apenas para os contatos que tem adolescentes que realizaram pagamento. Caso queira falar o nome da pessoa, coloque {username} no lugar.\n Exemplo: Oi, {username}!",
        },
        // sendNC
        {
            tag: "sendNotConfirmed",
            type: "Administrator",
            helper: "\\enviarNC",
            description: "(Não implementado) Enviar texto apenas para os contatos que tem adolescentes que ainda não realizaram pagamento.Caso queira falar o nome da pessoa, coloque {username} no lugar.\n Exemplo: Oi, {username}!",
        },
        // send
        {
            tag: "send",
            helper: "\\enviar",
            type: "Administrator",
            description: "Enviar texto para todos que se inscreveram no acampa. Caso queira falar o nome da pessoa, coloque {username} no lugar.\n Exemplo: Oi, {username}!",
        },

        // turnAdmin
        {
            tag: "turnAdmin",
            helper: "\\tornarAdmin",
            type: "Administrator",
            description: "Torna um número como um administrador. \nExemplo \\tornarAdmin 552197432xxxx",
        },
        // removeAdmin
        {
            tag: "removeAdmin",
            helper: "\\tirarAdmin",
            type: "Administrator",
            description: "Revoga o direito de administrador de um número . \nExemplo \\tirarAdmin 552197432xxxx",
        },
        // turnMonitor
        {
            tag: "turnMonitor",
            helper: "\\tornarMonitor",
            type: "Administrator",
            description: "Torna um número como um monitor. \nExemplo \\tornarMonitor 552197432xxxx",
        },
        // removeMonitor
        {
            tag: "removeMonitor",
            helper: "\\tirarMonitor",
            type: "Administrator",
            description: "Revoga o direito de monitor de um número . \nExemplo \\tirarMonitor 552197432xxxx",
        },
        // turnMod
        {
            tag: "turnMod",
            helper: "\\tornarMod",
            type: "Administrator",
            description: "Torna um número como um Moderador. \nExemplo \\tornarMod 552197432xxxx",
        },
        // removeMod
        {
            tag: "removeMod",
            helper: "\\tirarMod",
            type: "Administrator",
            description: "Revoga o direito de Moderador de um número . \nExemplo \\tirarMod 552197432xxxx",
        },
    ]
}

module.exports = {
    registrationTxt, locationTxt, errorTxt, commands
}