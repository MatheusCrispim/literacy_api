'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.deleteContext = exports.getContext = exports.getContexts = exports.updateContext = exports.addContext = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _httpStatusCodes = require('http-status-codes');

var _httpStatusCodes2 = _interopRequireDefault(_httpStatusCodes);

var _context = require('../models/context');

var _user = require('../models/user');

var _server = require('../server.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var fileType = require('file-type');
var crypto = require('crypto');
var addContext = exports.addContext = function addContext(req, res) {
    var image = saveImageContext(req.body.image, req);
    var name = req.body.name;
    var video = req.body.video;
    var sound = "";

    if (req.body.sound_base64) {
        sound = saveAudioContext(req.body.sound_base64, req);
    } else {
        sound = req.body.sound;
    }

    // const author = req.body.author
    var data = {
        name: name,
        sound: sound,
        video: video,
        image: image,
        authorId: req.user.id
    };
    _context.Context.create(data).then(function (context) {
        res.status(_httpStatusCodes2.default.CREATED).json(context).send();
    }).catch(function (error) {
        console.log(error);
        res.status(_httpStatusCodes2.default.BAD_REQUEST).json(responseErroCatch(_httpStatusCodes2.default.BAD_REQUEST)).send();
    });
};

var updateContext = exports.updateContext = function updateContext(req, res) {
    var id = req.params.id;
    _context.Context.findById(id).then(function (context) {
        if (context) {
            var image = saveImageContext(req.body.image, req);
            var name = req.body.name;
            var video = req.body.video;
            var sound = "";

            if (req.body.sound_base64) {
                sound = saveAudioContext(req.body.sound_base64, req);
            } else {
                sound = req.body.sound;
            }

            var data = { name: name,
                sound: sound,
                video: video,
                image: image };
            context.update(data).then(function () {
                res.status(_httpStatusCodes2.default.OK).json(context).send();
            }).catch(function (error) {
                res.status(_httpStatusCodes2.default.BAD_REQUEST).json(responseErroCatch(_httpStatusCodes2.default.BAD_REQUEST)).send();
            });
        } else {
            res.status(_httpStatusCodes2.default.NOT_FOUND).json(responseNotFoundContext()).send();
        }
    });
};

var getContexts = exports.getContexts = function getContexts(req, res) {
    _context.Context.findAll({ include: { model: _user.User, attributes: { exclude: ATTRIBUTES_EXCLUDE_USER } },
        attributes: { exclude: ['authorId'] } }).then(function (contexts) {
        res.status(_httpStatusCodes2.default.OK).json(contexts).send();
    });
};

var getContext = exports.getContext = function getContext(req, res) {
    var id = req.params.id;
    _context.Context.findById(id, { include: { model: _user.User, attributes: { exclude: ATTRIBUTES_EXCLUDE_USER } },
        attributes: { exclude: ['authorId'] } }).then(function (context) {
        if (context) {
            res.status(_httpStatusCodes2.default.OK).json(context).send();
        } else {
            res.status(_httpStatusCodes2.default.NOT_FOUND).json(responseNotFoundContext()).send();
        }
    });
};

var deleteContext = exports.deleteContext = function deleteContext(req, res) {
    var id = req.params.id;
    _context.Context.findById(id).then(function (context) {
        if (context) {
            context.destroy().then(function () {
                res.status(_httpStatusCodes2.default.OK).json(context).send();
            });
        } else {
            res.status(_httpStatusCodes2.default.NOT_FOUND).json(responseNotFoundContext()).send();
        }
    });
};

function responseErroCatch(code) {
    var erro = { error: _httpStatusCodes2.default.getStatusText(code) };
    return erro;
}

function responseNotFoundContext() {
    return { error: CONTEXT_NOT_FOUND };
}

var CONTEXT_NOT_FOUND = "contexto not found";
var ATTRIBUTES_EXCLUDE_USER = ['password', 'createdAt', 'updatedAt'];

function saveImageContext(codeBase64, req) {
    if (!codeBase64) return null;
    var buffer = new Buffer(codeBase64, 'base64');
    var imageExtension = fileType(buffer).ext;
    var imageName = generateContextName();
    imageName = imageName + '.' + imageExtension;
    fs.writeFileSync(BASE_URL_CONTEXT + imageName, buffer);
    return (0, _server.getAbsoluteUri)(req) + BASE_URL_CONTEXT_IMAGE + imageName;
}

function saveAudioContext(codeBase64, req) {
    if (!codeBase64) return null;
    var buffer = new Buffer(codeBase64, 'base64');
    var audioExtension = fileType(buffer).ext;
    var audioName = generateContextName();
    audioName = audioName + '.' + audioExtension;
    fs.writeFileSync(BASE_DIR_AUDIO_CONTEXT + audioName, buffer);
    return (0, _server.getAbsoluteUri)(req) + BASE_URL_AUDIO_CONTEXT + audioName;
}

function generateContextName() {
    while (true) {
        var currentDate = new Date().valueOf().toString();
        var random = Math.random().toString();
        var contextName = crypto.createHash('md5').update(currentDate + random).digest('hex');
        if (!fs.existsSync(BASE_URL_CONTEXT + contextName)) {
            return contextName;
        }
    }
}

var BASE_URL_CONTEXT_IMAGE = '/static/images/';
var BASE_URL_CONTEXT = 'public/images/';

var BASE_URL_AUDIO_CONTEXT = '/static/sounds/';
var BASE_DIR_AUDIO_CONTEXT = 'public/sounds/';