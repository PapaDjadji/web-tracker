import { Component, OnInit } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { PackageService } from './package-tracking.service';

@Component({
  selector: 'app-package-tracking',
  templateUrl: './package-tracking.component.html',
  styleUrls: ['./package-tracking.component.css']
})
export class PackageTrackingComponent implements OnInit {
  packageId!: string;
  packageDetails: any;
  deliveryDetails: any;
  currentLocation!: google.maps.LatLngLiteral;
  sourceLocation!: google.maps.LatLngLiteral;
  destinationLocation!: google.maps.LatLngLiteral;
  websocket: WebSocketSubject<any>;

  constructor(private packageService: PackageService) {
    this.websocket = webSocket('ws://localhost:3011');
  }

  ngOnInit() {
      // Fetch initial data and setup WebSocket listener
      this.websocket.subscribe(
        (message) => this.handleWebSocketMessage(message),
        (error) => console.error(error),
        () => console.warn('WebSocket connection closed')
      );
  }

  handleWebSocketMessage(message: any): void {
    switch (message.event) {
      case 'location_changed':
        if (message.delivery.delivery_id === this.deliveryDetails.delivery_id) {
          this.currentLocation = { lat: message.delivery.location.lat, lng: message.delivery.location.lng };
          this.updateMap(this.currentLocation);
        }
        break;
      case 'status_changed':
        if (message.delivery.delivery_id === this.deliveryDetails.delivery_id) {
          this.deliveryDetails.status = message.status;
          this.updateStatusTimes(message.delivery.status);
        }
        break;
      case 'delivery_updated':
        if (message.delivery.delivery_object.delivery_id === this.deliveryDetails.delivery_id) {
          this.deliveryDetails = message.delivery.delivery_object;
          this.updateMap(this.deliveryDetails.currentLocation);
        }
        break;
    }
  }

  updateStatusTimes(status: string): void {
    const currentTime = new Date().toISOString();
    switch (status) {
      case 'picked-up':
        this.deliveryDetails.pickup_time = currentTime;
        break;
      case 'in-transit':
        this.deliveryDetails.start_time = currentTime;
        break;
      case 'delivered':
      case 'failed':
        this.deliveryDetails.end_time = currentTime;
        break;
    }
  }
  

  trackPackage() {
    this.packageService.getPackageById(this.packageId).subscribe(response => {
      this.packageDetails = response;
      this.deliveryDetails = response.active_delivery_id;

      if (this.deliveryDetails) {
        this.sourceLocation = this.packageDetails.from_location;
        this.destinationLocation = this.packageDetails.to_location;
        this.updateMap(this.deliveryDetails.location);
      }
    }, error => {
      console.error('Error tracking package:', error);
    });
  }


  updateMap(location: any): void {
    this.currentLocation = { lat: location.lat, lng: location.lng };
  }

}
