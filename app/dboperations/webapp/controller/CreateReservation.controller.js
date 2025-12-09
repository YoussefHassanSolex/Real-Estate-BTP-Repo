sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("dboperations.controller.CreateReservation", {
        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("CreateReservation")
                .attachPatternMatched(this._onRouteMatched, this);

            // Initialize empty model
            this._initEmptyForm();
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var oQuery = oArgs["?query"];

            if (oQuery && oQuery.prefill) {
                try {
                    var oData = JSON.parse(decodeURIComponent(oQuery.prefill));
                    this._prefillReservationForm(oData);
                } catch (e) {
                    sap.m.MessageBox.error("Failed to load unit data.");
                    console.error(e);
                }
            } else {
                this._initEmptyForm();
            }
            console.log("Routed Data",this._initEmptyForm);
            
        },

        _initEmptyForm: function () {
            var oEmpty = {
                companyCodeId: "1000",
                project_projectId: "",
                building_buildingId: "",
                unit_unitId: "",
                bua: 0,
                unitPrice: 0,
                paymentPlan_paymentPlanId: "",
                currency: "AED",
                description: "",
                salesType: "Primary",
                customerType: "Individual",
                status: "Draft",
                payments: [],
                partners: [],
                conditions: []
            };
            this.getView().setModel(new JSONModel(oEmpty), "reservation");
        },

        _prefillReservationForm: function (oData) {
            var oPrefilled = {
                companyCodeId: oData.companyCodeId || "1000",
                project_projectId: oData.project_projectId || "",
                building_buildingId: oData.building_buildingId || "",
                unit_unitId: oData.unit_unitId || "",
                bua: parseFloat(oData.bua) || 0,
                unitPrice: parseFloat(oData.unitPrice) || 0,
                paymentPlan_paymentPlanId: oData.paymentPlan_paymentPlanId || "",
                planCurrency: oData.currency || "AED",
                description: oData.description || `Reservation for Unit ${oData.unit_unitId}`,
                salesType: "Primary",
                customerType: "Individual",
                status: "Draft",
                validFrom: new Date().toISOString().split("T")[0],
                payments: [],
                partners: [],
                conditions: []
            };

            this.getView().setModel(new JSONModel(oPrefilled), "reservation");
        }

    });
});