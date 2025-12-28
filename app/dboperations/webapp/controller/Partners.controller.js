sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/ComboBox",
    "sap/m/DatePicker",
    "sap/m/TextArea",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",

], function (Controller, MessageBox, Dialog, Input, Button, Label, ComboBox, DatePicker, TextArea, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("dboperations.controller.Partners", {

        onInit: function () {
            this._loadReservationPartners()
        },
        _loadReservationPartners: function () {
            fetch("/odata/v4/real-estate/ReservationPartners")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "Partners");
                })
                .catch(err => console.error("Failed to load Partners:", err));
        },
        _openPartnerDialog: function (oPartner) {
            if (!this._oDialog) {
                this._oDialog = this.getView().byId("PartnerDialog");
            }

            const oModel = new JSONModel({
                ID: oPartner.ID,
                customerCode: oPartner.customerCode || "",
                customerName: oPartner.customerName || "",
                customerAddress: oPartner.customerAddress || "",
                validFrom: oPartner.validFrom || "",
                isEdit: !!oPartner.ID
            });

            this._oDialog.setModel(oModel, "local");
            this._oDialog.open();
        },
        onAddPartner: function () {
            this._openPartnerDialog({});
        },
        onEditPartner: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("Partners");
            const oData = oCtx.getObject();
            this._openPartnerDialog(oData);
        },
        onSavePartner: async function () {
            const oDialog = this._oDialog;
            const oModel = oDialog.getModel("local");
            const oData = oModel.getData();

            if (!oData.customerCode || !oData.customerName) {
                MessageBox.error("Customer Code and Customer Name are required.");
                return;
            }

            try {
                const payload = {
                    //ID:oData.ID,
                    customerCode: oData.customerCode,
                    customerName: oData.customerName,
                    customerAddress: oData.customerAddress,
                    validFrom: oData.validFrom
                        ? new Date(oData.validFrom).toISOString().split("T")[0]
                        : null
                };
                const method = oData.isEdit ? "PUT" : "POST";
                const url = oData.isEdit
                    ? `/odata/v4/real-estate/ReservationPartners(ID='${oData.ID}')`
                    : `/odata/v4/real-estate/ReservationPartners`;

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to save ReservationPartners");
                MessageToast.show("ReservationPartners saved successfully!");
                oDialog.close();
                this._loadReservationPartners();
            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },

        onCancelPartner: function () {
            this._oDialog.close();
        },

        onDeletePartner: function (oEvent) {


            const oCtx = oEvent.getSource().getBindingContext("Partners");
            const oData = oCtx.getObject();

            MessageBox.confirm(`Delete Partner ${oData.ID}?`, {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        try {
                            const res = await fetch(`/odata/v4/real-estate/ReservationPartners(ID='${oData.ID}')`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Delete failed");
                            MessageToast.show("Deleted successfully");
                            this._loadReservationPartners();
                        } catch (err) {
                            MessageBox.error(err.message);
                        }
                    }
                }
            });
        }

    });
});