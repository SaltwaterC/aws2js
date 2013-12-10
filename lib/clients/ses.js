'use strict';

var qs = require('querystring');
var ring = require('ring');

var conf = require('../../config/conf.js');
var Query = require('../core/query.js');
var SignV3 = require('../core/signv3.js');

module.exports = ring.create([Query, SignV3], {
	constructor: function(accessKeyId, secretAccessKey) {
		this.$super({
			endPoint: 'email.us-east-1.amazonaws.com',
			accessKeyId: String(accessKeyId),
			secretAccessKey: String(secretAccessKey),
			apiVersion: this.getVersions().SES
		});
	}

	// Next: Methods for wrapping Query.request('Action')
});
