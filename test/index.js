
var assert = require('assert');
var should = require('should');
var plugin = require('..');

describe('leader-crunchbase-api', function () {
  this.timeout(1000 * 60);

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
    assert(plugin.test.accurateName(profile, 'MachineZone'));
  });

  it('should not merge profile if the name is not similar', function () {
    var profile = {name: 'Homes for sale in Franklin TN'};
    assert(!plugin.test.accurateName(profile, 'Premier Pacific Group'));
  });

  it('should be able to resolve a valid crunchbase company profile', function (done) {
    var person = { company: { name: 'segment.io'}};
    var context = {};
    crunchbase.fn(person, context, function (err) {
      if (err) return done(err);
      console.log(person);
      assert(person);
      assert(person.company.crunchbase.url === 'http://www.crunchbase.com/company/segment-io');
      //person.company.image.should.eql('http://www.crunchbase.com/assets/images/resized/0023/1718/231718v2-max-150x150.png');
      person.company.image.should.eql('http://res.cloudinary.com/crunchbase-production/image/upload/c_pad,h_98,w_98/v1397196203/6c25e58fabe57e3705b985cf85bc401d.png');
      done();
    });
  });

  it('should be able to resolve a valid crunchbase company profile for financial institutions', function (done) {
    var person = { company: { name: 'Khosla Ventures'}};
    var context = {};
    crunchbase.fn(person, context, function (err) {
      if (err) return done(err);
      console.log(person);
      assert(person);
      person.company.crunchbase.url.should.equal('http://www.crunchbase.com/financial-organization/khosla-ventures');
      //person.company.image.should.equal('http://www.crunchbase.com/assets/images/resized/0000/1507/1507v2-max-150x150.png');
      person.company.image.should.equal('http://res.cloudinary.com/crunchbase-production/image/upload/c_pad,h_98,w_98/v1397178514/1ff1b345e5199452a5d37661ec0e7682.png');
      done();
    });
  });

  it('should be able to resolve a valid crunchbase company profile from url', function (done) {
    var person = { company: { name: 'IGate',  crunchbase: {url: 'http://www.crunchbase.com/company/igate-patni'}}};
    var context = {};
    crunchbase.fn(person, context, function (err) {
      if (err) return done(err);
      console.log(person);
      assert(person);
      person.company.crunchbase.url.should.equal('http://www.crunchbase.com/company/igate-patni');
      person.company.employees.should.equal(15000);
      //person.company.image.should.equal('http://www.crunchbase.com/assets/images/resized/0014/9354/149354v2-max-150x150.jpg');
      person.company.image.should.equal('http://res.cloudinary.com/crunchbase-production/image/upload/c_pad,h_98,w_98/v1397198699/c3b7b0b2c00f5727c4f31f66efc0baf5.jpg');
      done();
    });
  });

  it('should be able to filter a crunchbase url for operator.com', function (done) {
    var person = { domain: { name: 'operator.com' }};
    var context = {};
    crunchbase.fn(person, context, function (err) {
      if (err) return done(err);
      console.log(person);
      assert(person);
      assert(!person.company);
      done();
    });
  });
});
