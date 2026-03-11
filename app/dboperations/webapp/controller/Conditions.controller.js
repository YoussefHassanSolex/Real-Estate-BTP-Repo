sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("dboperations.controller.Conditions", {

        onInit: function () {
            this._loadConditions();
        },

        onConditionSelectionChange: function (oEvent) {
            const bHasSelection = !!oEvent.getSource().getSelectedItem();
            this.byId("btnEditCondition").setEnabled(bHasSelection);
            this.byId("btnDeleteCondition").setEnabled(bHasSelection);
        },

        _getSelectedConditionContext: function () {
            const oSelectedItem = this.byId("conditionsTable").getSelectedItem();
            return oSelectedItem ? oSelectedItem.getBindingContext("conditions") : null;
        },
        _getSelectedConditionId: function () {
            const oCtx = this._getSelectedConditionContext();
            return oCtx ? oCtx.getObject().ID : null;
        },
        _restoreConditionSelection: function (sId) {
            const oTable = this.byId("conditionsTable");
            const oItem = sId ? oTable.getItems().find(i => i.getBindingContext("conditions")?.getObject().ID === sId) : null;
            if (oItem) {
                oTable.setSelectedItem(oItem, true);
                this.byId("btnEditCondition").setEnabled(true);
                this.byId("btnDeleteCondition").setEnabled(true);
            } else {
                oTable.removeSelections(true);
                this.byId("btnEditCondition").setEnabled(false);
                this.byId("btnDeleteCondition").setEnabled(false);
            }
        },

        _loadConditions: function () {
            const sSelectedId = this._getSelectedConditionId();
            fetch("/odata/v4/real-estate/Conditions")
                .then(res => res.json())
                .then(data => {
                    const uniqueData = data.value.filter((item, index, self) =>
                        index === self.findIndex(t => t.code === item.code)
                    );
                    this.getView().setModel(new JSONModel(uniqueData), "conditions");
                    this._restoreConditionSelection(sSelectedId);
                })
                .catch(err => console.error("Failed to load Conditions:", err));
        },

        onAddCondition: function () {
            this._openConditionDialog({});
        },

        onEditCondition: function () {
            const oCtx = this._getSelectedConditionContext();
            if (!oCtx) {
                MessageToast.show("Please select a condition first.");
                return;
            }
            const oData = oCtx.getObject();
            this._openConditionDialog(oData);
        },

        _openConditionDialog: function (oCondition) {
            if (!this._oDialog) {
                this._oDialog = this.getView().byId("conditionDialog");
            }

            const oModel = new JSONModel({
                code: oCondition.code || "",
                description: oCondition.description || "",
                ID: oCondition.ID || null,
                isEdit: !!oCondition.code // Flag to disable code input on edit
            });

            this._oDialog.setModel(oModel, "local");
            this._oDialog.open();
        },

        onSaveCondition: async function () {
            const oDialog = this._oDialog;
            const oModel = oDialog.getModel("local");
            const oData = oModel.getData();

            if (!oData.code || !oData.description) {
                MessageBox.error("Code and Description are required.");
                return;
            }

            try {
                const payload = { code: oData.code, description: oData.description };
                const method = oData.isEdit ? "PUT" : "POST";
                const url = oData.isEdit
                    ? `/odata/v4/real-estate/Conditions(ID='${oData.ID}')`
                    : `/odata/v4/real-estate/Conditions`;

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to save Condition");
                MessageToast.show("Condition saved successfully!");
                oDialog.close();
                this._loadConditions();
            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },

        onCancelCondition: function () {
            this._oDialog.close();
        },

        onDeleteCondition: function () {
            const oCtx = this._getSelectedConditionContext();
            if (!oCtx) {
                MessageToast.show("Please select a condition first.");
                return;
            }
            const oData = oCtx.getObject();

            MessageBox.confirm(`Delete Condition ${oData.code}?`, {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        try {
                            const res = await fetch(`/odata/v4/real-estate/Conditions(ID='${oData.ID}')`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Delete failed");
                            MessageToast.show("Deleted successfully");
                            this._loadConditions();
                        } catch (err) {
                            MessageBox.error(err.message);
                        }
                    }
                }
            });
        }
    });
});
