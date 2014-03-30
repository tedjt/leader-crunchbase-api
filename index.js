var debug = require('debug')('leader:crunchbase:api');
var map = require('map');
var extend = require('extend');
var objCase = require('obj-case');
var CrunchBase = require('crunchbase-api');
var Levenshtein = require('levenshtein');

/**
 * Create a new leader plugin.
 *
 * @params {String} apiKey
 * @returns {Object}
 */

module.exports = function (apiKey) {
  return { fn: middleware(apiKey), wait: wait, test: {mergeProfile: mergeProfile} };
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
    var crunchbaseUrl = getCrunchbaseUrl(person);
    var query = null;
    if (!crunchbaseUrl) {
      query = getSearchTerm(person, context);
      if (!query) return next();
    }
    // define callback
    var cb = function (err, profile) {
      if (err) return next();
      if (!profile) return next();
      console.log('Query: %s, crunchbaseUrl: %s ', query, crunchbaseUrl);
      if (mergeProfile(profile, query)) {
        debug('Got CrunchBase company profile for query %s', query);
        extend(true, context, { crunchbase: { company: { api : profile }}});
        details(profile, person);
      } else {
        debug('Not storing crunchbase profile with name %s for query %s', profile.name, query);
      }
      next();
    };

    // decide to search with query or crunchbase url
    if (crunchbaseUrl) {
      var splitUrl = crunchbaseUrl.split('/').slice(-2);
      var namespace = splitUrl[0];
      var permalink = splitUrl[1];
      query = getSearchTerm(person, context) || permalink;
      debug('scraping CrunchBase with permalink %s ..', permalink);
      crunchbase.permalink(permalink, namespace, cb);
    } else {
      debug('scraping CrunchBase with query %s ..', query);
      crunchbase.company(query, cb);
    }
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
    'name': 'name',
    'tags': 'tag_list',
    'employees': 'number_of_employees',
    'category': 'category_code',
    'crunchbase.url': 'crunchbase_url',
    'funding': 'total_money_raised',
    'twitter.username': 'twitter_username'
  }));

  var crunchimage = profile.image && profile.image.available_sizes;
  if (crunchimage && crunchimage.length && crunchimage[0].length > 1) {
    person.company.image = 'http://www.crunchbase.com/' + crunchimage[0][1];
  }

  if (profile.external_links) {
    person.company.links = person.company.links || [];
    profile.external_links.forEach(function (item) {
      person.company.links.push({ title: item.title, link: item.external_url });
    });
  }
}

/**
 * Sanity check the Crunchbase profile
 *
 * @param {Object} profile
 * @param {String} query
 */

function mergeProfile (profile, query) {
  var name = objCase(profile, 'name');
  if (name) {
    var lev = new Levenshtein(name, query);
    if (lev.distance < 10) {
      return true;
    }
  }
  return false;
}

/**
 * Wait until we have an interesting search term.
 *
 * @param {Object} context
 * @param {Object} person
 * @return {Boolean}
 */

function wait (person, context) {
  return getCrunchbaseUrl(person) || getSearchTerm(person, context);
}

function getCrunchbaseUrl(person) {
  return objCase(person, 'company.crunchbase.url');
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
  return company || domain;
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
