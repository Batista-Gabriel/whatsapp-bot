const express =require('express');
const routes= express.Router()
const dialogFlowController = require('../controller/dialogFlowController');
const { checkAdminPrivilege } = require('../middleware/auth');

routes.use(checkAdminPrivilege)
routes.post('/', dialogFlowController.incoming);

module.exports = routes;