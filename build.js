var interleave = require('interleave'),
    config = {
        aliases: {
            cog: '/development/projects/github/sidelab/cog/cogs/$1',
            timelord: '/development/projects/github/DamonOehlman/timelord/timelord' // 'github://sidelab/cog/cogs/$1'
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
