import { Component } from '@angular/core';
import * as Leaflet from 'leaflet'; 
import { HttpClient, HttpRequest } from '@angular/common/http';

Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(private http: HttpClient) { }

  title = 'segnaleticaSAT';
  map!: Leaflet.Map;
  markers: Leaflet.Marker[] = [];
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

  loadBoundaries() {
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

  loadPaths() {
    const pathsURL = "assets/TrentinoPaths.geojson"
    this.http.get<any>(pathsURL).subscribe(data => {
      console.log(data);
      Leaflet.geoJSON(data, {
        onEachFeature: this.onEachFeature_Path
      }).addTo(this.map);
    }) 
  }

  generateMarker(data: any, index: number) {
    return Leaflet.marker(data.position, { draggable: data.draggable })
      .on('click', (event) => this.markerClicked(event, index))
      .on('dragend', (event) => this.markerDragEnd(event, index));
  }

  onMapReady($event: Leaflet.Map) {
    this.map = $event;
    //this.initMarkers();
    this.loadBoundaries();
    this.loadPaths();
  }

  onEachFeature_Path(feature: any, layer: any) {
    // function zoomToFeature(event: any, map:any) {
    //   console.log(event);
    //   map.fitBounds(event.target.getBounds());
    // }
    layer.bindPopup('<pre>'+JSON.stringify(feature.properties,null,' ').replace(/[\{\}"]/g,'')+'</pre>');
    // layer.on('click', (event:any) => zoomToFeature(event, this.map));
    // layer.on({
		// 	// mouseover: highlightFeature,
		// 	// mouseout: resetHighlight,
		// 	click: this.zoomToFeature
		// });
  }

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
