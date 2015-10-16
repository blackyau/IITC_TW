// ==UserScript==
// @id             iitc-plugin-zaprange@zaso
// @name           IITC plugin: Zaprange
// @category       Layer
// @version        0.1.4.20151016.183453
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://raw.githubusercontent.com/ifchen0/IITC_TW/master/build/mobile/plugins/zaprange.meta.js
// @downloadURL    https://raw.githubusercontent.com/ifchen0/IITC_TW/master/build/mobile/plugins/zaprange.user.js
// @description    [mobile-2015-10-16-183453] 顯示Portal的最大攻擊範圍.
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
plugin_info.buildName = 'mobile';
plugin_info.dateTimeVersion = '20151016.183453';
plugin_info.pluginId = 'zaprange';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.zaprange = function() {};
  window.plugin.zaprange.zapLayers = {};
  window.plugin.zaprange.MIN_MAP_ZOOM = 16;

  window.plugin.zaprange.portalAdded = function(data) {
    data.portal.on('add', function() {
      window.plugin.zaprange.draw(this.options.guid, this.options.team);
    });

    data.portal.on('remove', function() {
      window.plugin.zaprange.remove(this.options.guid, this.options.team);
    });
  }

  window.plugin.zaprange.remove = function(guid, faction) {
    var previousLayer = window.plugin.zaprange.zapLayers[guid];
    if(previousLayer) {
      if(faction === TEAM_ENL) {
        window.plugin.zaprange.zapCircleEnlHolderGroup.removeLayer(previousLayer);
      } else {
        window.plugin.zaprange.zapCircleResHolderGroup.removeLayer(previousLayer);
      }
      delete window.plugin.zaprange.zapLayers[guid];
    }
  }

  window.plugin.zaprange.draw = function(guid, faction) {
    var d = window.portals[guid];

    if(faction !== TEAM_NONE) {
      var coo = d._latlng;
      var latlng = new L.LatLng(coo.lat,coo.lng);
      var portalLevel = d.options.level;
      //iF: Add different color for each team
      if(faction === TEAM_ENL) {
        var optCircle = {color:'#03DC03',opacity:0.7,fillColor:'#03DC03',fillOpacity:0.1,weight:1,clickable:false, dashArray: [10,6]};
      } else {
        var optCircle = {color:'#0088FF',opacity:0.7,fillColor:'#0088FF',fillOpacity:0.1,weight:1,clickable:false, dashArray: [10,6]};
      }
      //iF:End
      var range = (5*portalLevel)+35;

      var circle = new L.Circle(latlng, range, optCircle);

      if(faction === TEAM_ENL) {
        circle.addTo(window.plugin.zaprange.zapCircleEnlHolderGroup);
      } else {
        circle.addTo(window.plugin.zaprange.zapCircleResHolderGroup);
      }
      window.plugin.zaprange.zapLayers[guid] = circle;
    }
  }

  window.plugin.zaprange.showOrHide = function() {
    if(map.getZoom() >= window.plugin.zaprange.MIN_MAP_ZOOM) {
      // show the layer
      if(!window.plugin.zaprange.zapLayerEnlHolderGroup.hasLayer(window.plugin.zaprange.zapCircleEnlHolderGroup)) {
        window.plugin.zaprange.zapLayerEnlHolderGroup.addLayer(window.plugin.zaprange.zapCircleEnlHolderGroup);
        $('.leaflet-control-layers-list span:contains("啟蒙軍回擊範圍")').parent('label').removeClass('disabled').attr('title', '');
      }
      if(!window.plugin.zaprange.zapLayerResHolderGroup.hasLayer(window.plugin.zaprange.zapCircleResHolderGroup)) {
        window.plugin.zaprange.zapLayerResHolderGroup.addLayer(window.plugin.zaprange.zapCircleResHolderGroup);
        $('.leaflet-control-layers-list span:contains("反抗軍回擊範圍")').parent('label').removeClass('disabled').attr('title', '');
      }
    } else {
      // hide the layer
      if(window.plugin.zaprange.zapLayerEnlHolderGroup.hasLayer(window.plugin.zaprange.zapCircleEnlHolderGroup)) {
        window.plugin.zaprange.zapLayerEnlHolderGroup.removeLayer(window.plugin.zaprange.zapCircleEnlHolderGroup);
        $('.leaflet-control-layers-list span:contains("啟蒙軍回擊範圍")').parent('label').addClass('disabled').attr('title', '將地圖放大來顯示這個項目.');
      }
      if(window.plugin.zaprange.zapLayerResHolderGroup.hasLayer(window.plugin.zaprange.zapCircleResHolderGroup)) {
        window.plugin.zaprange.zapLayerResHolderGroup.removeLayer(window.plugin.zaprange.zapCircleResHolderGroup);
        $('.leaflet-control-layers-list span:contains("反抗軍回擊範圍")').parent('label').addClass('disabled').attr('title', '將地圖放大來顯示這個項目.');
      }
    }
  }

  var setup =  function() {
    // this layer is added to the layer chooser, to be toggled on/off
    window.plugin.zaprange.zapLayerEnlHolderGroup = new L.LayerGroup();
    window.plugin.zaprange.zapLayerResHolderGroup = new L.LayerGroup();

    // this layer is added into the above layer, and removed from it when we zoom out too far
    window.plugin.zaprange.zapCircleEnlHolderGroup = new L.LayerGroup();
    window.plugin.zaprange.zapCircleResHolderGroup = new L.LayerGroup();

    window.plugin.zaprange.zapLayerEnlHolderGroup.addLayer(window.plugin.zaprange.zapCircleEnlHolderGroup);
    window.plugin.zaprange.zapLayerResHolderGroup.addLayer(window.plugin.zaprange.zapCircleResHolderGroup);

    // to avoid any favouritism, we'll put the player's own faction layer first
    if (PLAYER.team == 'RESISTANCE') {
      window.addLayerGroup('反抗軍回擊範圍', window.plugin.zaprange.zapLayerResHolderGroup, true);
      window.addLayerGroup('啟蒙軍回擊範圍', window.plugin.zaprange.zapLayerEnlHolderGroup, true);
    } else {
      window.addLayerGroup('啟蒙軍回擊範圍', window.plugin.zaprange.zapLayerEnlHolderGroup, true);
      window.addLayerGroup('反抗軍回擊範圍', window.plugin.zaprange.zapLayerResHolderGroup, true);
    }

    window.addHook('portalAdded', window.plugin.zaprange.portalAdded);

    map.on('zoomend', window.plugin.zaprange.showOrHide);

    window.plugin.zaprange.showOrHide();
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


