const express = require('express');
const routes = express.Router()
const userController = require('../controller/userController');
const { checkAdminPrivilege } = require('../middleware/auth');


routes.post('/authenticate', userController.authenticate);
routes.get('/checkauth', userController.checkAuth);
routes.use(checkAdminPrivilege)
routes.post('', userController.create);
routes.get('', userController.list);
routes.put('/:id', userController.update);
routes.get('/number/:number', userController.findByNumber);
routes.get('/:id', userController.find);
routes.delete('/:id', userController.delete);


module.exports = routes;


