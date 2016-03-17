/**
 * @file
 *
 */
angular.module('searchResultApp').directive('searchMap', [ 'CONFIG', 'communicatorService',
  function (CONFIG, communicatorService) {
    "use strict";

    return {
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs) {
        // Initialize map container.
        var map = L.map('search-map', { zoomControl:false });

        // @TODO: Make this configurable.
        map.setView(new L.LatLng(56.15331, 10.19651), 10);


        // Add open street map as base layer.
        var osm_url='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osm_copy='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a>';
        var osm = new L.TileLayer(osm_url, {minZoom: 10, maxZoom: 18, attribution: osm_copy});
        map.addLayer(osm);

        // Watch for changes in hits
        var markers = [];
        communicatorService.$on('mapHits', function onMapHits(event, hits) {
          // Remove all markers before populating with new markers.
          for (var i in markers) {
            map.removeLayer(markers[i]);
          }
          markers = [];

          console.log(hits);

          // Add all results to the map.
          for (var hit in hits.results) {
            var location = hits.results[hit].field_location;
            if (location !== null) {
              var marker = L.marker([location.lat, location.lon]);
              markers.push(marker);
              marker.addTo(map);
            }
          }
        });
      }
    };
  }
]);
