function AWS (endPoint, accessKeyId, secretAccessKey) {
	// XXX validate the credentials
	this.endPoint = endPoint;
	this.accessKeyId = accessKeyId;
	this.secretAccessKey = secretAccessKey;
}

AWS.prototype.setMaxSockets = function (value) {
	require('http').Agent.defaultMaxSockets = value;
	return this;
};

AWS.prototype.getEndPoint = function () {
	return this.endPoint;
};

AWS.prototype.setEndPoint = function (endPoint) {
	this.endPoint = endPoint;
};

module.exports = AWS;
