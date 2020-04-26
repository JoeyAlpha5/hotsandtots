import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase} from '@angular/fire/database';
import { AngularFireAuth} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AlertController } from '@ionic/angular';
import { Location } from "@angular/common";
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ActionSheetController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
declare var google;
@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
})
export class RequestsPage implements OnInit {

  display_home;
  user;
  fullName = "";
  id_no; 
  mobile;
  distance;
  user_list;
  photo;
  plate;
  email;
  constructor(private auth: AngularFireAuth,private route: Router,private database: AngularFireDatabase,private storage: Storage,public alertController: AlertController,private location: Location,private geolocation: Geolocation,private callNumber: CallNumber,public actionSheetController: ActionSheetController,private http: HttpClient,public toastController: ToastController) {
    this.user_list = this.database.list("Users").valueChanges();
   }

  ngOnInit() {
  }



  ionViewDidEnter(){
    //get user
    this.auth.auth.onAuthStateChanged(user=>{
      if(user){
        //get the user's profile details
        this.storage.get("mobile").then(mobile=>{
          var user = this.database.object("Users/"+mobile).valueChanges();
          var userSub = user.subscribe(u=>{
            this.user = u;
            if(this.user.driver == false){
              this.notDriver();
              userSub.unsubscribe();
            }else{
              this.Driver();
              userSub.unsubscribe();
            }
          },err=>{
            this.showError("Error occured","Processing err");
          });
        });
      }else{
        console.log("user not logged in");
      }
    });
  }


  //if this user is not a driver check to see if they have any on-going tow truck requests
  //with any driver
  notDriver(){
    this.display_home = true;
    var user_list_sub = this.user_list.subscribe(users=>{
      for(let count = 0; count < users.length; count++){
        if(users[count].driver == true){
          console.log(users[count]);
          console.log(users[count].picking_up);
          console.log(this.user.fullname);
          if(users[count].picking_up == this.user.fullname){
            user_list_sub.unsubscribe();
            this.mobile = users[count].mobile;
            this.fullName = users[count].fullname;
            this.id_no = users[count].driver_id;
            this.photo = users[count].image;
            this.plate = users[count].plate;
            break;
          }else{
            this.fullName = "";
          }
        }
      }
      //if user hasn't requested a 
      if(this.fullName == ""){
        this.showError("You have no on-going tow truck requests", "No requests");
      }
    });



  }


  Driver(){
    this.display_home = false;
    this.storage.get("mobile").then(mobile=>{
      //get the the driver's customer name
      var user = this.database.object("Users/"+mobile).valueChanges();
      var userSub = user.subscribe(u=>{
        this.user = u;
        // get the customer details
        if(this.user.picking_up != "none"){
          userSub.unsubscribe();
          var user_list_sub = this.user_list.subscribe(users=>{
            for(let count = 0; count < users.length; count++){
              if(users[count].fullname == this.user.picking_up){
                console.log(this.user.picking_up);
                this.fullName = users[count].fullname;
                this.mobile = users[count].mobile;
                this.email = users[count].email;
                this.map();
              }
            }
            user_list_sub.unsubscribe(); 
          });
        }else{
          this.showError("You have no on-going tow truck requests", "No requests");
          userSub.unsubscribe();
        }

      },err=>{
        this.showError("Error occured","Processing err");
      });
    });
  }


  call(mobile){
    console.log(mobile);
    this.callNumber.callNumber(mobile, true)
    .then(res => console.log('Launched dialer!', res))
    .catch(err => this.showError("Unable to place call, please try again", "Call error"));
  }

  dismiss(){
    this.route.navigate(['/home']);
  }


  completed(){
    this.storage.remove("passenger_fullname");
    this.storage.get("mobile").then(mobile=>{
        console.log("my mobile");
        this.database.object("Users/"+mobile).update({"picking_up":"none"});
        this.route.navigate(['/home']);
    });
  }

  async showError(err,header){
    const alert = await this.alertController.create({
      header: header,
      subHeader: 'message:',
      message: err,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.route.navigate(['/home']);
          }
        }
      ]
    });
    await alert.present();
  }

  cancel(){
    if(this.mobile != undefined && this.mobile != null){
        console.log(this.mobile);
        console.log(this.mobile);
        this.database.object("Users/"+this.mobile).query.once("value",data=>{
          var user = data.val();
          var device_id = user.device_id;
          var url = "https://jalome-api-python.herokuapp.com/distance-matrix/";
          this.database.object("Users/"+this.mobile).update({"picking_up":"none"}).then(()=>{
              this.http.get(url, {params:{"type":"cancelReq", "device_id":device_id} }).subscribe(x=>{  
                this.route.navigate(['/home']);
              });
          });
      });
    }
}


  //report driver 
  async report(){
    const actionSheet = await this.actionSheetController.create({
      header: 'Report',
      buttons: [{
        text: 'Report driver for poor service',
        role: 'destructive',
        icon: 'thumbs-down',
        handler: () => {
          //report driver
          var url = "https://jalome-api-python.herokuapp.com/distance-matrix/";
          this.http.get(url, {params:{"type":"reportDriver", "driver":this.fullName} }).subscribe(x=>{
            this.presentToast("Driver has been reported");
          });
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }
  

  //present toat
  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }



  //map render
  map(){
    this.geolocation.getCurrentPosition().then((resp) => {
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();
        console.log(resp.coords.latitude, resp.coords.longitude);
        var pyrmont = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
        var map = new google.maps.Map(document.getElementById('requestMap'), {
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
          //set destination
          this.storage.get("destination").then(dest=>{
              var destination = dest;
              var marker = new google.maps.Marker({position: destination, map: map});
              this.showRoute(map,uluru,destination);
          });
      });
  }


  showRoute(map,uluru,destination){
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    //add your map to direction service
    directionsDisplay.setMap(map);
    var start = uluru;
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
