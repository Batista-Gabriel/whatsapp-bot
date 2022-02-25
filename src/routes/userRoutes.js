const express = require('express');
const routes = express.Router()
const userController = require('../controller/userController');
const { checkAdminPrivilege } = require('../middleware/auth');


routes.post('', userController.create);
routes.post('/authenticate', userController.authenticate);
routes.get('/checkauth', userController.checkAuth);
routes.put('/:id', userController.update);
routes.get('/:id', userController.find);
routes.delete('/:id', userController.delete);
// routes.use(checkAdminPrivilege)
routes.get('', userController.list);


module.exports = routes;


