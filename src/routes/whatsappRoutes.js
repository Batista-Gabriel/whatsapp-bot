const express = require('express');
const routes = express.Router()
const { checkAdminPrivilege } = require('../middleware/auth');
const whatsappController = require('../controller/whatsappController');


routes.use(checkAdminPrivilege)
routes.post('/sendMessage', whatsappController.sendMessage);
routes.post('/addToGroup', whatsappController.addToGroup);
routes.post('/rmvFromGroup', whatsappController.rmvFromGroup);


module.exports = routes;


