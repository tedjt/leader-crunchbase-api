
var assert = require('assert');
var plugin = require('..');

describe('leader-crunchbase-api', function () {

  var crunchbase = plugin('9x75rxx54sqpsrycunct2ryq');

  it('should wait if theres no company name', function () {
    var context = {}, person = {};
    assert(!crunchbase.wait(person, context));
  });

  it('should not wait if there is a company name', function () {
    var person = { company: { name: 'segment.io'}};
    var context = {};
    assert(crunchbase.wait(person, context));
  });

  it('should be able to resolve a valid crunchbase company profile', function (done) {
    var person = { company: { name: 'segment.io'}};
    var context = {};
    crunchbase.fn(person, context, function (err) {
      if (err) return done(err);
      assert(person);
      assert(person.company.crunchbase.url === 'http://www.crunchbase.com/company/segment-io');
      done();
    });
  });
});