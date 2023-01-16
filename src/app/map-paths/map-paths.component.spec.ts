import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPathsComponent } from './map-paths.component';

describe('MapPathsComponent', () => {
  let component: MapPathsComponent;
  let fixture: ComponentFixture<MapPathsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapPathsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapPathsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
