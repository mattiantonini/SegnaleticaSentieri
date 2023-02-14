import { Component } from '@angular/core';
import * as Leaflet from 'leaflet'; 
import 'leaflet-textpath';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { NONE_TYPE } from '@angular/compiler';

Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});

@Component({
  selector: 'app-map-paths',
  templateUrl: './map-paths.component.html',
  styleUrls: ['./map-paths.component.css']
})
export class MapPathsComponent {
  constructor(private http: HttpClient) { }
  map!: Leaflet.Map;
  markers: Leaflet.Marker[] = [];
  lastSelectedPath= null;
  dataPath = [];
  layerPath!: Leaflet.GeoJSON;
  options = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    zoom: 10, 
    center: { lat: 46.06787, lng: 11.12108 }
  }

  initMarkers() {
    const initialMarkers = [
      {
        position: { lat: 46.06787, lng: 11.12108 },
        draggable: true
      }
    ];
    for (let index = 0; index < initialMarkers.length; index++) {
      const data = initialMarkers[index];
      const marker = this.generateMarker(data, index);
      marker.addTo(this.map).bindPopup(`<b>${data.position.lat},  ${data.position.lng}</b>`);
      this.map.panTo(data.position);
      this.markers.push(marker)
    }
  }

  initLoadPath() {
    const pathsURL = "assets/TrentinoPaths.geojson"
    var obj = this;
    this.http.get<any>(pathsURL).subscribe(data => {
      console.log(data);
      obj.dataPath = data;
      obj.loadPaths();
    });
  }

  initLoadBoundaries() {
    function polystyle(feature:any) {
      return {
          fillColor: 'blue',
          weight: 3,
          opacity: 1,
          color: 'black',  //Outline color
          fillOpacity: 0.05
      };
    }
    const boundariesURL = "assets/TrentinoBoundaries.geojson"
    this.http.get<any>(boundariesURL).subscribe(data => {
      Leaflet.geoJSON(data, {style: polystyle}).addTo(this.map);
    }) 
  }

  onMouseOverPath(event:any) {
    var layer = event.target;

    layer.setStyle({
        weight: 5,
        color: '#FFFF00',
        dashArray: '',
        fillOpacity: 0.9,
        opacity:1
    });

    layer.bringToFront();
  }

  onMouseOutPath(event: any, layer_geojson:any) {
    if(this.lastSelectedPath != event.target){
      layer_geojson.resetStyle(event.target);
    }
  }

  loadPathStyle (feature:any, obj:any) {
    var s = {
      weight: 4,
      color: '#FF0000',
      dashArray: '0',
      fillOpacity: 0.9,
      opacity: 1
    };
    
    if(obj.map.getZoom() >10){
      // s["dashArray"] = '2, 15';
      console.log(feature);
      if (feature["properties"]["difficolta"] === 'T') {
        s["dashArray"] = '22';
      }
      else if (feature["properties"]["difficolta"] === 'E') {
        s["dashArray"] = '7, 8';
      }
      else if (feature["properties"]["difficolta"] === 'EE') {
        s["dashArray"] = '1, 8';
      }
      else if (feature["properties"]["difficolta"].startsWith('EEA')) {
        s["dashArray"] = '0';
        s["opacity"] = 0.00;
      }      
    }

    return s;
  }

  loadPaths() {
    var obj = this;
    obj.layerPath = Leaflet.geoJSON(obj.dataPath, {
      style: (feature) => obj.loadPathStyle(feature, obj),
      onEachFeature: function(feature, featureLayer:Leaflet.Polyline) {
        featureLayer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\}"]/g,'')+'</pre>');
        featureLayer.on('click', (event) => obj.onClickPath(event, obj.map));
        featureLayer.on('mouseover', (event) => obj.onMouseOverPath(event));
        featureLayer.on('mouseout', (event) => obj.onMouseOutPath(event, obj.layerPath));

        // featureLayer.setStyle(obj.loadPathStyle(feature, obj));
        if (feature["properties"]["difficolta"].startsWith('EEA')) {
          if (obj.map.getZoom() >10){
            featureLayer.setText("+", {
              repeat: true,
              offset: 4,
              attributes: {
                "font-weight": "bold",
                "font-size": "20",
                "fill": "#ff0000"
              }
            });
          }
          else {
            featureLayer.setText(null);
          }
        }

      }
    });
    
    obj.layerPath.addTo(obj.map);
  }

  generateMarker(data: any, index: number) {
    return Leaflet.marker(data.position, { draggable: data.draggable })
      .on('click', (event) => this.markerClicked(event, index))
      .on('dragend', (event) => this.markerDragEnd(event, index));
  }

  onMapReady($event: Leaflet.Map) {
    var obj = this;
    this.map = $event;
    //this.initMarkers();
    this.initLoadBoundaries();
    this.initLoadPath();

    obj.map.on("zoomend", function(){
      obj.layerPath.removeFrom(obj.map);
      obj.loadPaths();
    });
  }

  onClickPath(event: any, map: Leaflet.Map) {
    var layer = event.target;
    console.log(event.target.getBounds());
    map.fitBounds(event.target.getBounds());
    layer.setStyle({
      weight: 5,
      color: '#FFFF00',
      dashArray: '',
      fillOpacity: 0.9
    });

  layer.bringToFront();
  // Handle the lastSelectedPath coloring
  if(this.lastSelectedPath!=null){
    this.layerPath.resetStyle(this.lastSelectedPath);
  }
  this.lastSelectedPath = layer;
  console.log(this.lastSelectedPath);
  }

  // onEachFeature_Path(feature: any, layer: Leaflet.Layer) {
  //   console.log(this);

  //   layer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\}"]/g,'')+'</pre>');
  //   // layer.on('click', (event) => this.onClickPath(event, this.map));
  //   layer.on({
	// 	// 	// mouseover: onMouseOverPath,
	// 	// 	// mouseout: onMouseOutPath,
	// 		click: this.onClickPath
	// 	});
  // }

  mapClicked($event: any) {
    console.log($event.latlng.lat, $event.latlng.lng);
  }

  markerClicked($event: any, index: number) {
    console.log($event.latlng.lat, $event.latlng.lng);
  }

  markerDragEnd($event: any, index: number) {
    console.log($event.target.getLatLng());
  }
}
