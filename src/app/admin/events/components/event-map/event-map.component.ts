import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-event-map',
  templateUrl: './event-map.component.html',
  styleUrls: ['./event-map.component.css']
})
export class EventMapComponent implements OnInit, OnChanges {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Input() locationAddress: string | null = null;
  @Input() readOnly = false;

  @Output() locationSelected = new EventEmitter<{ latitude: number; longitude: number; address: string }>();
  @Output() searchRequested = new EventEmitter<string>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  searchQuery = '';
  isSearching = false;
  searchError: string | null = null;
  resolvedAddress: string | null = null;
  private readonly isBrowser: boolean;

  private readonly ESPRIT_LAT = 36.8992;
  private readonly ESPRIT_LNG = 10.1896;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initMap(), 0);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['latitude'] || changes['longitude']) {
      this.updateMarkerPosition();
    }
  }

  private initMap(): void {
    if (this.map) return;

    const lat = this.latitude ?? this.ESPRIT_LAT;
    const lng = this.longitude ?? this.ESPRIT_LNG;

    this.map = L.map('event-map-container').setView([lat, lng] as L.LatLngExpression, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.marker = L.marker([lat, lng] as L.LatLngExpression, {
      draggable: !this.readOnly,
      icon
    }).addTo(this.map);

    if (!this.readOnly) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.setPosition(e.latlng.lat, e.latlng.lng);
      });

      this.marker.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.setPosition(pos.lat, pos.lng);
      });
    }
  }

  private updateMarkerPosition(): void {
    if (!this.marker || !this.map) return;
    const lat = this.latitude;
    const lng = this.longitude;
    if (lat != null && lng != null) {
      this.marker.setLatLng([lat, lng] as L.LatLngExpression);
      this.map.setView([lat, lng] as L.LatLngExpression, this.map.getZoom());
    }
  }

  private setPosition(lat: number, lng: number): void {
    if (this.readOnly) return;
    if (this.marker && this.map) {
      this.marker.setLatLng([lat, lng]);
      this.map.setView([lat, lng], this.map.getZoom());
    }
    this.resolveAddress(lat, lng);
    this.locationSelected.emit({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      address: this.resolvedAddress || this.locationAddress || ''
    });
  }

  private resolveAddress(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: { 'User-Agent': 'EspritConnect-Events/1.0' }
    })
      .then(res => res.json())
      .then((data: any) => {
        if (data && data.display_name) {
          this.resolvedAddress = data.display_name;
          this.searchError = null;
        }
      })
      .catch(() => {
        this.searchError = 'Unable to resolve address.';
      });
  }

  searchLocation(): void {
    const query = this.searchQuery?.trim();
    if (!query || this.isSearching) return;

    this.isSearching = true;
    this.searchError = null;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { 'User-Agent': 'EspritConnect-Events/1.0' }
    })
      .then(res => res.json())
      .then((data: any[]) => {
        if (!data || data.length === 0) {
          this.searchError = 'Location not found.';
          this.isSearching = false;
          return;
        }
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const displayName = data[0].display_name || query;

        this.resolvedAddress = displayName;
        this.updateMarkerPosition();
        if (this.marker && this.map) {
          this.marker.setLatLng([lat, lon] as L.LatLngExpression);
          this.map.setView([lat, lon] as L.LatLngExpression, 16);
          this.setPosition(lat, lon);
        }
        this.isSearching = false;
      })
      .catch(() => {
        this.searchError = 'Unable to search location.';
        this.isSearching = false;
      });
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.searchLocation();
    }
  }
}
