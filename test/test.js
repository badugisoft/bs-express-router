var express = require('express');
var router = require('../lib/router')('test/controller');

console.log(router.stack);