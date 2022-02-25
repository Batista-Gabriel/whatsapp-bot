const express = require('express');
const routes = express.Router()
const dependentController = require('../controller/dependentController');
const { checkAdminPrivilege } = require('../middleware/auth');


routes.post('', dependentController.create);
routes.get('/number/:number', dependentController.findByNumber);
// routes.use(checkAdminPrivilege)
routes.get('/:id', dependentController.find);
routes.get('', dependentController.list);
routes.put('/:id', dependentController.update);
routes.delete('/:id', dependentController.delete);


module.exports = routes;


