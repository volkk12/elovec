function checkData(that){
    var error = false;
    var date = that.byId("zacetekLova").getValue();
    if(date.length !== 8){
        that.byId("zacetekLova").setValueState("Error");
        error = true;
    }
    else{
        that.byId("zacetekLova").setValueState("Success");
    }

    var lovisce = that.byId("lovskaPreza").getValue();

    if(lovisce.length > 0){
        var lovsica = that.byId("lovskaPreza").getModel().getData().lovisca;
        var validLovisce = false;
        lovsica.forEach(element => {
            if(element.naziv_lovisca == lovisce){
                validLovisce = true;
            }
        });

        var formId = that.byId("lovskaPreza").sId + "-F"
        
        if(validLovisce){
            document.getElementById(formId).classList.add("success");
        }
        else{
            document.getElementById(formId).classList.add("error");
            error = true;
        }
    }
    else{
        var formId = that.byId("lovskaPreza").sId + "-F"
        document.getElementById(formId).classList.add("error");
        error = true;
    }

    return !error;
}

function checkLovZakljucen(that){
    var error = false;
    if(that.byId("strel").getSelectedIndex() === 0){
        var stStrelov = that.byId("stStrelovInput").getValue();
        if(stStrelov.length > 0){
            that.byId("stStrelovInput").setValueState("Success");
        }
        else{
            error = true;
            that.byId("stStrelovInput").setValueState("Error");
        }
    }

    if(that.byId("plen").getSelectedIndex() === 0){
        var stStrelov = that.byId("stStrelovInput").getValue();
        var formId = that.byId("plenTextInput").sId + "-F"
        var plen = that.byId("plenTextInput").getValue();
        var validPlen = false;

        if(stStrelov.length > 0){
            var divjad = that.byId("plenTextInput").getModel().getData().divjad
            divjad.forEach(element => {
                if(element.divjad == plen){
                    validPlen = true;
                }
            });

            if(validPlen){
                document.getElementById(formId).classList.add("success");
            }
            else{
                error = true;
                document.getElementById(formId).classList.add("error");
            }
        }
        else{
            error = true;
            document.getElementById(formId).classList.add("error");
        }
    }

    return !error;
}

function checkPrijavaSkode(that){
    var error = false;
    var data = {};

    var ime = that.byId("ime");
    
    if(ime.getValue().length > 0){
        ime.setValueState("Success");
        data.ime = ime.getValue();;
    }
    else{
        ime.setValueState("Error");
        error = true;
    }
    
    var priimek = that.byId("priimek");
    
    if(priimek.getValue().length > 0){
        priimek.setValueState("Success");
        data.priimek = priimek.getValue();;
    }
    else{
        priimek.setValueState("Error");
        error = true;
    }
    
    var tel = that.byId("tel");
    
    if(tel.getValue().length > 0){
        tel.setValueState("Success");
        data.tel = tel.getValue();;
    }
    else{
        tel.setValueState("Error");
        error = true;
    }

    var LD = that.byId("LD");

    if(LD.getValue().length > 0){
        var temperr = false;
        var formId = LD.sId + "-F"
        lovske_druzine.LD.forEach(druzina => {
            if(druzina.ime_druzine === LD.getValue()){
                temperr = true;
                document.getElementById(formId).classList.add("success");
                data.LD = LD.getValue();
            }
        });
        
        if(!temperr){
            document.getElementById(formId).classList.add("error");
            error = true;
        }
    }
    else{
        var formId = LD.sId + "-F"
        document.getElementById(formId).classList.add("error");
        error = true;
    }

    var opombe = that.byId("opombe").getValue();
    if(opombe.length > 0){
        data.opombe = opombe;
    }

    return { "valid" : !error , "data" : data};
}

function checkAddMemberData(that){
    var err = false;

    var ime = that.byId("memberName");
    var priimek = that.byId("memberSurname");
    var username = that.byId("username");
    var password = that.byId("userPassword");

    if(ime.getValue().length > 0){
        ime.setValueState("Success");
    }
    else{
        err = true;
        ime.setValueState("Error");
    }

    if(priimek.getValue().length > 0){
        priimek.setValueState("Success");
    }
    else{
        err = true;
        priimek.setValueState("Error");
    }
    
    if(username.getValue().length > 0){
        username.setValueState("Success");
    }
    else{
        err = true;
        username.setValueState("Error");
    }
    
    if(password.getValue().length > 0){
        password.setValueState("Success");
    }
    else{
        err = true;
        password.setValueState("Error");
    }

    var user ={
        ime: ime.getValue(),
        priimek: priimek.getValue(),
        username: username.getValue(),
        password: password.getValue(),
        valid: !err
    };

    return user;
}

function getJavnaObvestila(that){
    var obvestila;
    var settings = {
        "url": backend + "javna_obvestila",
        "method": "GET",
        "timeout": 0,
      };
    if(window.navigator.onLine){
        $.ajax(settings).done(function (response) {
            if(response !== "Ni javnih obvestil"){
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({obvestila : response});
                that.getView().setModel(oModel);
    
                var id = 0;
                response.forEach(element => {
                    addJavnaObvestila(id, element);
                    id++;
                });
            }
        });
    }
    else{
        readJavnaObvestila(that);
    }
}

function getLovskeDruzine(){
    if(window.navigator.onLine){
        var obvestila;
        var settings = {
            "url": backend + "lovske_druzine",
            "method": "GET",
            "timeout": 0,
          };
          
        $.ajax(settings).done(function (response) {
            if(response !== "Ni lovskih družin"){
                lovske_druzine = {"LD" : response};
    
                var id = 0;
                response.forEach(element => {
                    addLovskeDruzine(id, element);
                    id++;
                });
            }
        });
    }
}

function getAktivniLovi(that){
    if(window.navigator.onLine){
        var settings = {
            "url": backend + "aktivniLov",
            "method": "POST",
            "timeout": 0,
            "headers": {
              "Content-Type": "application/json",
              "Authorization": globals.puo.token
            },
            "data": JSON.stringify({"LD":globals.puo.ime_druzine}),
          };
          
        $.ajax(settings).done(function (response) {
            clearAktivniLov(response.aktivniLovi);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(response);
            that.byId("pregledAktivnihLovov").setModel(oModel);
        });
    }
    else{
        readAktivniLov(that);
    }
}

function getLovisca(that){
    if(window.navigator.onLine){
        var settings = {
            "url": backend + "lovisca",
            "method": "POST",
            "timeout": 0,
            "headers": {
              "Content-Type": "application/json",
              "Authorization": globals.puo.token
            },
            "data": JSON.stringify({"LD": globals.puo.ime_druzine}),
        };
          
        $.ajax(settings).done(function (response) {
            clearLovisca(response);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({lovisca : response});
            that.getView().setModel(oModel);
        });
    }
    else{
        readLovisca(that);
    }
}

function getDivjad(that){
    if(window.navigator.onLine){
        var settings = {
            "url": backend + "divjad",
            "method": "GET",
            "timeout": 0,
            "headers": {
              "Content-Type": "application/json",
              "Authorization": globals.puo.token
            },
        };
          
        $.ajax(settings).done(function (response) {
            clearDivjad(response);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({"divjad" : response});
            that.byId("plenTextInput").setModel(oModel);
        });
    }
    else{
        readDivjad(that);
    }
}

function getObvestila(that){
    var settings = {
        "url": backend + "zasebna_obvestila",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        }
      };
    
    if(window.navigator.onLine){
        $.ajax(settings).done(function (response) {
            var oModel = new sap.ui.model.json.JSONModel();
            if(response.info == undefined){
                response.forEach(element => {
                    addZasebnaObvestila(element.id, element)
                });
                oModel.setData({obvestila : response});
                that.getView().setModel(oModel);
            }
            else{
                oModel.setData({obvestila: [{"naslov" : response.info}]});
                that.getView().setModel(oModel);
            }
            console.log(response);
        });
    }
    else{
        readZasebnaObvestila(that);
    }
}

function sendPrijavaSkode(data, that){
    var settings = {
        "url": backend + "prijava_skode",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(data),
      };
      
      $.ajax(settings).done(function (response) {
        if(response === "Success"){
            sap.m.MessageToast.show("Škoda je bila uspešno prijavljena.");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("App");

            clearPrijavaSkodeFields(that);
        }
        else{
            sap.m.MessageToast.show("Napaka pri prijavi škode, poizkusite ponovno.");
        }
      });
}

function sendLov(data, that){
    data.zacetek = data.zacetek.addHours(2);
    if(data.konec != ""){
        data.konec = data.konec.addHours(2);
    }
    var settings = {
        "url": backend + "lov",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "Authorization": globals.puo.token
        },
        "data": JSON.stringify(data),
      };
      
      $.ajax(settings).done(function (response) {
        data.zacetek = data.zacetek.subtractHours(2);
        if(data.konec != ""){
            data.konec = data.konec.subtractHours(2);
        }
        if(response.Success == "X"){
            addLov(data);
            sap.m.MessageToast.show("Lov je bil uspešno dodan.");
            if(data.konec != ""){
                updateOdstrel(data);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("LovskaDruzina");
                globals.lov = {};
            }
            else{
                clearTrenutenLov([data]);
            }
        }
        else{
            sap.m.MessageToast.show("Napaka pri vpisu na lov, poizkusite ponovno.");
        }
      });
}

function updateOdstrel(data){
    var settings = {
        "url": backend + "update_plan",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify(data),
      };
      
      $.ajax(settings).done(function (response) {
          console.log("Success");
      });
}

function deleteLov(data, that){
    var settings = {
        "url": backend + "delete_lov",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "Authorization": globals.puo.token
        },
        "data": JSON.stringify(data),
      };
      
      $.ajax(settings).done(function (response) {
        if(response.Success == "X"){
            sap.m.MessageToast.show("Lov je bil uspešno izbrisan.");
        }
        else{
            sap.m.MessageToast.show("Napaka pri izbrisu lova, poizkusite ponovno.");
        }
      });
}

function steviloClanov(that){
    var settings = {
        "url": backend + "user_count",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"ld": globals.puo.ime_druzine}),
      };
      
      $.ajax(settings).done(function (response) {
        if(response.stevilo_clanov != null){
            var tiles = that.byId("tiles").getContent();
            tiles.forEach(tile => {
                if(tile.getHeader() == "Člani"){
                    tile.getTileContent()[0].getContent().setValue(response.stevilo_clanov);
                }
            });
            //that.byId("clani").getTileContent()[0].getContent().setValue(response.stevilo_clanov);
        }
        else{
           console.log("Napaka");
        }
    });
}

function steviloVlog(that){
    var settings = {
        "url": backend + "vloge_count",
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
      };
      
      $.ajax(settings).done(function (response) {
        if(response.stevilo_vlog != null){
            var tiles = that.byId("tiles").getContent();
            tiles.forEach(tile => {
                if(tile.getHeader() == "Vloge"){
                    tile.getTileContent()[0].getContent().setValue(response.stevilo_vlog);
                }
            });
            //that.byId("vloge").getTileContent()[0].getContent().setValue(response.stevilo_vlog);
        }
        else{
           console.log("Napaka");
        }
      });
}

function steviloObvestil(that){
    var settings = {
        "url": backend + "zasebna_obvestila_count",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"ld": globals.puo.ime_druzine}),
      };
      
      $.ajax(settings).done(function (response) {
        if(response.stevilo_obvestil != null){
            var tiles = that.byId("tiles").getContent();
            tiles.forEach(tile => {
                if(tile.getHeader() == "Obvestila"){
                    tile.getTileContent()[0].getContent().setValue(response.stevilo_obvestil);
                }
            });
            //that.byId("obvestila").getTileContent()[0].getContent().setValue(response.stevilo_obvestil);
        }
        else{
           console.log("Napaka");
        }
    });
}

function createUser(ime, priimek, username, password, that){
    var settings = {
        "url": backend + "addUser",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"ld":globals.puo.ime_druzine,"ime":ime,"priimek":priimek,"username":username,"password":password}),
      };
      
    $.ajax(settings).done(function (response) {
        if(response == "Dodan"){
            sap.m.MessageToast.show("Uporabnik " + username + " je bil uspešno dodan");
            clearAddMemberForm(that);
        }
    });
}

function userExists(ime, priimek, username, password, that){
    var settings = {
        "url": backend + "user_exists",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"username":username}),
      };
      
    $.ajax(settings).done(function (response) {
        if(response.UserExists == false){
            createUser(ime, priimek, username, password, that);
        }
        else if(response.UserExists){
            sap.m.MessageToast.show("Uporabnik z uporabniškim imenom " + username + " že obstaja");
        }
        else{
            console.log("Napaka");
        }
    });
}

function getUsers(that, mode){
    var settings = {
        "url": backend + "get_users",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"ld": globals.puo.ime_druzine}),
      };
      
    $.ajax(settings).done(function (response) {
        if(response.uporabniki != undefined){
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({uporabniki : response.uporabniki});
            if(mode == "clani"){
                that.byId("claniField").setModel(oModel);
            }
            else if(mode == "vloge"){
                that.byId("claniVlogeField").setModel(oModel);
            }
        }
        else{
            console.log("Napaka");
        }
    });
}

function removeUser(username, that){
    var settings = {
        "url": backend + "delete_users",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"username": username,"ld":globals.puo.ime_druzine}),
    };
      
    $.ajax(settings).done(function (response) {
        if(response.Success){
            sap.m.MessageToast.show("Uporabnik " + username + " je bil uspešno izbrisan.");
            that.byId("claniField").setValue("");
        }
        else if(response.Error){
            sap.m.MessageToast.show("Uporabnik " + username + " ni bil izbrisan.");
        }
        else{
            sap.m.MessageToast.show("Napaka pri brisanju uporabnika");
        }
    });
}

function getAllVloge(that){
    var settings = {
        "url": backend + "all_vloge",
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
      };
      
    $.ajax(settings).done(function (response) {
        if(response.vloge != undefined){
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({vloge : response.vloge});
            that.byId("vloge").setModel(oModel);
        }
        else{
            console.log("Napaka");
        }
    });
}

function getUserVloga(that, username){
    var settings = {
        "url": backend + "get_user_vloga",
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
            var vloge_ids = [];
            response.vloge.forEach(vloga => {
                vloge_ids.push(vloga.vloga_id);
            });
    
            that.byId("vloge").setSelectedKeys(vloge_ids);
        }
        else if(response.info == undefined){
            that.byId("vloge").setSelectedKeys([]);
            sap.m.MessageToast.show("Napaka pri pridobivanju vlog.");
        }
        else{
            that.byId("vloge").setSelectedKeys([]);
        }
    });
}

function checkVloge(vloge, username){
    var toAdd = [];
    var toDelete = [];
    
    if(vloge.length > 0){
        var settings = {
            "url": backend + "get_user_vloga",
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
                var vloge_ids = [];
                response.vloge.forEach(vloga => {
                    vloge_ids.push(vloga.vloga_id);
                });

                vloge.forEach(vloga => {
                    if(!vloge_ids.includes(parseInt(vloga))){
                        toAdd.push(vloga);
                    }
                });

                vloge_ids.forEach(vloga => {
                    if(!vloge.includes(vloga.toString())){
                        toDelete.push(vloga);
                    }
                });
            }
            else if(response.info != undefined){
                toAdd = vloge;
            }

            if(toAdd.length != 0){
                dodajVlogo(username, toAdd);
            }

            if(toDelete.length != 0){
                odstraniVlogo(username, toDelete);
            }
        });
    }
}

function odstraniVlogo(username, vloge){
    var settings = {
        "url": backend + "delete_vloge",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"username":username,"vloge":vloge}),
    };
      
    $.ajax(settings).done(function (response) {
        if(response.Success != undefined){
            sap.m.MessageToast.show("Vloge uspešno spremenjene.");
        }
        else{
            sap.m.MessageToast.show("Napaka pri brisanju vlog.");
        }
    });
}

function dodajVlogo(username, vloge){

    var userId = getUserID(username);

    var settings = {
        "url": backend + "add_vloge",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"user_id":userId,"vloge":vloge}),
    };
      
    $.ajax(settings).done(function (response) {
        if(response.Success != undefined){
            sap.m.MessageToast.show("Vloge uspešno spremenjene.");
        }
        else{
            sap.m.MessageToast.show("Napaka pri dodajanju vlog.");
        }
    });
}

function getUserID(username){
    var id;
    var settings = {
        "url": backend + "user_id",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"username":username}),
        "async": false,
    };
      
    $.ajax(settings).done(function (response) {
        id = response.id.uporabnik_id;
    });

    return id;
}

function getPregledOdstrela(that){
    if(window.navigator.onLine){
        var settings = {
            "url": backend + "pregled_odstrela",
            "method": "POST",
            "timeout": 0,
            "headers": {
              "Content-Type": "application/json",
              "Authorization": globals.puo.token
            },
            "data": JSON.stringify({"LD":globals.puo.ime_druzine}),
        };
          
        $.ajax(settings).done(function (response) {
            response.PregledOdstrela.forEach(element => {
                clearPregledOdstrela(element);
            });
    
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(response);
            that.getView().setModel(oModel);
        });
    }
    else{
        readPregledOdstrela(that);
    }
}

function getOdstotekOdstrela(that){
    var settings = {
        "url": backend + "odstotek_odstrela",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"LD":globals.puo.ime_druzine}),
    };
      
    $.ajax(settings).done(function (response) {
        if(response.odstrel != undefined){
            var tiles = that.byId("tiles").getContent();
            tiles.forEach(tile => {
                if(tile.getHeader() == "Pregled odstrela"){
                    var odstotek = (response.odstrel.izvrsen / response.odstrel.planiran) * 100;
                    if(odstotek.toString().includes(".")){
                        odstotek = odstotek.toString().split(".")[0];
                    }
                    tile.getTileContent()[0].getContent().setValue(odstotek);
                }
            });
            //that.byId("odstrel").getTileContent()[0].getContent().setValue(odstotek);
        }
        else{
            that.byId("odstrel").getTileContent()[0].getContent().setValue("-");
        }
    });
}

function getNeprebranaObvestila(that){
    var settings = {
        "url": backend + "neprebrana_obvestila",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"LD":globals.puo.ime_druzine}),
    };
      
    $.ajax(settings).done(function (response) {
        if(response.obvestila != undefined){
            var tiles = that.byId("tiles").getContent();
            tiles.forEach(tile => {
                if(tile.getHeader() == "Pregled škode"){
                    tile.getTileContent()[0].getContent().setValue(response.obvestila.neprebrana);
                }
            });
            //that.byId("pregledPrijaveSkode").getTileContent()[0].getContent().setValue(response.obvestila.neprebrana);
        }
        else{
            that.byId("pregledPrijaveSkode").getTileContent()[0].getContent().setValue("-");
        }
    });
}

function getPregledSkode(that){
    var settings = {
        "url": backend + "pregled_skode",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"LD":globals.puo.ime_druzine}),
    };
      
    $.ajax(settings).done(function (response) {
        response.PregledSkode.forEach(element => {
            if(element.pregledano == 0){
                element.pregledano = false;
            }
            else{
                element.pregledano = true;
            }
        });
        var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(response);
            that.getView().setModel(oModel);
    });
}

function updateSkoda(cells) {
    var ime = cells[0].getText().split(" ")[0];
    var priimek = cells[0].getText().split(" ")[1];
    var tel = cells[1].getText();
    var opombe = cells[2].getText();
    var pregledano = cells[3].getSelected();
    if(pregledano){
        pregledano = 1;
    }
    else{
        pregledano = 0;
    }

    var settings = {
        "url": backend + "update_skoda",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json",
          "Authorization": globals.puo.token
        },
        "data": JSON.stringify({"pregledano":pregledano,"ime":ime,"priimek":priimek,"telefonska":tel,"opombe":opombe}),
      };
      
      $.ajax(settings).done(function (response) {
        console.log(response);
      });
}

function clearAddMemberForm(that){
    that.byId("memberName").setValueState("None");
    that.byId("memberName").setValue("");
    that.byId("memberSurname").setValueState("None");
    that.byId("memberSurname").setValue("");
    that.byId("username").setValueState("None");
    that.byId("username").setValue("");
    that.byId("userPassword").setValueState("None");
    that.byId("userPassword").setValue("");
}

function clearPrijavaSkodeFields(that){
    that.byId("LD").setValue("");
    that.byId("ime").setValue("");
    that.byId("priimek").setValue("");
    that.byId("tel").setValue("");
    that.byId("ime").setValueState("None");
    that.byId("priimek").setValueState("None");
    that.byId("tel").setValueState("None");
    that.byId("opombe").setValue("");
}

function setNaLovIcon(that) {
    if(globals.lov.konec == undefined && globals.lov.zacetek != undefined){
        that.byId("item2").setEnabled(true);
        that.byId("idIconTabBarMulti").setSelectedKey("item2");
        that.byId("item1").setEnabled(false);
        that.byId("item3").setEnabled(false);
    }
    else if(globals.lov.konec == undefined){
        that.byId("zacetekLova").setDateValue(new Date());
        that.byId("zacetekLova").setValueState("None");
        that.byId("lovskaPreza").setValue("");
        that.byId("stStrelovInput").setValue("");
        that.byId("plenTextInput").setValue("");
        that.byId("item2").setEnabled(false);
        that.byId("item3").setEnabled(false);
        that.byId("idIconTabBarMulti").setSelectedKey("item1");
        that.byId("item1").setEnabled(true);
    }
}