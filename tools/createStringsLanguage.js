const fs = require('fs');
const path = require("path")

var fileNames = [
    'de.json',
    'missingTranslations.json'
];
var dir = __dirname + "/../src/assets/i18n";
var resp = {};
for(var i = 0; i < fileNames.length; i++) {
    var json = {};
    var file = fs.readFileSync(path.join(dir,fileNames[i]), { encoding : 'utf8' });
    var json = JSON.parse(file);
    var k = Object.keys(json);
    for(var x=0; x<k.length; x++) {
        resp[k[x]] = k[x];
    }
}
fs.writeFile(dir + "/strings.json", JSON.stringify(resp, null, 4), function(i,err) {
    console.log("The file strings.json was saved!");
}.bind(this, i));
