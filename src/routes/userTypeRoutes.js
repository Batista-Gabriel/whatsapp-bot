const express =require('express');
const routes= express.Router()
const userTypeController = require('../controller/userTypeController');
const { checkAdminPrivilege } = require('../middleware/auth');


routes.get('/:id', userTypeController.find);
routes.get('', userTypeController.list);
routes.use(checkAdminPrivilege)
routes.post('', userTypeController.create);
routes.put('/:id', userTypeController.update);
routes.delete('/:id', userTypeController.delete);

module.exports = routes;