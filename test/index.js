
var assert = require('assert');
var should = require('should');
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

  it('should merge profile if the name is similar', function () {
    var profile = {name: 'Machine Zone, Inc.'};
    assert(crunchbase.test.mergeProfile(profile, 'MachineZone'));
  });

  it('should not merge profile if the name is not similar', function () {
    var profile = {name: 'Homes for sale in Franklin TN'};
    assert(!crunchbase.test.mergeProfile(profile, 'Premier Pacific Group'));
  });

  it('should be able to resolve a valid crunchbase company profile', function (done) {
    var person = { company: { name: 'segment.io'}};
    var context = {};
    crunchbase.fn(person, context, function (err) {
      if (err) return done(err);
      assert(person);
      assert(person.company.crunchbase.url === 'http://www.crunchbase.com/company/segment-io');
      assert(person.company.image == 'http://www.crunchbase.com/assets/images/resized/0023/1718/231718v2-max-150x150.png');
      done();
    });
  });

  it('should be able to resolve a valid crunchbase company profile for financial institutions', function (done) {
    var person = { company: { name: 'Khosla Ventures'}};
    var context = {};
    crunchbase.fn(person, context, function (err) {
      if (err) return done(err);
      assert(person);
      person.company.crunchbase.url.should.equal('http://www.crunchbase.com/financial-organization/khosla-ventures');
      person.company.image.should.equal('http://www.crunchbase.com/assets/images/resized/0000/1507/1507v2-max-150x150.png');
      done();
    });
  });

  it('should be able to resolve a valid crunchbase company profile from url', function (done) {
    var person = { company: { name: 'IGate',  crunchbase: {url: 'http://www.crunchbase.com/company/igate-patni'}}};
    var context = {};
    crunchbase.fn(person, context, function (err) {
      if (err) return done(err);
      assert(person);
      person.company.crunchbase.url.should.equal('http://www.crunchbase.com/company/igate-patni');
      person.company.employees.should.equal(15000);
      person.company.image.should.equal('http://www.crunchbase.com/assets/images/resized/0014/9354/149354v2-max-150x150.jpg');
      done();
    });
  });
});
