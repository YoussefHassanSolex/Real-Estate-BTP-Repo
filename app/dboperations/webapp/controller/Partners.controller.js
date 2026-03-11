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
        onPartnerSelectionChange: function (oEvent) {
            const bHasSelection = !!oEvent.getSource().getSelectedItem();
            this.byId("btnEditPartner").setEnabled(bHasSelection);
            this.byId("btnDeletePartner").setEnabled(bHasSelection);
        },
        _getSelectedPartnerContext: function () {
            const oSelectedItem = this.byId("partnerTable").getSelectedItem();
            return oSelectedItem ? oSelectedItem.getBindingContext("Partners") : null;
        },
        _getSelectedPartnerId: function () {
            const oCtx = this._getSelectedPartnerContext();
            return oCtx ? oCtx.getObject().ID : null;
        },
        _restorePartnerSelection: function (sId) {
            const oTable = this.byId("partnerTable");
            const oItem = sId ? oTable.getItems().find(i => i.getBindingContext("Partners")?.getObject().ID === sId) : null;
            if (oItem) {
                oTable.setSelectedItem(oItem, true);
                this.byId("btnEditPartner").setEnabled(true);
                this.byId("btnDeletePartner").setEnabled(true);
            } else {
                oTable.removeSelections(true);
                this.byId("btnEditPartner").setEnabled(false);
                this.byId("btnDeletePartner").setEnabled(false);
            }
        },
        _loadReservationPartners: function () {
            const sSelectedId = this._getSelectedPartnerId();
            fetch("/odata/v4/real-estate/ReservationPartners")
                .then(res => res.json())
                .then(data => {
                      const uniqueData = data.value.filter((item, index, self) =>
                        index === self.findIndex(t => t.customerCode === item.customerCode)
                    );
                    this.getView().setModel(new JSONModel(uniqueData), "Partners");
                    this._restorePartnerSelection(sSelectedId);
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
        onEditPartner: function () {
            const oCtx = this._getSelectedPartnerContext();
            if (!oCtx) {
                MessageToast.show("Please select a partner first.");
                return;
            }
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

        onDeletePartner: function () {
            const oCtx = this._getSelectedPartnerContext();
            if (!oCtx) {
                MessageToast.show("Please select a partner first.");
                return;
            }
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
