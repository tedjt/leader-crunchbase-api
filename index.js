
var debug = require('debug')('leader:crunchbase:api');
var map = require('map');
var extend = require('extend');
var objCase = require('obj-case');
var CrunchBase = require('crunchbase-api');

/**
 * Create a new leader plugin.
 *
 * @params {String} apiKey
 * @returns {Object}
 */

module.exports = function (apiKey) {
  return { fn: middleware(apiKey), wait: wait };
};

/**
 * Create a CrunchBase API leader plugin.
 *
 * @return {String} apiKey
 * @return {Function}
 */

function middleware (apiKey) {
  var crunchbase = CrunchBase(apiKey);
  return function crunchbaseApi (person, context, next) {
    var name = getCompanyName(person, context);
    if (!name) return next();
    debug('scraping Crunchbase company profile with name %s ..', name);
    crunchbase.company(name, function (err, profile) {
      if (err) return next();
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
    'employees': 'number_of_employees',
    'category': 'category_code',
    'crunchbase.url': 'crunchbase_url',
    'funding': 'total_money_raised'
  }));
}

/**
 * Wait until we have a company name.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {Boolean}
 */

function wait (person, context) {
  var company = getCompanyName(person, context);
  return objCase(person, 'linkedin.summary') ||
    (company && company !== 'Google');
}

/**
 * Get the company name.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {String}
 */

function getCompanyName (person, context) {
  return objCase(person, 'company.name');
}
