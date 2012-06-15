var assert = require('assert');
var cloudfront = require('../').load('cloudfront', process.env.AWS_ACCEESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

var distributionId = process.env.AWS_DISTRIBUTION_ID;

var callbacks = {
  getDistributions : false,
  getDistribution  : false,
  postInvalidation : false,
  getInvalidations : false,
  getInvalidation  : false
};

cloudfront.getDistributions(function(err, res) {
  assert.ifError(err);
  assert.ok(res.Quantity > 0);
  callbacks.getDistributions = true;
});

cloudfront.getDistribution(distributionId, function(err, res) {
  assert.ifError(err);
  assert.equal(res.Id, distributionId);
  callbacks.getDistribution = true;
});

cloudfront.invalidate(distributionId, '/no-such-path-but-never-mind', new Date().getTime(), function(res) {
  assert.equal(res.code, 201);
  callbacks.postInvalidation = true;

  var invalidationId = res.document.Id;

  cloudfront.getInvalidations(distributionId, function(err, res) {
    assert.ifError(err);
    assert.ok(res.Quantity > 0);
    var found = res.Items.InvalidationSummary.filter(function (summary) {return summary.Id === invalidationId}).length;
    assert.ok(found === 1);
    callbacks.getInvalidations = true;
  });

  cloudfront.getInvalidation(distributionId, invalidationId, function(err, res) {
    assert.ifError(err);
    assert.equal(res.Id, invalidationId);
    callbacks.getInvalidation = true;
  });
});

process.on('exit', function () {
	for (var i in callbacks) {
		assert.ok(callbacks[i]);
	}
});
