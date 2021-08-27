sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
    'sap/ui/core/Fragment'
 ], function (Controller, JSONModel, MessageToast, History, Fragment) {
    "use strict";
    return Controller.extend("sap.ui.demo.wt.controller.LovskaDruzina", {
        onInit : function () {
            var cookie = getCookie();
            if(cookie.token !== undefined){
                if(globals.puo.token === undefined){
                    globals.puo = cookie;
                }
            }
            else{
                window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
            }
            sap.ui.core.UIComponent.getRouterFor(this).getRoute("LovskaDruzina").attachPatternMatched(this.onRouteMatched, this);
        },

        onAfterRendering : function(){
            if(window.navigator.onLine){
                this.byId("bar").addStyleClass("bar")
            }
            else{
                this.byId("bar").addStyleClass("barOffline");
            }
        },

        onRouteMatched: function(){
            var cookie = getCookie();
            if(cookie.token !== undefined){
                if(cookie.token == "offline" && window.navigator.onLine){
                    deleteCookie(this);
                    window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
                }
                if(globals.puo.token === undefined){
                    globals.puo = cookie;
                }
            }
            else{
                window.open("https://fervent-agnesi-0837b8.netlify.app/", "_self");
            }

            this.byId("ldTitle").setText("Lovska družina " + globals.puo.ime_druzine);

            getObvestila(this);

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
            rows : [{"title":"elementum vestibulum","content":"placerat magna donec rutrum tortor sapien velit dolor magna amet porttitor adipiscing et ante massa amet aliquam ipsum vestibulum mattis"},{"title":"lacus placerat","content":"scelerisque curabitur amet sollicitudin magna massa consequat suspendisse lacus tortor vitae hendrerit nullam at sit vestibulum orci porta massa nullam"},{"title":"pulvinar lacus","content":"tellus eros lorem sapien sed dui magna lacus morbi dolor tortor porttitor tortor odio sagittis tincidunt ante eros quis tincidunt"},{"title":"porta magna","content":"pretium ipsum pulvinar tincidunt adipiscing magna nunc vestibulum lorem magna dolor non mattis massa tincidunt tortor et sit vestibulum molestie"},{"title":"lectus mi","content":"vestibulum elit quis placerat consectetur amet aliquam consectetur pulvinar porttitor lorem scelerisque nullam malesuada suspendisse etiam consequat nec lacus ipsum"}]
            });

            this.getView().setModel(oModel);
        },

        onNavBack: function(){
            var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined && sPreviousHash.length > 0 && sPreviousHash !== "Login") {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("App", true);
			}
        },

        onPress: function () {
            var oView = this.getView(),
                oButton = oView.byId("button");

            if (!this._oMenuFragment) {
                this._oMenuFragment = Fragment.load({
                    id: oView.getId(),
                    name: "sap.ui.demo.wt.fragment.UserMenu",
                    controller: this
                }).then(function(oMenu) {
                    oMenu.openBy(oButton);
                    this._oMenuFragment = oMenu;
                    return this._oMenuFragment;
                }.bind(this));
            } else {
                this._oMenuFragment.openBy(oButton);
            }
        },
        onMenuAction: function(oEvent) {
            var item = oEvent.getParameter("item");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
            if(item.getKey() === "domov"){
                oRouter.navTo("LovskaDruzina");
            }
            else if(item.getKey() === "naLov"){
                oRouter.navTo("NaLov");
            }
            else if(item.getKey() === "nadzornaPlosca"){
                oRouter.navTo("NadzornaPlosca");
            }
            else if(item.getKey() === "prvaStran"){
                oRouter.navTo("App");
            }
        },

        onLogOut: function(){
            deleteCookie(this);
        },

        onNav: function(oEvent){
            var navTo = oEvent.getParameter("id").split("--")[1];
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            if (navTo != undefined && navTo === "domov"){
                oRouter.navTo("LovskaDruzina");
            }
            else if (navTo != undefined && navTo === "naLov"){
                oRouter.navTo("NaLov");
            }
            else if (navTo != undefined && navTo === "nadzornaPlosca"){
                oRouter.navTo("NadzornaPlosca");
            }
            else if (navTo != undefined && navTo === "prvaStran"){
                oRouter.navTo("App");
            }
        }
    });
 });