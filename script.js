//funzione per salvare i dati che verranno salvati con le funzioni di download
function saveGeoJSON(geojson) {
    var jsonString = JSON.stringify(geojson, null, 2);
    var blob = new Blob([jsonString], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'Puglia.geojson';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

//impostazione iniziale della mappa
var map = L.map('map').setView([41.25, 16.25], 7);

//download del file geojson delle attrazioni turistiche
function downloadGeoJSONLuoghi() {
    var overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];area[name="Puglia"]->.a;node(area.a)[tourism];out;';
    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            var geojson = {
                type: 'FeatureCollection',
                features: data.elements.map(function (item) {
                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                        },
                        properties: {
                            name: item.tags.name,
                            descrizione: item.tags.information,
                            tipo: item.tags.tourism
                        }
                    };
                })
            };
            saveGeoJSON(geojson);
        })
        .catch(error => console.error('Errore nella richiesta a Overpass API:', error));
}

//download del file geojson delle attrazioni turistiche
function downloadGeoJSONMezzi() {
    var overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];area[name="Puglia"]->.a;(node(area.a)[railway=station];node(area.a)[highway=bus_stop];node(area.a)[aeroway=aerodrome];node(area.a)[aeroway=airstrip];node(area.a)[harbour];);out;';
    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            var geojson = {
                type: 'FeatureCollection',
                features: data.elements.map(function (item) {
                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                        },
                        properties: {
                            name: item.tags.name
                        }
                    };
                })
            };
            saveGeoJSON(geojson);
        })
        .catch(error => console.error('Errore nella richiesta a Overpass API:', error));
}

//visualizzazione sulla mappa delle attrazioni turistiche
function getLuoghi() {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];area[name="Puglia"]->.a;node(area.a)[tourism];out;';

    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            var geojson = {
                type: 'FeatureCollection',
                features: data.elements.map(function (item) {
                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                        },
                        properties: {
                            name: item.tags.name,
                            descrizione: item.tags.information,
                            tipo: item.tags.tourism
                        }
                    };
                })
            };

            var markers = L.markerClusterGroup();

            L.geoJSON(geojson, {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup('<b>' + feature.properties.name + '</b>, ' + feature.properties.tipo + '<br>' + feature.properties.descrizione);
                }
            }).addTo(markers);

            map.addLayer(markers);
        })
        .catch(error => console.error('Errore nella richiesta a Overpass API:', error));

    var coordinatesDiv = document.getElementById('coordinates');

    map.on('mousemove', function (e) {
        var lat = e.latlng.lat.toFixed(5);
        var lon = e.latlng.lng.toFixed(5);
        coordinatesDiv.innerHTML = 'Latitude: ' + lat + '<br>Longitude: ' + lon;
    });
}

//visualizzazione sulla mappa dei mezzi di trasporto pubblico
function getMezzi() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];area[name="Puglia"]->.a;(node(area.a)[railway=station];node(area.a)[highway=bus_stop];node(area.a)[aeroway=aerodrome];node(area.a)[aeroway=airstrip];node(area.a)[harbour];);out;';

    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            var geojson = {
                type: 'FeatureCollection',
                features: data.elements.map(function (item) {
                    //console.log(item);
                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                        },
                        properties: {
                            name: item.tags.name,
                            operatore: item.tags.operator,
                            tipo: item.tags.highway
                        }
                    };
                })
            };
            var markers = L.markerClusterGroup();

            L.geoJSON(geojson, {
                pointToLayer: function (feature, latlng) {
                    console.log(feature);
                    if (feature.properties.tipo === 'bus_stop') {
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: '/icons/bus.png',
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                                popupAnchor: [0, -32]
                            })
                        });
                    } else if(feature.properties.tipo === 'station'){
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: '/icons/train.png',
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                                popupAnchor: [0, -32]
                            })
                        });
                    } else if(feature.properties.tipo === 'aerodrome'){
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: '/icons/plane.png',
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                                popupAnchor: [0, -32]
                            })
                        });
                    } else{
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: '/icons/undefined.png',
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                                popupAnchor: [0, -32]
                            })
                        });
                    }
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup('<b>Nome: ' + feature.properties.name + '</b><br>Tipo: ' + feature.properties.tipo + '<br>Operatore: ' + feature.properties.operatore);
                }
            }).addTo(markers);
            map.addLayer(markers);
        })
    
        .catch(error => console.error('Errore nella richiesta a Overpass API:', error));

    var coordinatesDiv = document.getElementById('coordinates');

    map.on('mousemove', function (e) {
        var lat = e.latlng.lat.toFixed(5);
        var lon = e.latlng.lng.toFixed(5);
        coordinatesDiv.innerHTML = 'Latitude: ' + lat + '<br>Longitude: ' + lon;
    });
}