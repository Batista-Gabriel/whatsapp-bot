
const path = require('path');
const express = require('express');
const routes = express.Router()

const fs = require('fs');

//frontend setup
routes.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});


var constantPath = './src/routes/';
var relativePath = "./"
var mainRoute = "index.js"
var files = {};

// loading routes automatically
fs.readdir(constantPath, function (err, modules) {
  if (err) {
    throw err;
  }

  modules
    .filter(function (module) {
      return module.slice(module.length - 3) === '.js' && module != mainRoute;
    })
    .forEach(function (module) {
      files[module.slice(0, module.length - 3)] = require(relativePath + module);
    });

  let fileNames = Object.keys(files)
  for (let fileName of fileNames) {
    let routeName = fileName.slice(0,-6)
    routes.use("/api/"+routeName,files[fileName])
  }
});



module.exports = routes;