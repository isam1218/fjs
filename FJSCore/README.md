# FJSCore

FJS Utils and core logic

## Getting Started
### On the server
Install the module with: `npm install fjscore`

```javascript
var fjscore = require('fjscore');
fjscore.awesome(); // "awesome"
```

### In the browser
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com//fjscore/master/dist/fjscore.min.js
[max]: https://raw.github.com//fjscore/master/dist/fjscore.js

In your web page:

```html
<script src="dist/fjs.core.min.js"></script>
<script>
awesome(); // "awesome"
</script>
```

In your code, you can attach fjscore's methods to any object.

```html
<script>
var exports = Yeoman.utils;
</script>
<script src="dist/fjs.core.min.js"></script>
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
