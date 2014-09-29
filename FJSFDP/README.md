# FJSFDP

The best commonjs module ever.

## Getting Started
### On the server
Install the module with: `npm install fjsfdp`

```javascript
var fjsfdp = require('fjsfdp');
fjsfdp.awesome(); // "awesome"
```

### In the browser
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com//fjsfdp/master/dist/fjsfdp.min.js
[max]: https://raw.github.com//fjsfdp/master/dist/fjsfdp.js

In your web page:

```html
<script src="dist/fjsfdp.min.js"></script>
<script>
awesome(); // "awesome"
</script>
```

In your code, you can attach fjsfdp's methods to any object.

```html
<script>
var exports = Yeoman.utils;
</script>
<script src="dist/fjsfdp.min.js"></script>
<script>
Yeoman.utils.awesome(); // "awesome"
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(Nothing yet)_

## License
 
 Copyright (c) 2014 Fonality. Licensed under the Fonality License license.
