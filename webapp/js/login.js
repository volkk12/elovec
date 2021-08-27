function login(username, password, that){
    var settings = {
        "url": backend + "login",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify({"username":username,"password":password}),
      };
      
    if(window.navigator.onLine){
      $.ajax(settings).done(function (response) {
        if(response.token !== undefined){
            that.byId("user").setValue("");
            that.byId("password").setValue("");
            that.byId("user").setValueState("None");
            that.byId("password").setValueState("None");

            globals.puo = response;
            addUser(username, password, response.ime_druzine);

            var expire = new Date();
            expire.setHours(expire.getHours() + 1);
            document.cookie = 'puo=' + JSON.stringify(response) +'; expires=' + expire + '; path=/'
            getVloge(username);
            getAktivenLov(username);
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            oRouter.navTo("LovskaDruzina");
        }
        else{
            that.byId("user").setValueState("Error");
            that.byId("password").setValueState("Error");
        }
      });
    }
    else{
      readUser(that, username, password);
    }
}

function getCookie(){
  var cookie = document.cookie.replace(/(?:(?:^|.*;s* )puo*=s*([^;]*).*$)|^.*$/, '$1');
  return cookie !== "" ? JSON.parse(cookie) : cookie;
}

function deleteCookie(that){
  document.cookie = "puo=; max-age=-1, path=/;";

  var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
  oRouter.navTo("App");
}

function getVloge(username){
  var settings = {
    "url": backend + "vloge",
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "application/json",
      "Authorization": globals.puo.token
    },
    "data": JSON.stringify({"username": username}),
  };
  
  $.ajax(settings).done(function (response) {
    if(response.vloge != undefined){
      globals.puo.vloge = response.vloge;

      var expire = new Date();
      expire.setHours(expire.getHours() + 1);

      document.cookie = 'puo=' + JSON.stringify(globals.puo) +'; expires=' + expire + '; path=/'
    }
    else if(response.info != null){
      console.log("Uporabnik nima vlog");
    }
    else{
      console.log("Napaka pri pridobivanju vlog");
    }
  });
}

function getAktivenLov(username){
  if(window.navigator.onLine){
    var settings = {
      "url": backend + "aktivenLov",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json",
        "Authorization": globals.puo.token
      },
      "async": false,
      "data": JSON.stringify({"username":username}),
    };
    
    $.ajax(settings).done(function (response) {
      if(response.info == undefined){
        clearTrenutenLov(response.AktivniLov);
        globals.lov = {
          username : globals.puo.username,
          lovisce : response.AktivniLov[0].naziv_lovisca,
          zacetek : new Date(response.AktivniLov[0].zacetek)
        }
      }
      else{
        globals.lov = {};
        clearTrenutenLov("");
      }
    });
  }
}