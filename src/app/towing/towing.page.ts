import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFireAuth} from '@angular/fire/auth';
import { LoadingController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MenuController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Location } from "@angular/common";
declare var google;
@Component({
  selector: 'app-towing',
  templateUrl: './towing.page.html',
  styleUrls: ['./towing.page.scss'],
})
export class TowingPage implements OnInit {

  fare = 0;
  m_fare = 0;
  l_fare =0;
  constructor(private location: Location,private platform: Platform,private menu: MenuController,private statusBar: StatusBar,private route: Router,private storage: Storage,private auth: AngularFireAuth,public loadingController: LoadingController,private geolocation: Geolocation) {
    this.platform.backButton.subscribeWithPriority(0, ()=>{
        this.location.back();
      });
   }

  ngOnInit() {
  }


  async ionViewDidEnter(){
    this.menu.enable(true);
    this.storage.get("email").then(x=>{
      if(x == null){
        this.route.navigate(['/login']);
      }
    })  


    //set current pointer
    var infowindow = new google.maps.InfoWindow();
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp.coords.latitude, resp.coords.longitude);
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();

      var pyrmont = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      var map = new google.maps.Map(document.getElementById('map'), {
          center: pyrmont,
          zoom: 15,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
                      styles: [{
                "elementType": "geometry",
                "stylers": [{
                    "color": "#f5f5f5"
                }]
            }, {
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#616161"
                }]
            }, {
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#f5f5f5"
                }]
            }, {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#bdbdbd"
                }]
            }, {
                "featureType": "poi",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#eeeeee"
                }]
            }, {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#757575"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e5e5e5"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#ffffff"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#757575"
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#dadada"
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#616161"
                }]
            }, {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            }, {
                "featureType": "transit",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e5e5e5"
                }]
            }, {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#eeeeee"
                }]
            }, {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#c9c9c9"
                }]
            }, {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            }],
        });
        var uluru = {lat: resp.coords.latitude, lng: resp.coords.longitude};
        var marker = new google.maps.Marker({position: uluru, map: map});
        //get user's destination
        this.storage.get("prices").then(x=>{
          console.log(x, x.l_fare);
          this.fare = x.fare;
          this.m_fare = x.m_fare;
          this.l_fare = x.l_fare;
          console.log(x.dest);
          this.storage.get("destination").then(d=>{
            var marker = new google.maps.Marker({
              position:x.dest ,
              map: map,
          });
          infowindow.setContent('Your destination: '+ d);
          infowindow.open(map, marker);
          this.showRoute(map,uluru,d);

          });
        });
     })
  }

  towing(vehicle_size,fare){
    console.log(vehicle_size,fare);
    this.storage.set("vehicle_size",vehicle_size);
    this.storage.set("fare_price", fare);
    this.route.navigate(['/confirm-truck']);
  }

  showRoute(map,current_location,destination){
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    //add your map to direction service
    directionsDisplay.setMap(map);
    var start = current_location;
    var end = destination;
    var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
  }

}
