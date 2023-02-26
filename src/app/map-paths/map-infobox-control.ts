import { Component } from '@angular/core';
import * as Leaflet from 'leaflet'; 

export class InfoBoxControl extends Leaflet.Control {

  infoDiv:any;
  constructor(options?: Leaflet.ControlOptions) {
    super(options);
  }

  override onAdd(map: L.Map) {
    this.infoDiv=  Leaflet.DomUtil.create('div', 'infoBox') as HTMLImageElement; // create a div with a class "info"
    this.infoDiv.innerHTML = '<b>Loading...</b>';
    return this.infoDiv;
  }

  override onRemove(map: L.Map) {
    // Nothing to do here
  }

  updateInfoBox(props:any) {
    this.infoDiv.innerHTML = '<h4>Sentiero</h4>' +  (props ?
      '<b><pre>' + JSON.stringify(props,null,' ').replace(/[\{\}"]/g,'') + '</pre></b><br />'
      : 'Sposta il cursore sopra un sentiero.');
  }
}