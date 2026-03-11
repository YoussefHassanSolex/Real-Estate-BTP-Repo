sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("dboperations.controller.Frequencies", {

        onInit: function () {
            this._loadFrequencies();
        },

        onFrequencySelectionChange: function (oEvent) {
            const bHasSelection = !!oEvent.getSource().getSelectedItem();
            this.byId("btnEditFR").setEnabled(bHasSelection);
            this.byId("btnDeleteFR").setEnabled(bHasSelection);
        },

        _getSelectedFrequencyContext: function () {
            const oSelectedItem = this.byId("frequenciesTable").getSelectedItem();
            return oSelectedItem ? oSelectedItem.getBindingContext("frequencies") : null;
        },
        _getSelectedFrequencyCode: function () {
            const oCtx = this._getSelectedFrequencyContext();
            return oCtx ? oCtx.getObject().code : null;
        },
        _restoreFrequencySelection: function (sCode) {
            const oTable = this.byId("frequenciesTable");
            const oItem = sCode ? oTable.getItems().find(i => i.getBindingContext("frequencies")?.getObject().code === sCode) : null;
            if (oItem) {
                oTable.setSelectedItem(oItem, true);
                this.byId("btnEditFR").setEnabled(true);
                this.byId("btnDeleteFR").setEnabled(true);
            } else {
                oTable.removeSelections(true);
                this.byId("btnEditFR").setEnabled(false);
                this.byId("btnDeleteFR").setEnabled(false);
            }
        },

        // Load all Frequencies
        _loadFrequencies: function () {
            const sSelectedCode = this._getSelectedFrequencyCode();
            fetch("/odata/v4/real-estate/Frequencies")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "frequencies");
                    this._restoreFrequencySelection(sSelectedCode);
                })
                .catch(err => console.error("Failed to load Frequencies:", err));
        },

        // Add new Frequency
        onAddFrequency: function () {
            this._openFrequencyDialog({});
        },

        // Edit existing Frequency
        onEditFrequency: function () {
            const oCtx = this._getSelectedFrequencyContext();
            if (!oCtx) {
                MessageToast.show("Please select a frequency first.");
                return;
            }
            const oData = oCtx.getObject();
            this._openFrequencyDialog(oData);
        },

        // Open dialog for add/edit
        _openFrequencyDialog: function (oFrequency) {
            if (!this._oDialog) {
                this._oDialog = this.getView().byId("frequencyDialog");
            }

            const oModel = new JSONModel({
                code: oFrequency.code || "",
                description: oFrequency.description || "",
                isEdit: !!oFrequency.code // Flag to disable code input on edit
            });

            this._oDialog.setModel(oModel, "local");
            this._oDialog.open();
        },

        // Save (Create or Update)
        onSaveFrequency: async function () {
            const oDialog = this._oDialog;
            const oModel = oDialog.getModel("local");
            const oData = oModel.getData();

            if (!oData.code || !oData.description) {
                MessageBox.error("Code and Description are required.");
                return;
            }

            try {
                const method = oData.isEdit ? "PUT" : "POST";
                const url = oData.isEdit
                    ? `/odata/v4/real-estate/Frequencies(code='${oData.code}')`
                    : `/odata/v4/real-estate/Frequencies`;

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: oData.code, description: oData.description })
                });

                if (!res.ok) throw new Error("Failed to save Frequency");
                MessageToast.show("Frequency saved successfully!");
                oDialog.close();
                this._loadFrequencies();

            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },

        // Cancel dialog
        onCancelFrequency: function () {
            this._oDialog.close();
        },

        // Delete Frequency
        onDeleteFrequency: function () {
            const oCtx = this._getSelectedFrequencyContext();
            if (!oCtx) {
                MessageToast.show("Please select a frequency first.");
                return;
            }
            const oData = oCtx.getObject();

            MessageBox.confirm(`Delete Frequency ${oData.code}?`, {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        try {
                            const res = await fetch(`/odata/v4/real-estate/Frequencies(code='${oData.code}')`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Delete failed");
                            MessageToast.show("Deleted successfully");
                            this._loadFrequencies();
                        } catch (err) {
                            MessageBox.error(err.message);
                        }
                    }
                }
            });
        }
    });
});
