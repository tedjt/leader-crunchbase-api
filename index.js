
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
    var query = getSearchTerm(person, context);
    if (!query) return next();
    debug('scraping CrunchBase with query %s ..', query);
    crunchbase.company(query, function (err, profile) {
      if (err) return next();
      if (!profile) return next();
      extend(true, context, { crunchbase: { company: { api : profile }}});
      details(profile, person);
      debug('Got CrunchBase company profile for query %s', query);
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
  person.company = person.company || {};
  extend(true, person.company, map(profile, {
    'tags': 'tag_list',
    'employees': 'number_of_employees',
    'category': 'category_code',
    'crunchbase.url': 'crunchbase_url',
    'funding': 'total_money_raised',
    'twitter.username': 'twitter_username'
  }));

  var crunchimage = profile.image && profile.image.available_sizes;
  if (crunchimage && crunchimage.length && crunchimage[0].length > 1) {
    company.image = 'http://www.crunchbase.com/' + crunchimage[0][1];
  }

  if (profile.external_links) {
    person.company.links = person.company.links || [];
    profile.external_links.forEach(function (item) {
      person.company.links.push({ title: item.title, link: item.external_url });
    });
  }
}

/**
 * Wait until we have an interesting search term.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {Boolean}
 */

function wait (person, context) {
  return getSearchTerm(person, context);
}

/**
 * Get the CrunchBase search term.
 *
 * @param {Object} person
 * @param {Object} context
 * @return {String}
 */

function getSearchTerm (person, context) {
  var company = getCompanyName(person, context);
  var domain = getInterestingDomain(person, context);
  var summary = getLinkedinSummary(person, context);
  return company || domain || summary;
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

/**
 * Get an interesting domain.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {String}
 */

function getInterestingDomain (person, context) {
  if (person.domain && !person.domain.disposable && !person.domain.personal)
    return person.domain.name;
  else
    return null;
}

/**
 * Get a linkedin summary.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {String}
 */

function getLinkedinSummary (person, context) {
  return objCase(person, 'linkedin.summary');
}

