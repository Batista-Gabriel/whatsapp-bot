const express =require('express');
const routes= express.Router()
const logController = require('../controller/logController');
const { checkAdminPrivilege } = require('../middleware/auth');


routes.use(checkAdminPrivilege)
routes.get('/type/:type', logController.findByType);
routes.get('/:id', logController.find);
routes.get('', logController.list);
routes.put('/:id', logController.update);
routes.delete('/', logController.deleteAll);
routes.delete('/type/:type', logController.deleteByType);
routes.delete('/:id', logController.delete);

module.exports = routes;