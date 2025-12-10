sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",


], (Controller, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("dboperations.controller.CreateReservation", {
        onInit: function () {

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("CreateReservation").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sData = oEvent.getParameter("arguments").reservationData;
            this._resetReservationForm();

            if (sData) {
                var oReservation = JSON.parse(decodeURIComponent(sData));
                console.log("Decoded reservation:", oReservation);
                // Set the model
                var oModel = new sap.ui.model.json.JSONModel({

                    /*
                    bua: oReservation.bua,
companyCodeId: oReservation.companyCodeId,
project_projectId: oReservation.project_projectId,
unit_unitId: oReservation.unit_unitId,
building_buildingId: oReservation.building_buildingId,
unitPrice: oReservation.unitPrice,
paymentPlan_paymentPlanId: oReservation.paymentPlan_paymentPlanId,
 
                    */
                    bua: oReservation.bua,
                    companyCodeId: oReservation.companyCodeId,
                    project_projectId: oReservation.project_projectId,
                    unit_unitId: oReservation.unit_unitId,
                    building_buildingId: oReservation.buildingId,
                    unitPrice: oReservation.unitPrice,
                    paymentPlan_paymentPlanId: oReservation.paymentPlan_paymentPlanId,
                    // User-editable fields
                    oldReservationId: "",
                    eoiId: "",
                    salesType: "",
                    description: "",
                    validFrom: "",
                    status: "",
                    customerType: "",
                    currency: "",
                    afterSales: "",

                    phase: "",
                    pricePlanYears: 0,
                    planYears: 0,
                    planCurrency: "",

                    requestType: "",
                    reason: "",
                    cancellationDate: "",
                    cancellationStatus: "",
                    rejectionReason: "",
                    cancellationFees: 0,

                    payments: [],
                    partners: [],
                    conditions: []
                });
                this.getView().setModel(oModel, "local");
            }
            console.log(sData);

        },

        onSaveReservation: async function () {
            const oModel = this.getView().getModel("local");
            const oData = oModel.getData();

            const payload = {
                companyCodeId: oData.companyCodeId,
                project_projectId: oData.project_projectId,
                unit_unitId: oData.unit_unitId,
                bua: oData.bua,
                unitPrice: oData.unitPrice,
                paymentPlan_paymentPlanId: oData.paymentPlan_paymentPlanId,

                oldReservationId: oData.oldReservationId,
                eoiId: oData.eoiId,
                salesType: oData.salesType,
                description: oData.description,
                validFrom: oData.validFrom,
                status: (oData.status || "").charAt(0) || "O",
                customerType: oData.customerType,
                currency: oData.currency,
                afterSales: oData.afterSales,

                phase: oData.phase,
                pricePlanYears: oData.pricePlanYears,
                planYears: oData.planYears,
                planCurrency: oData.planCurrency,

                requestType: oData.requestType,
                reason: oData.reason,
                cancellationDate: oData.cancellationDate || null,
                cancellationStatus: oData.cancellationStatus,
                rejectionReason: oData.rejectionReason,
                cancellationFees: oData.cancellationFees,

                payments: oData.payments,
                partners: oData.partners,
                conditions: oData.conditions
            };

            try {
                const res = await fetch("/odata/v4/real-estate/Reservations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to create reservation");

                MessageToast.show("Reservation created successfully!");
                this._resetReservationForm();
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Units");

                oModel.setData({}); // Clear form
            } catch (err) {
                MessageBox.error(err.message);
            }
        },
        _resetReservationForm: function () {
            const oEmptyModel = new sap.ui.model.json.JSONModel({
                reservationId: "",
                companyCodeId: "",
                oldReservationId: "",
                eoiId: "",
                salesType: "",
                description: "",
                validFrom: "",
                status: "",
                customerType: "",
                currency: "",
                afterSales: "",
                project_projectId: "",
                building_buildingId: "",
                unit_unitId: "",
                paymentPlan_paymentPlanId: "",
                bua: 0,
                phase: "",
                pricePlanYears: 0,
                planYears: 0,
                unitPrice: 0,
                planCurrency: "",
                requestType: "",
                reason: "",
                cancellationDate: null,
                cancellationStatus: "",
                rejectionReason: "",
                cancellationFees: 0,
                payments: [],
                partners: [],
                conditions: []
            });

            this.getView().setModel(oEmptyModel, "local");
        },

        // Payments table
        onAddPaymentRow: function () {
            const oModel = this.getView().getModel("local");
            const aPayments = oModel.getProperty("/payments");
            aPayments.push({});
            oModel.refresh();
        },
        onDeletePaymentRow: function () {
            const oModel = this.getView().getModel("local");
            const aPayments = oModel.getProperty("/payments");
            aPayments.pop();
            oModel.refresh();
        },

        // Partners table
        onAddPartnerRow: function () {
            const oModel = this.getView().getModel("local");
            const aPartners = oModel.getProperty("/partners");
            aPartners.push({});
            oModel.refresh();
        },
        onDeletePartnerRow: function () {
            const oModel = this.getView().getModel("local");
            const aPartners = oModel.getProperty("/partners");
            aPartners.pop();
            oModel.refresh();
        },

        // Conditions table
        onAddConditionRow: function () {
            const oModel = this.getView().getModel("local");
            const aConditions = oModel.getProperty("/conditions");
            aConditions.push({});
            oModel.refresh();
        },
        onDeleteConditionRow: function () {
            const oModel = this.getView().getModel("local");
            const aConditions = oModel.getProperty("/conditions");
            aConditions.pop();
            oModel.refresh();
        },

        onCancelReservation: function () {
            this.getView().getModel("local").setData({}); // Clear form
        }
    });
});