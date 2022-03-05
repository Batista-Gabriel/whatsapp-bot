
let initialTxt = [
    // beginning
    {
        question: [],
        tag: "start",
        title: `        *Olá!, {username}! Como posso ajudar?* \n
        Aqui você pode fazer a inscrição de adolescentes no acampa, ver a situação da inscrição deles e tirar dúvidas.
    Este é apenas um beta de um programa. Algumas funcionalidades ainda não foram implementadas. 
    `,
        description: "Clique no botão para interagir",

        buttons: [
            {
                "buttonText": {
                    "displayText": "Inscrição"
                }
            },
            {
                "buttonText": {
                    "displayText": "Ver cadastros"
                }
            },
            {
                "buttonText": {
                    "displayText": "Dúvidas"
                }
            }
        ],

    },

    // first time
    {
        question: [],
        helper: ["meu nome é", "meu nome e"],
        tag: "firstTime",
        title: `        *Seja bem vindo(a)!* \n
        Antes de começarmos, nos diga o seu nome completo, por favor.
        Isso servirá para futuros cadastros.
        Escreva 'meu nome é' antes do seu nome (sem as aspas).\n
        Exemplo:
        Meu nome é Juliana Lima Pereira
    `,
    },
]

let generalTxt = [


    // question part 1
    {
        question: ["duvida", "duvidas", "dúvida", "dúvidas", "ajuda", "ajudinha", "questão", "saber"],
        title: `        *Qual é a sua dúvida?* \n
    Clique na pergunta que se adequa à sua questão.
    `,
        description: 'Se não for nenhuma dessas, clique em "Parte 2"',

        buttons: [
            {
                "buttonText": {
                    "displayText": "Quanto custa?"
                }
            },
            {
                "buttonText": {
                    "displayText": "Quando será?"
                }
            },
            {
                "buttonText": {
                    "displayText": "Parte 2"
                }
            }
        ]
    },

    // question part 2
    {
        question: ["parte 2"],
        title: `        *Qual é a sua dúvida?* \n
    Clique na pergunta que se adequa à sua questão.
    `,
        description: 'Se não for nenhuma dessas, clique em "outra pergunta"',

        buttons: [
            {
                "buttonText": {
                    "displayText": "Onde fica a igreja?"
                }
            },
            {
                "buttonText": {
                    "displayText": "como posso pagar?"
                }
            },
            {
                "buttonText": {
                    "displayText": "Outra pergunta"
                }
            }
        ]
    },

    // price question
    {
        question: ["custa", "valor", "reais", "preço", "preco"],
        title: ` *Quanto custa o acampa?* \n
    O valor é R$ xxx
    `,
    },

    // days question
    {
        question: ["quando", "dias", "dia", "data",],
        title: `        *Quando o evento acontecerá?* \n
    O evento será do dia x até y do mês z de 202*
    `,
    },

    // payment question
    {
        question: ["pagar", "pagamento"],
        title: ` *Como faço o pagamento?* \n
    O pagamento pode ser feito em dinheiro e cartão
    `,
    },


    // thanks
    {
        question: ["obrigado", "obrigada", "grato", "grata", "valeu", "vlw", "flw"],
        title: `Por nada! Qualquer coisa, é só chamar 😉 `,
    },

]

let registrationTxt = [
    // make registration
    {
        question: ["inscrição", "inscricão", "inscriçao", "inscricao"],
        tag: "registration",
        title: `        *Fazer inscrição de um adolescente* \n
    Que bom que decidiu fazer a inscrição!
    Antes de começar, você é o/a responsável pelo adolescente que será cadastrado?
    `,
        description: "Essa operação só pode ser feita por um responsável.",

        buttons: [
            {
                "buttonText": {
                    "displayText": "Sou sim"
                }
            },
            {
                "buttonText": {
                    "displayText": "Não sou"
                }
            }
        ]
    },

    // registration error
    {
        question: ["não sou"],
        tag: "responsibleError",
        title: `       *Erro* \n
    Por questão de segurança, o cadastro só pode ser feito no celular do responsável, pois o número é salvo para futuro contato.
    `,
    },

    // save name
    {
        question: ["sou sim"],
        helper: ["nome:", "nome :"],
        tag: "name",
        title: `       *Nome do adolescente* \n
    Por favor, diga o *nome completo* do adolescente
    Escreva 'nome:' antes do nome\n
    Exemplo: 
    nome: Luciano da Costa Santos
    `,
    },
    // save birthday
    {
        question: [],
        helper: ["nascimento:", "nascimento :"],
        tag: "birthday",
        title: `       *Data nascimento de {dependent}* \n
    Escreva 'nascimento:' antes da data de nascimento (sem as aspas).\n
    Exemplo: 
    nascimento: 12/11/2007
    `,
    },

    //save sex
    {
        tag: "sex",
        question: [],
        helper: ["masculino", "feminino"],
        title: `        *Sexo de {dependent}* \n
    `,
        description: "Gênesis 1:27",

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

    //save church
    {
        question: [],
        helper: ["igreja:", "igreja :"],
        tag: "church",
        title: `     *{dependent} é de alguma igreja?* \n
        
    Escreva 'igreja:' antes da nome da igreja (sem as aspas).\n
    Exemplo: 
    igreja: ADVEC Taquara
    
    Caso não seja, escreva igreja: nenhuma 
    `,
    },

    //save observation
    {
        question: [],
        helper: ["observação:", "observação :", "observacão:", "observacão :", "observaçao:", "observaçao :", "observacao:", "observacao :"],
        tag: "observation",
        title: `     *Gostaria de adicionar alguma observação?* \n
    Informe se {dependent} toma remédio em algum horário, se tem alergia ou restrição alimentar ou se tem algo que gostaria de avisar.
    
    Se tiver, escreva 'observação:' antes da observação (sem as aspas).\n
    Exemplo: 
    Observação: toma remédio antes de dormir
    
    Caso não tenha, escreva observação: nenhuma 
    `,
        buttons: [
            {
                "buttonText": {
                    "displayText": "Adicionar observação"
                }
            },
            {
                "buttonText": {
                    "displayText": "Nenhuma observação"
                }
            }
        ],
    },

    //finish registration
    {
        question: [],
        tag: "end",
        title: `       *Pré cadastro concluído* \n
    Os dados de {dependent} foram salvos! Para confirmar o cadastro, realize o pagamento na igreja.\n
    O código é {username}.
    `,
    },
    // get registration list
    {
        question: ["ver cadastros", "confirmar cadastros", "ver cadastro", "confirmar cadastro"],
        tag: "getRegistration",
        title: `*Lista de adolescentes cadastrados* \n`,
        dependentInfo: `{username} - {name} - {isConfirmed} \n`,
        noDependent: "Nenhum adolescente encontrado para este número.",
        paymentInfo: "\n OBS: *O pagamento só pode ser realizado na igreja.*"
    },
    // cancel registration
    {
        question: ["cancelar", "esquecer"],
        tag: "cancel",
        title: `     *Cadastro de {dependent} foi cancelado* \n

        Todos os dados referentes a este adolescente foram apagados.
    `

    }
]

let anotherTxt = [
    // another question
    {
        question: ["outra pergunta"],
        tag: "question",
        title: `       *Escreva sua dúvida* \n
    Antes de falar a sua dúvida, escreva 'pergunta:' (sem as aspas) \n
    Exemplo: 
    Pergunta: O que o meu filho precisa levar?
    `,
    },

    // another question
    {

        tag: "save",
        helper: ["pergunta:", "pergunta :"],
        title: `       *Responderemos já* \n
    Sua pergunta foi salva e será respondida assim que possível.😃
    `,
    },
]

// placement question
let locationTxt = [
    {
        question: ["onde", "lugar"],
        tag: "church",
        title: ` *Onde fica a igreja?* \n
    As entradas da igreja ficam na rua André Rocha, 890 e
    Rua Visconde de Asseca 89
    `,
        name: "ADVEC Taquara",
        x: -22.9234746,
        y: -43.3708428,
    }
]

let errorTxt = [{

    // another question
    tag: "notTxt",
    title: `       *Desculpe!* \n
    Por enquanto não estamos podendo responder mensagens que não forem de texto.
    Por favor, digite a sua mensagem.😀
    `,

}]

let commands =
// commands
{
    question: ["\\comando", "\\comandos"],
    title: `         *Aqui está a lista de comandos*\n
    Para ver essa parte é só digitar \comandos   
    `,
    error: " *ERRO* \n Os comandos são apenas para Moderadores e Administradores",

    list: [
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

        // confirm
        {
            tag: "contact",
            helper: "\\contato",
            type: "Moderator",
            description: "Retorna o contato do responsável de um acampante. \nExemplo: \\contato Lucas2381",
            error: "Adolescente {username} não foi encontrado.",
            contactError: "O contato do responsável de {name} ({username}) não foi encontrado.",
            title: "Aqui está o contato do responsável por {name} ({username})."
        },


        // findByName
        {
            tag: "searchByName",
            helper: "\\buscarNome",
            type: "Moderator",
            description: "Buscar cadastro de um acampante pelo nome. Escrever \\buscar Lucas",
            title: `           --- *Lista de adolescentes* ---\n`,
            dependent:"#{number}: {username} - {name} - {birthday}\n ",
            error: "Nenhum adolescente com '{name}' foi encontrado."
        },
        
        // find
        {
            tag: "search",
            helper: "\\buscar",
            type: "Moderator",
            description: "Buscar cadastro de um acampante pelo código. Escrever \\buscar Lucas2381",
            title: `           --- *Usuário {username}* ---\n
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
        
        // sendC
        {
            tag: "sendConfirmed",
            helper: "\\enviarC",
            type: "Administrator",
            description: "Enviar texto apenas para os contatos que tem adolescentes que realizaram pagamento. Caso queira falar o nome da pessoa, coloque {username} no lugar.\n Exemplo: Oi, {username}!",
        },
        // sendNC
        {
            tag: "sendNotConfirmed",
            type: "Administrator",
            helper: "\\enviarNC",
            description: "Enviar texto apenas para os contatos que tem adolescentes que ainda não realizaram pagamento.Caso queira falar o nome da pessoa, coloque {username} no lugar.\n Exemplo: Oi, {username}!",
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
            description: "Revoga o direito de MOderador de um número . \nExemplo \\tirarMod 552197432xxxx",
        },
    ]
}

module.exports = {
    generalTxt, initialTxt, registrationTxt, anotherTxt, locationTxt, errorTxt, commands
}