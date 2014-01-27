
# leader-crunchbase-api

  A [leader](https://github.com/ivolo/leader) plugin for the [Crunchbase](https://crunchbase.com/) company API. Get a Crunchbase API key [here](http://developer.crunchbase.com/).

## Example

```js
var Leader = require('leader');
var CrunchBase = require('leader-crunchbase-api');

var leader = Leader()
  .use(CrunchBase('CRUNCHBASE_API_KEY'))
  .populate({ company: { name: 'segment.io'}}, function(err, person) {
    // ..
});
```

It will search Crunchbase for the following keys: `company.name`, `domain.name`, or `linkedin.summary`. 

And it will add the following to the `person`:

```js
{
  // ..
  company: {
    name: 'segment.io',
    tags: 'analytics, api, web-analytics, developer, mixpanel, google-analytics, kissmetric... ',
    employees: 8,
    category: 'analytics',
    crunchbase: {
      url: 'http://www.crunchbase.com/company/segment-io'
    },
    funding: '$600k'
  }
}
```

## API

#### CrunchBase(apiKey)

  Return a Leader plugin for the CrunchBase company API.
