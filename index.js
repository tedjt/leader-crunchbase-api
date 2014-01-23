
var debug = require('debug')('leader:crunchbase:api');
var map = require('map');
var extend = require('extend');
var objCase = require('obj-case');

/**
 * Expose the leader `middleware`.
 */

module.exports = function (crunchbase) {
  return { fn: middleware(crunchbase), wait: wait };
};

/**
 * Create a crunchbase company api middleware.
 *
 * @return {crunchbaseApi} crunchbase
 * @return {Function}
 */

function middleware (crunchbase) {
  return function companyApi (person, context, next) {
    var name = getCompanyName(person, context);
    if (!name) return next();
    debug('scraping Crunchbase company profile with name %s ..', name);
    crunchbase.company(name, function (err, profile) {
      if (err) return next(err);
      if (!profile) return next();
      extend(true, context, { crunchbase: { company: { api : profile }}});
      details(profile, person);
      debug('crunchbase company profile scraped from name %s', name);
      next();
    });
  };
}

/**
 * Copy the crunchbase company `profile` details to the `person.company`.
 *
 * @param {Object} profile
 * @param {Object} person
 */

function details (profile, person) {
  var company = person.company;
  extend(true, company, map(profile, {
    'tags': 'tag_list',
    'employee_count': 'number_of_employees',
    'category': 'category_code',
    'crunchbase_url': 'crunchbase_url',
    'funding': 'total_money_raised'
  }));
}

/**
 * Wait until we have a company name
 *
 * @param {Object} context
 * @param {Object} person
 * @return {Boolean}
 */

function wait (person, context) {
  var companyName = getCompanyName(person, context);
  return objCase(person, 'linkedin.summary') || 
    (companyName && companyName != 'Google');
}

/**
 * Get the crunchbase company name.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {String}
 */

function getCompanyName (person, context) {
  return objCase(person, 'company.name');
}
