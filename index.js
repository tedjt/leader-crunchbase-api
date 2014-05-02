var debug = require('debug')('leader:crunchbase:api');
var map = require('map');
var extend = require('extend');
var CrunchBase = require('crunchbase-api');
var leaderUtils = require('leader-utils');
var objCase = leaderUtils.objcase;
var Crawler = require('htmlcrawler');

/**
 * Create a new leader plugin.
 *
 * @params {String} apiKey
 * @returns {Object}
 */

module.exports = function (apiKey) {
  return { fn: middleware(apiKey), wait: wait };
};

module.exports.test = {
  accurateName: accurateName
};

/**
 * Create a CrunchBase API leader plugin.
 *
 * @return {String} apiKey
 * @return {Function}
 */

function middleware (apiKey) {
  var crunchbase = CrunchBase(apiKey);
  var crawler = new Crawler();
  return function crunchbaseApi (person, context, next) {
    var crunchbaseUrl = getCrunchbaseUrl(person);
    var query = null;
    var isDomain = false;
    if (!crunchbaseUrl) {
      query = getSearchTerm(person, context);
      if (!query) return next();
    }
    // define callback
    var cb = function (err, profile) {
      if (err) return next();
      if (!profile) return next();
      debug('query=%s, crunchbaseUrl=%s ', query, crunchbaseUrl);

      if (accurateName(profile, query, isDomain)) {
        debug('Got CrunchBase company profile for query %s', query);
        // have to load crunchbase image from cdn
        crawler.load(profile.crunchbase_url, function(err, $) {
          profile.cdn_image = $('img.entity-info-card-primary-image').attr('src');
          extend(true, context, { crunchbase: { company: { api : profile }}});
          details(profile, person);
          next();
        });
      } else {
        debug('Not storing crunchbase profile with name %s for query %s', profile.name, query);
        next();
      }
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
      isDomain = (query === getDomainQuery(person));
      debug('scraping CrunchBase with query %s ..', query);
      crunchbase.company(query, isDomain, cb);
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
    'website': 'homepage_url',
    'crunchbase.url': 'crunchbase_url',
    'funding': 'total_money_raised',
    'twitter.username': 'twitter_username'
  }));

  if (profile.cdn_image) {
    person.company.image = profile.cdn_image;
  } else {
    var crunchimage = objCase(profile, 'image.available_sizes[0][1]');
    if (crunchimage) {
      if (crunchimage.indexOf('http') === 0) {
        person.company.image = crunchimage;
      } else {
        person.company.image = 'http://www.crunchbase.com/' + crunchimage;
      }
    }
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

function accurateName (profile, query, isDomain) {
  if (isDomain && profile.homepage_url) {
    return query === leaderUtils.getCleanDomain(profile.homepage_url);
  } else {
    return profile.name && leaderUtils.accurateTitle(profile.name, query);
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
  var company = leaderUtils.getCompanyName(person);
  var domain = leaderUtils.getInterestingDomain(person);
  var companyDomain = leaderUtils.getCompanyDomain(person);
  return companyDomain || domain || company;
}

function getDomainQuery (person) {
  var domain = leaderUtils.getInterestingDomain(person);
  var companyDomain = leaderUtils.getCompanyDomain(person);
  return companyDomain || domain;
}