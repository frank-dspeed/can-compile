var path = require('path');
var semver = require('semver');
var Handlebars = require('handlebars');
var versionMap = require('./version-map.json');

var defaultPaths = {
  'jquery': Handlebars.compile('http://ajax.googleapis.com/ajax/libs/jquery/{{version}}/jquery.min.js'),
  'can': Handlebars.compile('http://canjs.com/release/{{version}}/can.jquery.js'),
  'ejs': Handlebars.compile('http://canjs.com/release/{{version}}/can.ejs.js'),
  'mustache': Handlebars.compile('http://canjs.com/release/{{version}}/can.view.mustache.js'),
  'stache': Handlebars.compile('http://canjs.com/release/{{version}}/can.stache.js')
};

// Fix Redirects
function fixPaths(canVersion) {
  defaultPaths.can = defaultPaths.can.replace('canjs.com', canVersion+'.canjs.com');
  defaultPaths.ejs = defaultPaths.ejs.replace('canjs.com', canVersion+'.canjs.com');
  defaultPaths.mustache = defaultPaths.mustache.replace('canjs.com', canVersion+'.canjs.com');
  defaultPaths.stache = defaultPaths.stache.replace('canjs.com', canVersion+'.canjs.com');
}

if (defaultPaths.can.indexOf('2.') > -1) { 
  fixPaths('v2')
} else {
  fixPaths('v3')
}

var getScriptFromPath = function(scriptPath) {
  return path.resolve(process.cwd(), path.normalize(scriptPath));
};

var getjQuery = function(canVersion, paths) {
  if(paths && paths.jquery) {
    return getScriptFromPath(paths.jquery);
  } else {
    for(var jqVersion in versionMap.jquery) {
      if(semver.satisfies(canVersion, versionMap.jquery[jqVersion])){
        return defaultPaths.jquery({
          version: jqVersion
        });
      }
    }
  }
};

var getScript = function(canVersion, script, paths) {
  if(paths && paths[script]) {
    return getScriptFromPath(paths[script]);
  } else {
    return defaultPaths[script]({
      version: canVersion
    });
  }
};

var getPlugins = function(canVersion, paths) {
  var plugins = [];
  for(var plugin in versionMap.plugins) {
    if(semver.satisfies(canVersion, versionMap.plugins[plugin])){
      plugins.push(getScript(canVersion, plugin, paths));
    }
  }
  return plugins;
};

module.exports = function(version, paths) {
  var scripts = [];
  scripts.push(getjQuery(version, paths));
  scripts.push(getScript(version, 'can', paths));
  scripts = scripts.concat(getPlugins(version, paths));
  return scripts;
};
