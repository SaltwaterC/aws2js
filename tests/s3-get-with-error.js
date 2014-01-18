'use strict';

var common = require('./includes/common.js');
var assert = require('assert');
var s3 = require('../').load('s3');
var fs = require('fs');

function wrap(name) {
    var fn = fs[name];
    wrap[name] = 0;
    fs[name] = function () {
        wrap[name]++
        fn.apply(null, arguments);
    };
}

wrap('close');
wrap('open');

var callbacks = {
	get: 0
};

s3.setCredentials(process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
s3.setBucket(process.env.AWS2JS_S3_BUCKET);

s3.get('SOME_FILE_THAT_DOESNT_EXIST', { file : 'meoww.txt' }, function () {
    callbacks.get++;
    assert.equal(wrap.close, wrap.open, 'Not all file descriptors are closed');
});
common.teardown(callbacks);
