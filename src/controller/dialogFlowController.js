// Import the packages we need
const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config();

// Your credentials
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
// Your google dialogflow project-id
const PROJECID = CREDENTIALS.project_id;

// Configuration for the client
const CONFIGURATION = {
    credentials: {
        private_key: CREDENTIALS['private_key'],
        client_email: CREDENTIALS['client_email']
    }
}

// Create a new session
const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);
// Detect intent method
const detectIntent = async (languageCode, queryText, sessionId) => {

    let sessionPath = sessionClient.projectAgentSessionPath(PROJECID, sessionId);

    // The text query request.
    let request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: queryText,
                languageCode: languageCode,
            },
        },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    let response = { intent: result.intent.displayName }
    if (result.fulfillmentText.includes("{"))
        response.data = JSON.parse(result.fulfillmentText)
    else if (result.fulfillmentText)
        response.text = result.fulfillmentText

    return response

}

module.exports = {
    async incoming(req, res) {

        let languageCode = req.body.languageCode;
        let queryText = req.body.queryText;
        let sessionId = req.body.sessionId;

        let responseData = await detectIntent(languageCode, queryText, sessionId);
        console.log(responseData)
        res.send(responseData);
    },

    detectIntent
}

// detectIntent('pt', "quantas parcelas", "1234")