var fs = require('fs')
var ngswconfig = 'dist/D97/ngsw.json';
fs.readFile(ngswconfig, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/"\//g, '"');

  fs.writeFile(ngswconfig, result, 'utf8', function (err) {
     if (err) return console.log(err);
  });
});
