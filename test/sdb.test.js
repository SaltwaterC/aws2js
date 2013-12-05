'use strict';

/*global describe: true, it: true, before: true, after: true*/

var assert = require('chai').assert;

describe('Tests executed on SDB', function() {
	// define the credentials & service class
	var accessKeyId = process.env.AWS_ACCEESS_KEY_ID;
	var secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
	var SDB = require('../lib/load.js').SDB;

	var handleResponse = function(err, res, done) {
		assert.ifError(err);
		
		assert.ok(res.ResponseMetadata);
		assert.ok(res.ListDomainsResult);

		done();
	};

	describe('REMOTE SDB test without query argument', function() {
		it('should make a succesful SDB request', function(done) {
			var sdb = new SDB(accessKeyId, secretAccessKey);
			sdb.request('ListDomains', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

	describe('REMOTE SDB test with empty query argument', function() {
		it('should make a succesful SDB request', function(done) {
			var sdb = new SDB(accessKeyId, secretAccessKey);
			sdb.request('ListDomains', {}, function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});
	
	describe('REMOTE SDB test with explicit us-east-1', function() {
		it('should make a succesful SDB request', function(done) {
			var sdb = new SDB(accessKeyId, secretAccessKey, 'us-east-1');
			sdb.request('ListDomains', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});
	
	describe('REMOTE SDB test with us-west-1', function() {
		it('should make a succesful SDB request', function(done) {
			var sdb = new SDB(accessKeyId, secretAccessKey, 'us-west-1');
			sdb.request('ListDomains', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});
	
	describe('REMOTE SDB test with setRegion us-east-1', function() {
		it('should make a succesful SDB request', function(done) {
			var sdb = new SDB(accessKeyId, secretAccessKey);
			sdb.setRegion('us-east-1');
			sdb.request('ListDomains', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});
	
	describe('REMOTE SDB test with setRegion us-west-1', function() {
		it('should make a succesful SDB request', function(done) {
			var sdb = new SDB(accessKeyId, secretAccessKey);
			sdb.setRegion('us-west-1');
			sdb.request('ListDomains', function(err, res) {
				handleResponse(err, res, done);
			});
		});
	});

});
