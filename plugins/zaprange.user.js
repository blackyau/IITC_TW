// ==UserScript==
// @id             iitc-plugin-zaprange@zaso
// @name           IITC plugin: Zaprange
// @category      圖層
// @version        0.1.4.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] Shows the maximum range of attack by the portals.
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==

@@PLUGINSTART@@

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
        $('.leaflet-control-layers-list span:contains("綠軍能量塔射程")').parent('label').removeClass('disabled').attr('title', '');
      }
      if(!window.plugin.zaprange.zapLayerResHolderGroup.hasLayer(window.plugin.zaprange.zapCircleResHolderGroup)) {
        window.plugin.zaprange.zapLayerResHolderGroup.addLayer(window.plugin.zaprange.zapCircleResHolderGroup);
        $('.leaflet-control-layers-list span:contains("藍軍能量塔射程")').parent('label').removeClass('disabled').attr('title', '');
      }
    } else {
      // hide the layer
      if(window.plugin.zaprange.zapLayerEnlHolderGroup.hasLayer(window.plugin.zaprange.zapCircleEnlHolderGroup)) {
        window.plugin.zaprange.zapLayerEnlHolderGroup.removeLayer(window.plugin.zaprange.zapCircleEnlHolderGroup);
        $('.leaflet-control-layers-list span:contains("綠軍能量塔射程")').parent('label').addClass('disabled').attr('title', '將地圖放大來顯示這個項目.');
      }
      if(window.plugin.zaprange.zapLayerResHolderGroup.hasLayer(window.plugin.zaprange.zapCircleResHolderGroup)) {
        window.plugin.zaprange.zapLayerResHolderGroup.removeLayer(window.plugin.zaprange.zapCircleResHolderGroup);
        $('.leaflet-control-layers-list span:contains("藍軍能量塔射程")').parent('label').addClass('disabled').attr('title', '將地圖放大來顯示這個項目.');
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
      window.addLayerGroup('反抗軍能量塔回擊範圍', window.plugin.zaprange.zapLayerResHolderGroup, true);
      window.addLayerGroup('啟蒙軍能量塔回擊範圍', window.plugin.zaprange.zapLayerEnlHolderGroup, true);
    } else {
      window.addLayerGroup('啟蒙軍能量塔回擊範圍', window.plugin.zaprange.zapLayerEnlHolderGroup, true);
      window.addLayerGroup('反抗軍能量塔回擊範圍', window.plugin.zaprange.zapLayerResHolderGroup, true);
    }

    window.addHook('portalAdded', window.plugin.zaprange.portalAdded);

    map.on('zoomend', window.plugin.zaprange.showOrHide);

    window.plugin.zaprange.showOrHide();
  }

// PLUGIN END //////////////////////////////////////////////////////////

@@PLUGINEND@@
