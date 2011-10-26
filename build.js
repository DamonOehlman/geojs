var interleave = require('interleave'),
    config = {
        aliases: {
            cog: 'github://DamonOehlman/cog/cogs/$1',
            timelord: 'github://DamonOehlman/timelord/timelord.js'
        }
    };

// build each of the builds
interleave('src/', {
    multi: 'pass',
    path: 'lib',
    config: config
});

interleave('src/plugins/', {
    multi: 'pass',
    path: 'lib/plugins/',
    config: config
});
