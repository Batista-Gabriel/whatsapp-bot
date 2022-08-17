const express =require('express');
const routes= express.Router()
const logTypeController = require('../controller/logTypeController');
const { checkAdminPrivilege } = require('../middleware/auth');


routes.use(checkAdminPrivilege)
routes.get('/name/:name', logTypeController.findByName);
routes.get('/:id', logTypeController.find);
routes.get('', logTypeController.list);
routes.post('', logTypeController.create);
routes.put('/:id', logTypeController.update);
routes.delete('/:id', logTypeController.delete);

module.exports = routes;