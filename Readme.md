
# leader-crunchbase-company-scraper

  A [Crunchbase](https://crunchbase.com/) company scraper plugin for [leader](https://github.com/ivolo/leader).

## Example

```js
var Leader = require('leader');
var CrunchbaseApi = require('crunchbase-api');
var crunchbaseCompany = require('leader-crunchbase-api');

var leader = Leader();

var crunchbase = new CrunchbaseApi();
crunchbase.setKey(apiKey);
leader.use(crunchbaseCompany(crunchbase))
  .populate({ company: { name: 'segment.io'}}, function(err, person) {
    console.log(person.company.crunchbase_url);
});
```

## API

#### crunchbaseCompany(crunchbase)

  Return a Crunchbase api plugin for leader.
