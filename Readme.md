
# leader-crunchbase-company-scraper

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

## API

#### CrunchBase(apiKey)

  Return a Leader plugin for the CrunchBase company API.
