const whatsapp = require("./src/whatsapp") 

const cookieParser = require("cookie-parser");
const express = require('express');
const history = require('connect-history-api-fallback');
const cors = require('cors')
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' })

const app = express();
const route = require('./src/routes')

let port = process.env.PORT || 3333

whatsapp.initialize()

app.use(cookieParser())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
// Login session
;

app.use('/', route)

const staticFileMiddleware = express.static(path.join(__dirname, "./src/views"));
app.use(staticFileMiddleware);
app.use(history({
    disableDotRule: true,
    verbose: false
}));
app.use(staticFileMiddleware);


app.listen(port).on("error", (error) => {
    if (error.code == "EADDRINUSE")
        console.log("Port " + port + " already in use.")
    else
        console.log("NodeJs error Code: " + error.code)
}).on("listening", () =>
    console.log("listening to port", port)
)
