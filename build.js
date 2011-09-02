var interleave = require('interleave'),
    config = {
        aliases: {
            cog: 'github://sidelab/cog/cogs/$1'
        }
    };

// build each of the builds
interleave('src/geojs', {
    multi: 'pass',
    path: 'lib',
    config: config
});

interleave('src/plugins/', {
    multi: 'pass',
    path: 'lib/plugins/',
    config: config
});
