({
    baseUrl: "src/scripts/",
    paths: {
        jquery:     'vendor/jquery/dist/jquery.min',
        underscore: 'vendor/underscore/underscore-min',
        parse:      'vendor/parse/parse.min',
        text:       'vendor/requirejs-text/text',
        snapjs:     'vendor/Snap.js/dist/latest/snap.min',
        fastclick:  'vendor/fastclick/lib/fastclick',
        async:      'vendor/requirejs-plugins/src/async',
        masks:      'vendor/jquery-mask-plugin/dist/jquery.mask.min',
        Swiper:     'vendor/swiper/dist/js/swiper.jquery.umd.min',
        bootstrap:  'vendor/bootstrap/dist/js/bootstrap.min',
        slider:     'vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min',
        stripe:     'https://js.stripe.com/v2/?1',
        facebook:   'http://connect.facebook.net/en_US/all',
    },
    name: "main",

    optimize: "uglify2",
    uglify2: {
        output: {
            beautify: false
            // beautify: true
        },
        compress: {
            sequences: true,
            // sequences: false,
            global_defs: {
                DEBUG: false
            }
        },
        warnings: true,
        mangle: true
        // mangle: false
    }
})