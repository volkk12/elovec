var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  'Component.js',
  'index.html',
  'manifest.json',
  'register-sw.js',
  'sw.js',
  'Component-preload.js',
  'i18n/i18n_en.properties',
  'i18n/i18n_sl_SI.properties',
  'i18n/i18n_sl.properties',
  'i18n/i18n.properties',
  'controller/App.controller.js',
  'controller/Clani.controller.js',
  'controller/Login.controller.js',
  'controller/LovskaDruzina.controller.js',
  'controller/NadzornaPlosca.controller.js',
  'controller/NaLov.controller.js',
  'controller/Obvestila.controller.js',
  'controller/PregledOdstrela.controller.js',
  'controller/PregledSkode.controller.js',
  'controller/PrijavaSkode.controller.js',
  'controller/Vloge.controller.js',
  'view/App.view.xml',
  'view/Clani.view.xml',
  'view/Login.view.xml',
  'view/LovskaDruzina.view.xml',
  'view/NadzornaPlosca.view.xml',
  'view/NaLov.view.xml',
  'view/Obvestila.view.xml',
  'view/PregledOdstrela.view.xml',
  'view/PregledSkode.view.xml',
  'view/PrijavaSkode.view.xml',
  'view/Vloge.view.xml',
  'fragment/Menu.fragment.xml',
  'fragment/UserMenu.fragment.xml',
  'images/Logo.png',
  'css/style.css',
  'js/main.js',
  'js/aes.js',
  'js/indexedDB.js',
  'js/login.js',
  'js/settings.js',
  'model/formatter.js',
  'https://openui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_belize/fonts/72-Light.woff2',
  'https://openui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_belize/fonts/72-Bold.woff2'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  if(event.request.method == "POST"){
    event.respondWith(fetch(event.request));
  }
  else{
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
    );
  }
});

self.addEventListener('sync', function(event) {
  if (event.tag == 'sendLov') {
      console.log("Syyync event");
      event.waitUntil(sendLovSync());
  }
});

function sendLovSync(data){

  Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
  }
  
  Date.prototype.subtractHours= function(h){
    this.setHours(this.getHours()-h);
    return this;
  }

  var db;
  var openRequest = indexedDB.open("lovci", "1");

  var data = {};
  var token;

  return openRequest.onsuccess = function(event){
      db = openRequest.result;
      var transaction = db.transaction(["LovOffline"]);
      var objectStore = transaction.objectStore("LovOffline");
      var request = objectStore.getAll();
      
      request.onerror = function(event) {
        console.log("Napaka pri branju iz indexedDB");
      };
      
      request.onsuccess = function(event) {
        if(request.result.length > 0){
          console.log("Not empty");
          data.lovisce = request.result[0].lovisce;
          data.username = request.result[0].username;
          data.zacetek = request.result[0].zacetek;
          data.konec = request.result[0].konec;
          data.plen = request.result[0].plen;
          data.stevilo_strelov = request.result[0].stevilo_strelov;
          token = request.result[0].token;

          data.zacetek = new Date(data.zacetek);
          data.zacetek = data.zacetek.addHours(2);
          if(data.konec != ""){
              data.konec = data.konec.addHours(2);
          }

          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          myHeaders.append("Authorization", token);

          var raw = JSON.stringify(data);

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };

          fetch("https://elovec.herokuapp.com/lov", requestOptions)
            .then(response => response.text())
            .then(result => {
              var r = JSON.parse(result);
              if(r.Success != undefined){
                self.registration.showNotification("Podatki o lovu so uspešno poslani");
                clearLovOffline();
                clearTrenutenLovOffline();
              }
            })
            .catch(error => console.log('error', error));
          /*var settings = {
              "url": "http://127.0.0.1:8081/lov",
              "method": "POST",
              "timeout": 0,
              "headers": {
                  "Content-Type": "application/json",
                  "Authorization": token
              },
              "data": JSON.stringify(data),
            };
            
            $.ajax(settings).done(function (response) {
              data.zacetek = data.zacetek.subtractHours(2);
              if(data.konec != ""){
                  data.konec = data.konec.subtractHours(2);
              }
              if(response.Success == "X"){
                  console.log("Lov je bil uspešno dodan.");
              }
              else{
                  console.log("Napaka pri vpisu na lov, poizkusite ponovno.");
              }
            });*/
        }
        else{
          console.log(request.result);
        }
      };
  }
}

function clearLovOffline() {
  var openRequest = indexedDB.open("lovci", "1");
  var db;

  openRequest.onsuccess = function(event){
      db = openRequest.result;
      var transaction = db.transaction(["LovOffline"], "readwrite");
      var objectStore = transaction.objectStore("LovOffline");
      var request = objectStore.clear();
      
      request.onerror = function(event) {
         console.log("Napaka pri branju iz indexedDB");
      };
      
      request.onsuccess = function(event) {
      };
  }
}

function clearTrenutenLovOffline() {
  var openRequest = indexedDB.open("lovci", "1");
  var db;

  openRequest.onsuccess = function(event){
      db = openRequest.result;
      var transaction = db.transaction(["trenutenLov"], "readwrite");
      var objectStore = transaction.objectStore("trenutenLov");
      var request = objectStore.clear();
      
      request.onerror = function(event) {
         console.log("Napaka pri branju iz indexedDB");
      };
      
      request.onsuccess = function(event) {
      };
  }
}