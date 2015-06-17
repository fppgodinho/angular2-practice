"use strict";
var express             = require('express');

function ServerController() {
    var _instance           = {};
    _instance.toString      = function() { return "[server.controller]"; };

    var _router             = express.Router();
    _router.use(function(req, res, next) { console.log(new Date(Date.now()).toTimeString() + " " + req.ip + ":" + req.originalUrl); next(); });
    _instance.getRouter     = function() { return _router; };

    var _app                = express();
    _instance.getApp        = function() { return _app; };
    _app.locals.pretty      = true;
    _app.use(_router);
    _instance.setJade       = function(path, ext) {
        ext                 = ext || "jade";
        _instance.getJade   = function(){ return path; };
        _app.set('views', path);
        _app.engine('.' + ext, require('jade').__express);
        _router.use('*.' + ext, function(req, res, next){
            res.render(path + req.originalUrl);
        });
    };

    _instance.setStatic     = function(path) {
        _instance.getStatic = function(){ return path; };
        _router.use('/', express.static(path));
    };

    _instance.set404        = function(message) {
        _instance.get404    = function(){ return message; };
        _router.use(function(req, res, next) {
            res.status(404);
            res.send(message);
        });
    };

    _instance.bindTo        = function(port) {
        _instance.getPort   = function(){ return port; };

        var _server         = _app.listen(port, function() {
            var host        = _server.address().address;
            var port        = _server.address().port;
            console.log('Example app listening at http://%s:%s', host, port);
        });
        _instance.getServer = function() { return _server; };
    };

    return _instance;
}

module.exports              = ServerController;