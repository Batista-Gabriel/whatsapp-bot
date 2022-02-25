
let initialTxt = [
    // beginning
    {
        question: [],
        tag: "start",
        title: `        *Olá!, {username}! Como posso ajudar?* \n
    Este é o beta de um bot para eventos. Algumas funcionalidades não foram implementadas 
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
        Escreva 'meu nome é' antes do seu nome (sem as aspas).\n
        Exemplo: 
        'Meu nome é Juliana Lima Pereira'
    `,
    },
]

let generalTxt = [

    //questions with functions
    {
        question: ["pergunta:", "pergunta :"],
        title: `        *Pergunta enviada* \n
    Te responderemos assim que possível.😃
    `,
    },


    // commands
    {
        question: ["comando", "comandos"],
        title: `  *Aqui está a lista de comandos*`,
        description: "◉_◉",

        buttons: [
            {
                "buttonText": {
                    "displayText": "Inscrição"
                }
            },
            {
                "buttonText": {
                    "displayText": "Dúvidas"
                }
            }
        ]
    },

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
        description: 'Se não for nenhuma dessas, clique em "outra"',

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
                    "displayText": "Outra"
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

    // placement question
    {
        question: ["onde",],
        title: ` *Onde fica a igreja?* \n
    A igreja fica na rua esqueci n, 890
    `,
    },


    // thanks
    {
        question: ["obrigado", "obrigada", "grato", "grata", "valeu", "vlw", "flw"],
        title: `Por nada! Qualquer coisa, é só chamar 😉 `,
    },
    // another question
    {
        question: ["outra"],
        title: `       *Escreva sua dúvida* \n
    Antes de falar a sua dúvida, escreva 'pergunta:' \n
    Exemplo: 
    'Pergunta: O que o meu filho precisa levar?'
    `,
    },

]


let registrationTxt = [
    // make registration
    {
        question: ["inscrição","inscricão","inscriçao","inscricao"],
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
        tag:"responsibleError",
        title: `       *Erro* \n
    Por questão de segurança, o cadastro só pode ser feito no celular do responsável\n
    O número é salvo para futuro contato.
    `,
    },

    // save name
    {
        question: ["sou sim"],
        helper: ["nome:", "nome :"],
        tag: "name",
        title: `       *Nome do adolescente* \n
    Escreva 'nome:' antes do nome\n
    Exemplo: 
    'nome: Luciano da Costa Santos'
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
    'nascimento: 12/11/2007'
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

    //save observation
    {
        question: [],
        helper: ["observação:", "observação :", "observacão:", "observacão :", "observaçao:", "observaçao :", "observacao:", "observacao :"],
        tag: "observation",
        title: `     *Gostaria de adicionar alguma observação?* \n
    Informe se {dependent} tome remédio em algum horário, se tem alergia ou restrição alimentar ou se tem algo que gostaria de avisar.
    
    Se tiver, escreva 'observação:' antes da observação (sem as aspas).\n
    Exemplo: 
    'Observação: toma remédio antes de dormir'
    
    Caso não tenha, escreva 'observação: nenhuma '
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
    `,
    },

]
module.exports = {
    generalTxt, initialTxt, registrationTxt
}