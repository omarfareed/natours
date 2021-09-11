
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoib21hcmZhcmVlZCIsImEiOiJja3N5ZmN3NzAyajZrMnluMWtsM205ZGM3In0.Q3a4sYSFy2p50nWzReN2xg';
  // CREATE map
  var map = new mapboxgl.Map({
    container: 'map', // ELEMENT ID TO BE PUT IN
    style: 'mapbox://styles/omarfareed/cksyk2efp0rf717sdl6sxssfp' //YOUR MAP STYLE
    //   center: [-118.113491, 34.111745],
    //   zoom : 8
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach(loc => {
    const element = document.createElement('div');
    element.className = 'marker';
    // ADD MARKER
    new mapboxgl.Marker({
      element,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    // ADD popup
    new mapboxgl.Popup({
      offset: 30 // 30 px to show both icon and text
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      left: 200,
      right: 200,
      bottom: 200
    }
  });
};
