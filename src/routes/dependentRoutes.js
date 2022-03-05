const express = require('express');
const routes = express.Router()
const dependentController = require('../controller/dependentController');
const { checkAdminPrivilege } = require('../middleware/auth');


routes.use(checkAdminPrivilege)
routes.post('', dependentController.create);
routes.get('/name/:name', dependentController.findByName);
routes.get('/number/:number', dependentController.findByNumber);
routes.get('/username/:username', dependentController.findByUsername);
routes.get('/:id', dependentController.find);
routes.get('', dependentController.list);
routes.put('/:id', dependentController.update);
routes.delete('/:id', dependentController.delete);


module.exports = routes;


