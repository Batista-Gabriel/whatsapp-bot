const express = require('express');
const routes = express.Router()
const whatsappController = require('../controller/whatsappController');

routes.post('/sendMessage', whatsappController.sendMessage);
routes.post('/addToGroup', whatsappController.addToGroup);


module.exports = routes;


