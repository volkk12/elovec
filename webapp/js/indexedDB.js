function ifSupported(){
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || 
    window.msIndexedDB;
    
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || 
    window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || 
    window.webkitIDBKeyRange || window.msIDBKeyRange
    
    if (!window.indexedDB) {
        return false;
    }
    else{
        return true;
    }
}

function openDB(){
    var db;
    var openRequest = indexedDB.open("lovci", "1");

    return openRequest;
    openRequest.onsuccess = function (event){
        db = openRequest.result;
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        db.createObjectStore("javnaObvestila", { keyPath: "id"});
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju indexedDB");
    }
}

function createObjectStores(db) {
    db.createObjectStore("javnaObvestila", { keyPath: "id"});
    db.createObjectStore("zasebnaObvestila", { keyPath: "id"});
    db.createObjectStore("lovskaDruzina", { keyPath: "id"});
    db.createObjectStore("user", { keyPath : "username"});
    db.createObjectStore("lov", { autoIncrement : true});
    db.createObjectStore("pregledOdstrela", { autoIncrement : true});
    db.createObjectStore("aktivniLov", { autoIncrement : true});
    db.createObjectStore("lovisca", { autoIncrement : true});
    db.createObjectStore("divjad", { autoIncrement : true});
    db.createObjectStore("trenutenLov", { autoIncrement : true});
    db.createObjectStore("LovOffline", { autoIncrement : true});
}

function addJavnaObvestila(id, data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["javnaObvestila"], "readwrite")
                .objectStore("javnaObvestila")
                .add({ id: id, naslov: data.naslov, obvestilo: data.obvestilo });
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.naslov);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.naslov);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readJavnaObvestila(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["javnaObvestila"]);
        var objectStore = transaction.objectStore("javnaObvestila");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           
            console.log(request.result);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({obvestila : request.result});
            that.getView().setModel(oModel);
        };
    }
}

function addZasebnaObvestila(id, data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["zasebnaObvestila"], "readwrite")
                .objectStore("zasebnaObvestila")
                .add({ id: id, naslov: data.naslov, obvestilo: data.obvestilo });
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.naslov);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.naslov);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readZasebnaObvestila(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["zasebnaObvestila"]);
        var objectStore = transaction.objectStore("zasebnaObvestila");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           
            console.log(request.result);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({obvestila : request.result});
            that.getView().setModel(oModel);
        };
    }
}

function addLovskeDruzine(id, data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["lovskaDruzina"], "readwrite")
                .objectStore("lovskaDruzina")
                .add({ id: id, naslov: data.ime_druzine});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.ime_druzine);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.ime_druzine);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readLovskeDruzine() {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["lovskaDruzina"]);
        var objectStore = transaction.objectStore("lovskaDruzina");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           
           console.log(request.result);
           //TODO load from here if offline
        };
    }
}

function addUser(username, password, lovskaDruzina){
    var openRequest = openDB();
    var db;

    var pass = btoa(CryptoJS.AES.encrypt(password, "p2U5o").toString());


    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["user"], "readwrite")
                .objectStore("user")
                .add({username: username, password: pass, LD: lovskaDruzina});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + username);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + username);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readUser(that, username, password) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["user"]);
        var objectStore = transaction.objectStore("user");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           
            console.log(request.result);
            if(password == CryptoJS.AES.decrypt(atob(request.result[0].password), "p2U5o").toString(CryptoJS.enc.Utf8) && username == request.result[0].username){
                globals.puo.username = request.result[0].username;
                globals.puo.ime_druzine = request.result[0].LD;
                globals.puo.token = "offline";

                var expire = new Date();
                expire.setHours(expire.getHours() + 1);
                document.cookie = 'puo=' + JSON.stringify(globals.puo) +'; expires=' + expire + '; path=/'

                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("LovskaDruzina");
            }
        };
    }
}

function addLov(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["lov"], "readwrite")
                .objectStore("lov")
                .add({username: data.username, lovisce: data.lovisce, zacetek: data.zacetek, konec: data.konec, stevilo_strelov: data.stevilo_strelov, plen: data.plen});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.username);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.username);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readLov() {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["lov"]);
        var objectStore = transaction.objectStore("lov");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           
           console.log(request.result);
           //TODO load from here if offline
        };
    }
}

function clearLov() {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["lov"], "readwrite");
        var objectStore = transaction.objectStore("lov");
        var request = objectStore.clear();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           
           console.log("Pobrisano");
        };
    }
}

function addPregledOdstrela(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["pregledOdstrela"], "readwrite")
                .objectStore("pregledOdstrela")
                .add({divjad: data.divjad, planiran_odstrel: data.planiran_odstrel, izvrsen_odstrel: data.izvrsen_odstrel});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.divjad);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.divjad);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readPregledOdstrela(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["pregledOdstrela"]);
        var objectStore = transaction.objectStore("pregledOdstrela");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           
            console.log(request.result);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({"PregledOdstrela" : request.result});
            that.getView().setModel(oModel);
        };
    }
}

function readPregledOdstrelaOdstotek(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["pregledOdstrela"]);
        var objectStore = transaction.objectStore("pregledOdstrela");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           var odstrel = request.result;
           var tiles = that.byId("tiles").getContent();

           var planiran = 0;
           var izvrsen = 0;
           odstrel.forEach(element => {
               planiran += parseInt(element.planiran_odstrel);
               izvrsen += parseInt(element.izvrsen_odstrel);
           });

            tiles.forEach(tile => {
                if(tile.getHeader() == "Pregled odstrela"){
                    var odstotek = (izvrsen / planiran) * 100;
                    if(odstotek.toString().includes(".")){
                        odstotek = odstotek.toString().split(".")[0];
                    }
                    tile.getTileContent()[0].getContent().setValue(odstotek);
                }
            });
        };
    }
}

function clearPregledOdstrela(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["pregledOdstrela"], "readwrite");
        var objectStore = transaction.objectStore("pregledOdstrela");
        var request = objectStore.clear();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
           addPregledOdstrela(data);
        };
    }
}

function addAktivniLov(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["aktivniLov"], "readwrite")
                .objectStore("aktivniLov")
                .add({ime: data.ime, priimek: data.priimek, zacetek: data.zacetek, naziv_lovisca: data.naziv_lovisca});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.ime);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.username);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readAktivniLov(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["aktivniLov"]);
        var objectStore = transaction.objectStore("aktivniLov");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({"aktivniLovi" : request.result});
            that.byId("pregledAktivnihLovov").setModel(oModel);
        };
    }
}

function clearAktivniLov(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["aktivniLov"], "readwrite");
        var objectStore = transaction.objectStore("aktivniLov");
        var request = objectStore.clear();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
            data.forEach(element => {
                addAktivniLov(element);
            });
        };
    }
}

function addLovisca(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["lovisca"], "readwrite")
                .objectStore("lovisca")
                .add({naziv_lovisca: data.naziv_lovisca});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.naziv_lovisca);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.naziv_lovisca);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readLovisca(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["lovisca"]);
        var objectStore = transaction.objectStore("lovisca");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({lovisca : request.result});
            that.getView().setModel(oModel);
        };
    }
}

function clearLovisca(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["lovisca"], "readwrite");
        var objectStore = transaction.objectStore("lovisca");
        var request = objectStore.clear();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
            data.forEach(element => {
                addLovisca(element);
            });
        };
    }
}

function addDivjad(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["divjad"], "readwrite")
                .objectStore("divjad")
                .add({divjad: data.divjad});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.divjad);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.divjad);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readDivjad(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["divjad"]);
        var objectStore = transaction.objectStore("divjad");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({"divjad" : request.result});
            that.byId("plenTextInput").setModel(oModel);
        };
    }
}

function clearDivjad(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["divjad"], "readwrite");
        var objectStore = transaction.objectStore("divjad");
        var request = objectStore.clear();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
            data.forEach(element => {
                addDivjad(element);
            });
        };
    }
}

function addTrenutenLov(data) {
    var openRequest = openDB();
    var db;

    if(data.lovisce != undefined){
        data.naziv_lovisca = data.lovisce;
    }

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["trenutenLov"], "readwrite")
                .objectStore("trenutenLov")
                .add({naziv_lovisca: data.naziv_lovisca, zacetek: data.zacetek});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.naziv_lovisca);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.naziv_lovisca);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readTrenutenLov(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["trenutenLov"]);
        var objectStore = transaction.objectStore("trenutenLov");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
            globals.lov.lovisce = request.result[0].naziv_lovisca;
            globals.lov.username = globals.puo.username;
            globals.lov.zacetek = request.result[0].zacetek;
            setNaLovIcon(that);
        };
    }
}

function clearTrenutenLov(data) {
    var openRequest = openDB();
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
            if(data != ""){
                addTrenutenLov(data[0]);
            }
        };
    }
}

function addLovOffline(data) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function (event){
        db = openRequest.result;

        var request = db.transaction(["LovOffline"], "readwrite")
                .objectStore("LovOffline")
                .add({lovisce: data.lovisce, zacetek: data.zacetek, username: data.username, token: globals.puo.token, konec: data.konec, stevilo_strelov: data.stevilo_strelov, plen: data.plen});
                
        request.onsuccess = function(event) {
           console.log("Dodano " + data.lovisce);
        };
        
        request.onerror = function(event) {
            console.log("Že obstaja " + data.lovisce);
        }
    }

    openRequest.onupgradeneeded = function(event){
        db = openRequest.result;

        createObjectStores(db);
    }

    openRequest.error = function(event){
        console.log("Napaka pri odpiranju podatkovne baze");
    }
}

function readLovOffline(that) {
    var openRequest = openDB();
    var db;

    openRequest.onsuccess = function(event){
        db = openRequest.result;
        var transaction = db.transaction(["LovOffline"]);
        var objectStore = transaction.objectStore("LovOffline");
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log("Napaka pri branju iz indexedDB");
        };
        
        request.onsuccess = function(event) {
            globals.lov.lovisce = request.result[0].naziv_lovisca;
            globals.lov.username = globals.puo.username;
            globals.lov.zacetek = request.result[0].zacetek;
            setNaLovIcon(that);
        };
    }
}

function clearAndAddLovOffline(data) {
    var openRequest = openDB();
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
            addLovOffline(data);
        };
    }
}