sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("dboperations.controller.ConditionTypes", {

        onInit: function () {
            this._loadConditionTypes();
        },

        onConditionTypeSelectionChange: function (oEvent) {
            const bHasSelection = !!oEvent.getSource().getSelectedItem();
            this.byId("btnEditConditionType").setEnabled(bHasSelection);
            this.byId("btnDeleteConditionType").setEnabled(bHasSelection);
        },

        _getSelectedConditionTypeContext: function () {
            const oSelectedItem = this.byId("conditionTypesTable").getSelectedItem();
            return oSelectedItem ? oSelectedItem.getBindingContext("conditionTypes") : null;
        },
        _getSelectedConditionTypeCode: function () {
            const oCtx = this._getSelectedConditionTypeContext();
            return oCtx ? oCtx.getObject().code : null;
        },
        _restoreConditionTypeSelection: function (sCode) {
            const oTable = this.byId("conditionTypesTable");
            const oItem = sCode ? oTable.getItems().find(i => i.getBindingContext("conditionTypes")?.getObject().code === sCode) : null;
            if (oItem) {
                oTable.setSelectedItem(oItem, true);
                this.byId("btnEditConditionType").setEnabled(true);
                this.byId("btnDeleteConditionType").setEnabled(true);
            } else {
                oTable.removeSelections(true);
                this.byId("btnEditConditionType").setEnabled(false);
                this.byId("btnDeleteConditionType").setEnabled(false);
            }
        },

        // Load all ConditionTypes
        _loadConditionTypes: function () {
            const sSelectedCode = this._getSelectedConditionTypeCode();
            fetch("/odata/v4/real-estate/ConditionTypes")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "conditionTypes");
                    this._restoreConditionTypeSelection(sSelectedCode);
                })
                .catch(err => console.error("Failed to load ConditionTypes:", err));
        },

        // Add new ConditionType
        onAddConditionType: function () {
            this._openConditionTypeDialog({});
        },

        // Edit existing ConditionType
        onEditConditionType: function () {
            const oCtx = this._getSelectedConditionTypeContext();
            if (!oCtx) {
                MessageToast.show("Please select a condition type first.");
                return;
            }
            const oData = oCtx.getObject();
            this._openConditionTypeDialog(oData);
        },

        // Open dialog for add/edit
        _openConditionTypeDialog: function (oConditionType) {
            if (!this._oDialog) {
                this._oDialog = this.getView().byId("conditionTypeDialog");
            }

            const oModel = new JSONModel({
                code: oConditionType.code || "",
                description: oConditionType.description || "",
                isEdit: !!oConditionType.code // Flag to disable code input on edit
            });

            this._oDialog.setModel(oModel, "local");
            this._oDialog.open();
        },

        // Save (Create or Update)
        onSaveConditionType: async function () {
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
                    ? `/odata/v4/real-estate/ConditionTypes(code='${oData.code}')`
                    : `/odata/v4/real-estate/ConditionTypes`;

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: oData.code, description: oData.description })
                });

                if (!res.ok) throw new Error("Failed to save ConditionType");
                MessageToast.show("ConditionType saved successfully!");
                oDialog.close();
                this._loadConditionTypes();

            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },

        // Cancel dialog
        onCancelConditionType: function () {
            this._oDialog.close();
        },

        // Delete ConditionType
        onDeleteConditionType: function () {
            const oCtx = this._getSelectedConditionTypeContext();
            if (!oCtx) {
                MessageToast.show("Please select a condition type first.");
                return;
            }
            const oData = oCtx.getObject();

            MessageBox.confirm(`Delete ConditionType ${oData.code}?`, {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        try {
                            const res = await fetch(`/odata/v4/real-estate/ConditionTypes(code='${oData.code}')`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Delete failed");
                            MessageToast.show("Deleted successfully");
                            this._loadConditionTypes();
                        } catch (err) {
                            MessageBox.error(err.message);
                        }
                    }
                }
            });
        }
    });
});
