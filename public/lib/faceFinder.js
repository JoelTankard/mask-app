faceFinder = {}
faceFinder.find = function(pico, cb) {
    var facefinder_classify_region = function(r, c, s, pixels, ldim) {return -1.0;};
    var cascadeurl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
    fetch(cascadeurl).then(function(response) {
        response.arrayBuffer().then(function(buffer) {
            var bytes = new Int8Array(buffer);
            facefinder_classify_region = pico.unpack_cascade(bytes);
            cb(facefinder_classify_region)
        })
    })
}