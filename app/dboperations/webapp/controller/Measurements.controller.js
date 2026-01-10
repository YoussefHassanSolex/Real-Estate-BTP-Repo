sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("dboperations.controller.Measurements", {

        onInit: function () {
            this._loadMeasurements();
        },

        _loadMeasurements: function () {
            fetch("/odata/v4/real-estate/Measurements")
                .then(res => res.json())
                .then(data => {
                    const uniqueData = data.value.filter((item, index, self) =>
                        index === self.findIndex(t => t.code === item.code)
                    );
                    this.getView().setModel(new JSONModel(uniqueData), "measurements");
                })
                .catch(err => console.error("Failed to load Measurements:", err));
        },

        onAddMeasurement: function () {
            this._openMeasurementDialog({});
        },

        onEditMeasurement: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("measurements");
            const oData = oCtx.getObject();
            this._openMeasurementDialog(oData);
        },

        _openMeasurementDialog: function (oMeasurement) {
            if (!this._oDialog) {
                this._oDialog = this.getView().byId("measurementDialog");
            }

            const oModel = new JSONModel({
                code: oMeasurement.code || "",
                description: oMeasurement.description || "",
                ID: oMeasurement.ID || null,
                isEdit: !!oMeasurement.ID
            });

            this._oDialog.setModel(oModel, "local");
            this._oDialog.open();
        },

        onSaveMeasurement: async function () {
            const oDialog = this._oDialog;
            const oModel = oDialog.getModel("local");
            const oData = oModel.getData();

            if (!oData.code || !oData.description) {
                MessageBox.error("Code and Description are required.");
                return;
            }

            try {
                // Only include allowed fields
                const payload = { code: oData.code, description: oData.description };
                const method = oData.isEdit ? "PUT" : "POST";
                const url = oData.isEdit
                    ? `/odata/v4/real-estate/Measurements(ID='${oData.ID}')`
                    : `/odata/v4/real-estate/Measurements`;

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to save Measurement");
                MessageToast.show("Measurement saved successfully!");
                oDialog.close();
                this._loadMeasurements();
            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },

        onCancelMeasurement: function () {
            this._oDialog.close();
        },

        onDeleteMeasurement: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("measurements");
            const oData = oCtx.getObject();

            MessageBox.confirm(`Delete Measurement ${oData.code}?`, {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        try {
                            const res = await fetch(`/odata/v4/real-estate/Measurements(ID='${oData.ID}')`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Delete failed");
                            MessageToast.show("Deleted successfully");
                            this._loadMeasurements();
                        } catch (err) {
                            MessageBox.error(err.message);
                        }
                    }
                }
            });
        }
    });
});
