"use strict";
var serverController    = require("./server/controller");

var src                 = new serverController();
src.setJade(__dirname + "/client/src", "jade");
src.setStatic(__dirname + "/client/src");
src.set404('(404) What ya looking for?!');
src.bindTo(3000);

var deployed            = new serverController();
deployed.setStatic(__dirname + "/client/public");
deployed.set404('(404) What ya looking for?!');
deployed.bindTo(3001);
