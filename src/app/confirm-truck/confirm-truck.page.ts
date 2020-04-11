import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AngularFireDatabase} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MenuController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { Location } from "@angular/common";
declare var google;
declare var Stripe;
declare var stripe;

@Component({
  selector: 'app-confirm-truck',
  templateUrl: './confirm-truck.page.html',
  styleUrls: ['./confirm-truck.page.scss'],
})
export class ConfirmTruckPage implements OnInit {

    users:Observable<any>;
    loading;
    intent_response;
    intent_secret;
    drivers = [];
    latlng;
    driver_details:Observable<any>;
    fullname;
    photo;
    id_no;
    distance;
    mobile;
    driver = false;
    url = "https://jalome-api-python.herokuapp.com/distance-matrix/";
  constructor(private location: Location,private statusBar: StatusBar,private menu: MenuController,private storage: Storage,private geolocation: Geolocation,private alert: AlertController,public loadingController: LoadingController,private database: AngularFireDatabase,private http: HttpClient,private platform: Platform) {
    this.users = this.database.list("Users").valueChanges();
    this.platform.backButton.subscribeWithPriority(0, ()=>{
        this.location.back();
      });

   }
  Vehicle: any;
  Price: any;
  destination:any;
  interval_counter = 20;
  ngOnInit() {
  }

  async confirm(){
    const loading = await this.loadingController.create({
        message: 'Locating nearest driver in: '+this.interval_counter+'s',
      });
      loading.present();
      //get all drivers
      this.users.subscribe(users=>{
        for(let u = 0; u < users.length; u++){
            if(users[u].driver == true){
                this.drivers.push(users[u]);
            }
        }
        //get user details
        this.storage.get("name").then(name=>{
            this.storage.get("mobile").then(mobile=>{
                console.log(mobile, name);
                //get the nearest driver
                this.driver_details = this.http.get(this.url, {params:{"type":"getDriver","user_fullname":name,"user_mobile":mobile ,"drivers":JSON.stringify(this.drivers),"location":JSON.stringify(this.latlng)} });
                this.driver_details.subscribe(x=>{
                    console.log("nearest driver ", x.Response);
                    //check if users hasn't accepted the ride after 10 seconds
                    var interval = setInterval(async ()=>{
                        console.log("waiting for driver");
                        this.interval_counter--;
                        console.log(this.interval_counter);
                        if(this.interval_counter == 0){
                            this.interval_counter = 20;
                            clearInterval(interval);
                            loading.dismiss();
                            const alert = await this.alert.create({
                              header: 'Update',
                              message: 'No driver available',
                              buttons: ['Okay']
                            });
                        
                            await alert.present();
                        }
                    }, 2000);
                    //check if driver has accepted
                    this.users.subscribe(d=>{
                        for(var i = 0; i < d.length; i++){
                            if(d[i].fullname == x.Response.fullname){
                                console.log("driver's name is ", d[i].picking_up);
                                console.log("current user's name is ", name);
                                if(d[i].picking_up == name){
                                    this.driver = true;
                                    this.fullname = x.Response.fullname;
                                    this.mobile = x.Response.mobile;
                                    this.photo = x.Response.photo;
                                    this.distance = x.Response.distance_from_user;
                                    this.id_no = x.Response.id_no; 
                                    clearInterval(interval);
                                    loading.dismiss();

                                }
                            }
                        }
                    });





                });

            });
        });

      });
  }

  ionViewDidEnter(){
    this.menu.enable(true);
    
    this.storage.get("vehicle_size").then(vehicle=>{
      this.Vehicle = vehicle;
    });
    this.storage.get("fare_price").then(fare=>{
      this.Price = fare;
      this.getIntent(fare);
    });

    this.storage.get("destination").then(d=>{
      console.log(d);
      this.setMap(d);
      this.destination = d;
    });
  }

  //stripe
  async getIntent(price){
    this.loading = await this.loadingController.create({
        message: 'Please wait...',
        duration: 2000
      });
      await this.loading.present();
      //
      var url = "https://jalome-api-python.herokuapp.com/distance-matrix/";
      this.http.get(url, {params:{"type":"getStripeintent", "price":price} }).subscribe(x=>{
        console.log("intext", x);
        this.intent_response = x;
        this.intent_secret = this.intent_response.Response.client_secret;
        // console.log("intent secret ", this.intent_secret);
        this.stripePayment();

      });
  }



  stripePayment(){
    //stipe payment elements
    var stripe = Stripe('pk_test_V3YRUq2VsLyAzwqbxxpk4YuD00oAreff7h');
    var intent_secret = this.intent_secret;
    var showError = this.showPaymentError;
    var alertCtrl = this.alert;
    var elements = stripe.elements();
    var conf = this.confirm;
    // Set up Stripe.js and Elements to use in checkout form
    var style = {
        base: {
        color: "#32325d",
        }
    };
    
    var card = elements.create("card", { style: style });
    card.mount("#card-element");
    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function(ev) {
      ev.preventDefault();
      stripe.confirmCardPayment(intent_secret, {
        payment_method: {
          card: card,
          billing_details: {
            name: 'Jenny Rosen'
          }
        }
      }).then(function(result) {
        if (result.error) {
          // Show error to your customer (e.g., insufficient funds)
          console.log(result.error.message);
          showError(result.error.message,alertCtrl);
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            conf();
            // Show a success message to your customer
            // There's a risk of the customer closing the window before callback
            // execution. Set up a webhook or plugin to listen for the
            // payment_intent.succeeded event that handles any business critical
            // post-payment actions.
          }
        }
      });
    });
  }
  ///stripe





  //error message

  async showError(err){
    const alert = await this.alert.create({
      header: 'Unable to continue',
      subHeader: 'error:',
      message: err,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showPaymentError(err,alertCtrl){
    const alert = await alertCtrl.create({
      header: 'Unable to continue',
      subHeader: 'error:',
      message: err,
      buttons: ['OK']
    });
    await alert.present();
  }
  //erro messages



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

  setMap(destination){
    var infowindow = new google.maps.InfoWindow();
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp.coords.latitude, resp.coords.longitude);
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();
      this.latlng = {lat:resp.coords.latitude,lng:resp.coords.longitude};
      var pyrmont = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      var map = new google.maps.Map(document.getElementById('mapp'), {
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
        this.showRoute(map,uluru,destination);
     })
  }

}
