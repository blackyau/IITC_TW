// ==UserScript==
// @id             iitc-plugin-highlight-portals-high-level
// @name           IITC plugin: highlight high level portals
// @category       Highlighter
// @version        0.1.0.20151009.125421
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://raw.githubusercontent.com/ifchen0/IITC_TW/master/build/local/plugins/portal-highlighter-high-level.meta.js
// @downloadURL    https://raw.githubusercontent.com/ifchen0/IITC_TW/master/build/local/plugins/portal-highlighter-high-level.user.js
// @description    [local-2015-10-09-125421] Use the portal fill color to denote high level portals: Purple L8, Red L7, Orange L6
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @include        https://www.ingress.com/mission/*
// @include        http://www.ingress.com/mission/*
// @match          https://www.ingress.com/mission/*
// @match          http://www.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'local';
plugin_info.dateTimeVersion = '20151009.125421';
plugin_info.pluginId = 'portal-highlighter-high-level';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.portalHighlighterPortalsHighLevel = function() {};

window.plugin.portalHighlighterPortalsHighLevel.colorLevel = function(data) {
  var portal_level = data.portal.options.data.level;
  var opacity = 0.7;
  var color = undefined;

  switch (portal_level) {
    case 6: color='orange'; break;
    case 7: color='red'; break;
    case 8: color='magenta'; break;
  }

  if (color) {
    data.portal.setStyle({fillColor: color, fillOpacity: opacity});
  }
}

var setup =  function() {
  window.addPortalHighlighter('高等門泉', window.plugin.portalHighlighterPortalsHighLevel.colorLevel);
}

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


