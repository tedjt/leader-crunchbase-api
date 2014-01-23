
var assert = require('assert');
var plugin = require('..');
var CrunchbaseApi = require('crunchbase-api');

describe('leader-crunchbase-api', function () {
  this.timeout(30000); // scraping takes time
  before(function (done) {
    var api = new CrunchbaseApi();
    api.setKey('9x75rxx54sqpsrycunct2ryq');
    this.plugin = plugin(api);
    done();
  });

  it('should wait if theres no company name', function () {
    var context = {}, person = {};
    assert(!this.plugin.wait(person, context));
  });

  it('should not wait if there is a company name', function () {
    var person = { company: { name: 'segment.io'}};
    var context = {};
    assert(this.plugin.wait(person, context));
  });

  it('should be able to resolve a valid crunchbase company profile', function (done) {
    var person = { company: { name: 'segment.io'}};
    var context = {};
    this.plugin.fn(person, context, function (err) {
      if (err) return done(err);
      assert(person);
      assert(person.company.crunchbase_url === 'http://www.crunchbase.com/company/segment-io');
      done();
    });
  });
});