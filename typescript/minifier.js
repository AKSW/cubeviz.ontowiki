/**
 * This small JavaScript file tells nodejs-minifier module to minify Main.js.
 */
var compressor = require('node-minify');

// Using YUI Compressor for JS
new compressor.minify({
    type: 'yui-js',
    fileIn: '../public/javascript/Main.js',
    fileOut: '../public/javascript/Main-production.js',
    callback: function(err){
        console.log(err);
    }
});
