sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/m/VBox",
    "sap/m/DatePicker",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/ui/model/json/JSONModel",
    "sap/m/Title",
    "sap/m/IconTabBar",
    "sap/m/IconTabFilter",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/MessageToast",
    "sap/m/ComboBox",  // Added for dropdowns
    "sap/ui/core/Item",  // Added for dropdown items
    "sap/m/Select"  // Added for selects
], function (
    Controller, MessageBox, Dialog, Input, Button, Label, Text, TextArea, VBox,
    DatePicker, Table, Column, ColumnListItem, JSONModel, Title, IconTabBar, IconTabFilter, SimpleForm, MessageToast,
    ComboBox, Item, Select
) {
    "use strict";

    return Controller.extend("dboperations.controller.Buildings", {
        onInit() {
            this.getOwnerComponent().getRouter()
                .getRoute("Buildings")
                .attachPatternMatched(this._onRouteMatched, this);

            var oModel = new sap.ui.model.json.JSONModel({
                Buildings: [],
                Projects: []
            });
            this.getView().setModel(oModel, "view");

            var oModel = new JSONModel();
            fetch("/odata/v4/real-estate/Buildings")
                .then(response => response.json())
                .then(data => {
                    oModel.setData({ Buildings: data.value });
                    this.getView().byId("buildingsTable").setModel(oModel);
                })
                .catch(err => {
                    console.error("Error fetching Buildings", err);
                });
            fetch("/odata/v4/real-estate/Projects")
                .then(response => response.json())
                .then(data => {
                    oModel.setData({ Projects: data.value });
                })
                .catch(err => {
                    console.error("Error fetching Buildings", err);
                });

            // Added: Load additional lists like in Units
            this._loadMeasurementsList();
            this._loadConditionsList();
            this._loadCompanyCodesList();
            this._loadProjectsList();
            this._loadBuildingsList();

            // Added: Unit ID counter for auto-generation (shared with Units)
            this._unitIdCounter = parseInt(localStorage.getItem("unitIdCounter")) || 0;
        },

        _onRouteMatched: function () {
            this._loadBuildings();
        },

        _loadBuildings: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            fetch("/odata/v4/real-estate/Buildings")
                .then(response => response.json())
                .then(data => {
                    oModel.setData({ Buildings: data.value });
                    this.getView().byId("buildingsTable").setModel(oModel);
                })
                .catch(err => {
                    console.error("Error fetching Buildings ", err);
                });
        },

        // Added: Load measurements list (from Units)
        _loadMeasurementsList: function () {
            fetch("/odata/v4/real-estate/Measurements")
                .then(res => res.json())
                .then(data => {
                    const uniqueMeasurements = data.value.reduce((acc, curr) => {
                        if (!acc.find(c => c.code === curr.code)) {
                            acc.push({ code: curr.code, description: curr.description });
                        }
                        return acc;
                    }, []);
                    this.getView().setModel(new JSONModel(uniqueMeasurements), "measurementsList");
                })
                .catch(err => console.error("Failed to load Measurements list:", err));
        },

        // Added: Load conditions list (from Units)
        _loadConditionsList: function () {
            fetch("/odata/v4/real-estate/Conditions")
                .then(res => res.json())
                .then(data => {
                    const uniqueConditions = data.value.reduce((acc, curr) => {
                        if (!acc.find(c => c.code === curr.code)) {
                            acc.push({ code: curr.code, description: curr.description });
                        }
                        return acc;
                    }, []);
                    this.getView().setModel(new JSONModel(uniqueConditions), "conditionsList");
                })
                .catch(err => console.error("Failed to load Conditions list:", err));
        },

        // Added: Load company codes list (from Units)
        _loadCompanyCodesList: function () {
            fetch("/odata/v4/real-estate/Projects")
                .then(res => res.json())
                .then(data => {
                    const uniqueCompanyCodes = data.value.reduce((acc, curr) => {
                        if (!acc.find(c => c.companyCodeId === curr.companyCodeId)) {
                            acc.push({ companyCodeId: curr.companyCodeId, companyCodeDescription: curr.companyCodeDescription });
                        }
                        return acc;
                    }, []);
                    this.getView().setModel(new JSONModel(uniqueCompanyCodes), "companyCodesList");
                })
                .catch(err => console.error("Failed to load Company Codes list:", err));
        },

        // Added: Load projects list (from Units)
        _loadProjectsList: function () {
            fetch("/odata/v4/real-estate/Projects")
                .then(res => res.json())
                .then(data => {
                    const projectIds = data.value.reduce((acc, curr) => {
                        if (!acc.find(c => c.projectId === curr.projectId)) {
                            acc.push({ projectId: curr.projectId, projectDescription: curr.projectDescription, profitCenter: curr.profitCenter, functionalArea: curr.functionalArea });
                        }
                        return acc;
                    }, []);
                    this.getView().setModel(new JSONModel(projectIds), "projectsList");
                })
                .catch(err => console.error("Failed to load Projects list:", err));
        },

        // Added: Load buildings list (from Units)
        _loadBuildingsList: function () {
            fetch("/odata/v4/real-estate/Buildings")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "buildingsList");
                })
                .catch(err => console.error("Failed to load Buildings list:", err));
        },

        // Added: Helper to update filtered buildings (from Units)
        _updateFilteredBuildings: function (sProjectId, oModel) {
            const allBuildings = this.getView().getModel("buildingsList").getData();
            const filtered = allBuildings.filter(b => b.projectId === sProjectId);
            oModel.setProperty("/filteredBuildings", filtered);
        },

        // Added: Company code change handler (from Units)
        onCompanyCodeChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var oSelectedItem = oComboBox.getSelectedItem();
            var sDescription = oSelectedItem ? oSelectedItem.getText().split(" - ")[1] || "" : "";
            var oContext = oComboBox.getBindingContext();
            if (oContext) {
                oContext.setProperty("companyCodeDescription", sDescription);
            }
        },

        // Added: Project change handler (from Units)
        onProjectChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var oSelectedItem = oComboBox.getSelectedItem();
            var sDescription = oSelectedItem ? oSelectedItem.getText().split(" - ")[1] || "" : "";
            var oModel = oComboBox.getModel();
            oModel.setProperty("/projectDescription", sDescription);

            const projects = this.getView().getModel("projectsList").getData();
            const selectedProject = projects.find(p => p.projectId === sSelectedKey);
            if (selectedProject) {
                oModel.setProperty("/profitCenter", selectedProject.profitCenter);
                oModel.setProperty("/functionalArea", selectedProject.functionalArea);
            }

            this._updateFilteredBuildings(sSelectedKey, oModel);
            oModel.setProperty("/buildingId", "");
            oModel.setProperty("/buildingDescription", "");
        },

        // Added: Building change handler (from Units)
        onBuildingChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var oSelectedItem = oComboBox.getSelectedItem();
            var sDescription = oSelectedItem ? oSelectedItem.getText().split(" - ")[1] || "" : "";
            var oModel = oComboBox.getModel();
            oModel.setProperty("/buildingDescription", sDescription);
        },

        // Added: Usage type change handler (from Units)
        onAddDialogUsageTypeChange: function () {
            var oUsageSelect = sap.ui.getCore().byId("usageTypeDescInput");
            var oUnitTypeSelect = sap.ui.getCore().byId("unitTypeDescInput");

            var sUsageType = oUsageSelect.getSelectedKey();
            var oModel = this._oAddDialog.getModel();
            oModel.setProperty("/usageTypeDescription", sUsageType);

            oUnitTypeSelect.removeAllItems();

            var mUnitTypes = {
                "Residential": ["Apartment", "Villa", "Townhouse", "Studio"],
                "Commercial": ["Retail", "Shops"],
                "Admin": ["Office", "Clinic"]
            };

            var aTypes = mUnitTypes[sUsageType] || [];
            oUnitTypeSelect.setEnabled(aTypes.length > 0);

            aTypes.forEach(function (type) {
                oUnitTypeSelect.addItem(new sap.ui.core.Item({
                    key: type,
                    text: type
                }));
            });

            oModel.setProperty("/unitTypeDescription", "");
        },

        // Added: Measurement code change handler (from Units)
        onMeasurementCodeChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var oSelectedItem = oComboBox.getSelectedItem();
            var sDescription = oSelectedItem ? oSelectedItem.getText().split(" - ")[1] || "" : "";
            var oContext = oComboBox.getBindingContext();
            if (oContext) {
                oContext.getModel().setProperty(oContext.getPath() + "/description", sDescription);
            }
        },

        // Added: Condition code change handler (from Units)
        onConditionCodeChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var oSelectedItem = oComboBox.getSelectedItem();
            var sDescription = oSelectedItem ? oSelectedItem.getText().split(" - ")[1] || "" : "";
            var oContext = oComboBox.getBindingContext();
            if (oContext) {
                oContext.getModel().setProperty(oContext.getPath() + "/description", sDescription);

                var numberOfYears = 0;
                if (sSelectedKey === "CASH") numberOfYears = 0;
                else if (sSelectedKey === "5YP") numberOfYears = 5;
                else if (sSelectedKey === "7YP") numberOfYears = 7;
                oContext.getModel().setProperty(oContext.getPath() + "/numberOfYears", numberOfYears);
            }
        },

        // Added: Add measurement row (from Units)
        onAddMeasurementRow: function () {
            const oModel = this._oAddDialog.getModel();
            oModel.getProperty("/measurements").push({ code: "", description: "", quantity: 0, uom: "" });
            oModel.refresh();
        },

        // Added: Delete measurement row (from Units)
        onDeleteMeasurementRow: function () {
            const oModel = this._oAddDialog.getModel();
            const aMeasurements = oModel.getProperty("/measurements");
            aMeasurements.pop();
            oModel.refresh();
        },

        // Added: Add condition row (from Units)
        onAddConditionRow: function () {
            const oModel = this._oAddDialog.getModel();
            oModel.getProperty("/conditions").push({ code: "", description: "", amount: 0, currency: "", numberOfYears: 0 });
            oModel.refresh();
        },

        // Added: Delete condition row (from Units)
        onDeleteConditionRow: function () {
            const oModel = this._oAddDialog.getModel();
            const aConditions = oModel.getProperty("/conditions");
            aConditions.pop();
            oModel.refresh();
        },

        // Added: Reset dialog fields (from Units)
        _resetAddDialogFields: function () {
            var oModel = this._oAddDialog.getModel();
            oModel.setData({
                unitDescription: "",
                companyCodeId: "",
                companyCodeDescription: "",
                projectId: "",
                projectDescription: "",
                buildingId: "",
                buildingDescription: "",
                unitTypeDescription: "",
                usageTypeDescription: "",
                unitStatusDescription: "",
                floorDescription: "",
                zone: "",
                salesPhase: "",
                finishingSpexDescription: "",
                profitCenter: "",
                functionalArea: "",
                unitDeliveryDate: "",
                supplementaryText: "",
                measurements: [],
                conditions: [],
                filteredBuildings: []
            });

            [
                "unitDescInput", "companyCodeIdInput", "companyCodeDescInput",
                "projectIdInput", "projectDescInput", "buildingIdInput", "buildingDescInput",
                "unitTypeDescInput", "usageTypeDescInput", "unitStatusDescInput", "floorDescInput",
                "zoneInput", "salesPhaseInput", "finishingSpexDescInput",
                "unitDeliveryDateInput", "supplementaryTextInput"
            ].forEach(function (id) {
                var oControl = sap.ui.getCore().byId(id);
                if (oControl) oControl.setValueState("None");
            });
        },

      // Updated: Enhanced to match Units' full dialog with fixes for Company Code Description and Building ID
onNavigateToAddUnit: function (oEvent) {
    const oContext = oEvent.getSource().getBindingContext();
    const oBuildingData = oContext.getObject();

    const oData = {
        unitDescription: "",
        companyCodeId: oBuildingData.companyCodeId || "",
        companyCodeDescription: oBuildingData.companyCodeDescription || "",
        projectId: oBuildingData.projectId,
        projectDescription: oBuildingData.projectDescription,
        buildingId: oBuildingData.buildingId,
        buildingDescription: oBuildingData.buildingDescription,
        unitTypeDescription: "",
        usageTypeDescription: "",
        unitStatusDescription: "",
        floorDescription: "",
        zone: "",
        salesPhase: "",
        finishingSpexDescription: "",
        profitCenter: oBuildingData.profitCenter || "",
        functionalArea: oBuildingData.functionalArea || "",
        unitDeliveryDate: "",
        supplementaryText: "",
        measurements: [],
        conditions: [],
        filteredBuildings: []  // Added: Initialize empty array for filtered buildings
    };

    const oModel = new sap.ui.model.json.JSONModel(oData);
    if (this._oAddDialog) {
        this._oAddDialog.destroy();
        this._oAddDialog = null;
    }

    this._oAddDialog = new sap.m.Dialog({
        title: "Add Unit for " + oData.buildingDescription,
        contentWidth: "80%",
        resizable: true,
        draggable: true,
        content: new sap.m.VBox({
            items: [
                new sap.m.Label({ text: "Unit Description", required: true }),
                new sap.m.Input("unitDescInput", { value: "{/unitDescription}", tooltip: "Up to 60 characters" }),

                new sap.m.Label({ text: "Company Code ID", required: true }),
                new ComboBox("companyCodeIdInput", {
                    selectedKey: "{/companyCodeId}",
                    change: this.onCompanyCodeChange.bind(this),
                    items: { path: "companyCodesList>/", template: new Item({ key: "{companyCodesList>companyCodeId}", text: "{companyCodesList>companyCodeId} - {companyCodesList>companyCodeDescription}" }) },
                    tooltip: "Must be 4 characters"
                }),

                new sap.m.Label({ text: "Company Code Description", required: true }),
                new sap.m.Input("companyCodeDescInput", { value: "{/companyCodeDescription}", tooltip: "Up to 60 characters" }),  // Fixed: Bound to dialog model

                new sap.m.Label({ text: "Project ID", required: true }),
                new ComboBox("projectIdInput", {
                    selectedKey: "{/projectId}",
                    change: this.onProjectChange.bind(this),
                    editable: false,
                    items: { path: "projectsList>/", template: new Item({ key: "{projectsList>projectId}", text: "{projectsList>projectId} - {projectsList>projectDescription}" }) },
                    tooltip: "Must be 8 characters"
                }),

                new sap.m.Label({ text: "Project Description", required: true }),
                new sap.m.Input("projectDescInput", { value: "{/projectDescription}", editable: false }),

                new sap.m.Label({ text: "Building ID", required: true }),
                new ComboBox("buildingIdInput", {
                    selectedKey: "{/buildingId}",
                    change: this.onBuildingChange.bind(this),
                    editable: false,
                    items: { path: "/filteredBuildings", template: new Item({ key: "{buildingId}", text: "{buildingId} - {buildingDescription}" }) }
                }),

                new sap.m.Label({ text: "Building Description", required: true }),
                new sap.m.Input("buildingDescInput", { value: "{/buildingDescription}", editable: false }),

                new sap.m.Label({ text: "Usage Type", required: true }),
                new sap.m.Select("usageTypeDescInput", {
                    selectedKey: "{/usageTypeDescription}",
                    change: this.onAddDialogUsageTypeChange.bind(this),
                    items: [
                        new sap.ui.core.Item({ key: "", text: "" }),
                        new sap.ui.core.Item({ key: "Residential", text: "Residential" }),
                        new sap.ui.core.Item({ key: "Commercial", text: "Commercial" }),
                        new sap.ui.core.Item({ key: "Admin", text: "Admin" })
                    ]
                }),

                new sap.m.Label({ text: "Unit Type", required: true }),
                new sap.m.Select("unitTypeDescInput", { selectedKey: "{/unitTypeDescription}", enabled: false }),

                new sap.m.Label({ text: "Unit Status", required: true }),
                new sap.m.Select("unitStatusDescInput", {
                    selectedKey: "{/unitStatusDescription}",
                    items: [
                        new sap.ui.core.Item({ key: "", text: "" }),
                        new sap.ui.core.Item({ key: "Open", text: "Open" }),
                        new sap.ui.core.Item({ key: "Closed", text: "Closed" }),
                        new sap.ui.core.Item({ key: "Cancelled", text: "Cancelled" }),
                        new sap.ui.core.Item({ key: "Terminated", text: "Terminated" })
                    ]
                }),

                new sap.m.Label({ text: "Floor Description", required: true }),
                new sap.m.Input("floorDescInput", { value: "{/floorDescription}" }),

                new sap.m.Label({ text: "Zone", required: true }),
                new sap.m.Input("zoneInput", { value: "{/zone}" }),

                new sap.m.Label({ text: "Sales Phase", required: true }),
                new sap.m.Select("salesPhaseInput", {
                    selectedKey: "{/salesPhase}",
                    items: [
                        new sap.ui.core.Item({ key: "", text: "" }),
                        new sap.ui.core.Item({ key: "1", text: "1" }),
                        new sap.ui.core.Item({ key: "2", text: "2" }),
                        new sap.ui.core.Item({ key: "3", text: "3" }),
                        new sap.ui.core.Item({ key: "4", text: "4" })
                    ]
                }),

                new sap.m.Label({ text: "Finishing Spex Description", required: true }),
                new sap.m.Input("finishingSpexDescInput", { value: "{/finishingSpexDescription}" }),

                new sap.m.Label({ text: "Profit Center" }),
                new sap.m.Text({ text: "{/profitCenter}" }),

                new sap.m.Label({ text: "Functional Area" }),
                new sap.m.Text({ text: "{/functionalArea}" }),

                new sap.m.Label({ text: "Delivery Date", required: true }),
                new sap.m.DatePicker("unitDeliveryDateInput", {
                    value: "{/unitDeliveryDate}",
                    displayFormat: "long",
                    valueFormat: "yyyy-MM-dd",
                    placeholder: "Select a date"
                }),

                new sap.m.Label({ text: "Supplementary Text" }),
                new sap.m.Input("supplementaryTextInput", { value: "{/supplementaryText}" }),

                new sap.m.Title({ text: "Measurements", level: "H3" }),
                new sap.m.Button({ text: "Add Measurement", press: this.onAddMeasurementRow.bind(this) }),
                new sap.m.Button({ text: "Delete Measurement", press: this.onDeleteMeasurementRow.bind(this) }),
                new sap.m.Table({
                    id: "addMeasurementsTable",
                    items: "{/measurements}",
                    columns: [
                        new sap.m.Column({ header: new sap.m.Label({ text: "Code" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Quantity" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "UOM" }) })
                    ],
                    items: {
                        path: "/measurements",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new ComboBox({
                                    selectedKey: "{code}",
                                    change: this.onMeasurementCodeChange.bind(this),
                                    items: { path: "measurementsList>/", template: new Item({ key: "{measurementsList>code}", text: "{measurementsList>code} - {measurementsList>description}" }) }
                                }),
                                new Text({ text: "{description}" }),
                                new Input({ value: "{quantity}", type: "Number" }),
                                new Input({ value: "{uom}" })
                            ]
                        })
                    }
                }),

                new sap.m.Title({ text: "Conditions", level: "H3" }),
                new sap.m.Button({ text: "Add Condition", press: this.onAddConditionRow.bind(this) }),
                new sap.m.Button({ text: "Delete Condition", press: this.onDeleteConditionRow.bind(this) }),
                new sap.m.Table({
                    id: "addConditionsTable",
                    items: "{/conditions}",
                    columns: [
                        new sap.m.Column({ header: new sap.m.Label({ text: "Code" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Amount" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Currency" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Number of Years" }) })
                    ],
                    items: {
                        path: "/conditions",
                        template: new sap.m.ColumnListItem({
                            cells: [
                                new ComboBox({
                                    selectedKey: "{code}",
                                    change: this.onConditionCodeChange.bind(this),
                                    items: { path: "conditionsList>/", template: new Item({ key: "{conditionsList>code}", text: "{conditionsList>code} - {conditionsList>description}" }) }
                                }),
                                new Text({ text: "{description}" }),
                                new Input({ value: "{amount}", type: "Number" }),
                                new Input({ value: "{currency}" }),
                                new Input({ value: "{numberOfYears}", type: "Number" })
                            ]
                        })
                    }
                })
            ]
        }),

        beginButton: new sap.m.Button({
            text: "Save",
            type: "Emphasized",
            press: function () {
                var oData = this._oAddDialog.getModel().getData();

                var aRequiredFields = [
                    { id: "usageTypeDescInput", name: "Usage Type" },
                    { id: "unitTypeDescInput", name: "Unit Type" }
                ];

                var bValid = true;
                aRequiredFields.forEach(function (field) {
                    var oControl = sap.ui.getCore().byId(field.id);
                    if (oControl) {
                        if (oControl.isA("sap.m.Select") || oControl.isA("sap.m.ComboBox")) {
                            var vValue = oControl.getSelectedKey();
                        } else if (oControl.getValue) {
                            vValue = oControl.getValue();
                        }

                        if (!vValue) {
                            oControl.setValueState("Error");
                            oControl.setValueStateText(field.name + " is required");
                            bValid = false;
                        } else {
                            oControl.setValueState("None");
                        }
                    }
                });

                if (!bValid) {
                    sap.m.MessageBox.error("Please fill all required fields before saving.");
                    return;
                }

                this._unitIdCounter = (this._unitIdCounter || 0) + 1;
                const generatedUnitId = "U" + ("000" + this._unitIdCounter).slice(-4);
                localStorage.setItem("unitIdCounter", this._unitIdCounter);

                const payload = {
                    unitId: generatedUnitId,
                    unitDescription: oData.unitDescription,
                    companyCodeId: oData.companyCodeId,
                    companyCodeDescription: oData.companyCodeDescription,
                    projectId: oData.projectId,
                    projectDescription: oData.projectDescription,
                    buildingId: oData.buildingId,
                    buildingDescription: oData.buildingDescription,
                    unitTypeDescription: oData.unitTypeDescription,
                    usageTypeDescription: oData.usageTypeDescription,
                    unitStatusDescription: oData.unitStatusDescription,
                    floorDescription: oData.floorDescription,
                    zone: oData.zone,
                    salesPhase: oData.salesPhase,
                    finishingSpexDescription: oData.finishingSpexDescription,
                    unitDeliveryDate: oData.unitDeliveryDate || null,
                    supplementaryText: oData.supplementaryText,
                    profitCenter: oData.profitCenter || 0,
                    functionalArea: oData.functionalArea || 0,
                    measurements: oData.measurements,
                    conditions: oData.conditions
                };

                if (payload.measurements.length === 0) {
                    delete payload.measurements;
                }
                if (payload.conditions.length === 0) {
                    delete payload.conditions;
                }

                fetch("/odata/v4/real-estate/Units", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Failed to create unit");
                        }
                        return response.json();
                    })
                    .then(() => {
                        sap.m.MessageToast.show("Unit created!");
                        this._loadBuildings();
                        this._resetAddDialogFields();
                        this._oAddDialog.close();
                    })
                    .catch(err => {
                        sap.m.MessageBox.error("Error: " + err.message);
                    });
            }.bind(this)
        }),

        endButton: new sap.m.Button({
            text: "Cancel",
            press: function () {
                this._resetAddDialogFields();
                this._oAddDialog.close();
            }.bind(this)
        })
    });

    this._oAddDialog.setModel(oModel);
    this.getView().addDependent(this._oAddDialog);

    // Added: Populate filtered buildings based on the pre-filled project
    this._updateFilteredBuildings(oData.projectId, oModel);

    this._oAddDialog.open();
},
// Added: Reset dialog fields (from Units) - Updated to include filteredBuildings
_resetAddDialogFields: function () {
    var oModel = this._oAddDialog.getModel();
    oModel.setData({
        unitDescription: "",
        companyCodeId: "",
        companyCodeDescription: "",
        projectId: "",
        projectDescription: "",
        buildingId: "",
        buildingDescription: "",
        unitTypeDescription: "",
        usageTypeDescription: "",
        unitStatusDescription: "",
        floorDescription: "",
        zone: "",
        salesPhase: "",
        finishingSpexDescription: "",
        profitCenter: "",
        functionalArea: "",
        unitDeliveryDate: "",
        supplementaryText: "",
        measurements: [],
        conditions: [],
        filteredBuildings: []  // Added: Clear filtered buildings
    });

    [
        "unitDescInput", "companyCodeIdInput", "companyCodeDescInput",
        "projectIdInput", "projectDescInput", "buildingIdInput", "buildingDescInput",
        "unitTypeDescInput", "usageTypeDescInput", "unitStatusDescInput", "floorDescInput",
        "zoneInput", "salesPhaseInput", "finishingSpexDescInput",
        "unitDeliveryDateInput", "supplementaryTextInput"
    ].forEach(function (id) {
        var oControl = sap.ui.getCore().byId(id);
        if (oControl) oControl.setValueState("None");
    });
},

        onAddBuilding: function () {
            if (this._oAddBuildingDialog) {
                this._oAddBuildingDialog.destroy();
                this._oAddBuildingDialog = null;
            }

            var oNewBuildingModel = new sap.ui.model.json.JSONModel({
                buildingId: "",
                buildingDescription: "",
                buildingOldCode: "",
                projectId: "",
                projectDescription: "",
                companyCodeId: "",
                companyCodeDescription: "",
                validFrom: "",
                validTo: "",
                location: "",
                businessArea: "",
                profitCenter: "",
                functionalArea: ""
            });

            var that = this;

            this._oAddBuildingDialog = new sap.m.Dialog({
                title: "Add New Building",
                contentWidth: "80%",
                content: new sap.ui.layout.form.SimpleForm({
                    editable: true,
                    layout: "ResponsiveGridLayout",
                    content: [
                        new sap.m.Label({ text: "Building ID" }),
                        new sap.m.Input({ value: "{/buildingId}", required: true }),

                        new sap.m.Label({ text: "Building Description" }),
                        new sap.m.Input({ value: "{/buildingDescription}", required: true }),

                        new sap.m.Label({ text: "Building Old Code" }),
                        new sap.m.Input({ value: "{/buildingOldCode}" }),

                        new sap.m.Label({ text: "Project ID" }),
                        new sap.m.Input({ value: "{/projectId}", required: true }),

                        new sap.m.Label({ text: "Project Description" }),
                        new sap.m.Input({ value: "{/projectDescription}", required: true }),

                        new sap.m.Label({ text: "Company Code" }),
                        new sap.m.Input({ value: "{/companyCodeId}", required: true }),

                        new sap.m.Label({ text: "Company Code Description" }),
                        new sap.m.Input({ value: "{/companyCodeDescription}", required: true }),

                        new sap.m.Label({ text: "Valid From" }),
                        new sap.m.DatePicker({ value: "{/validFrom}", required: true }),

                        new sap.m.Label({ text: "Valid To" }),
                        new sap.m.DatePicker({ value: "{/validTo}" }),

                        new sap.m.Label({ text: "Location" }),
                        new sap.m.Input({ value: "{/location}", required: true }),

                        new sap.m.Label({ text: "Business Area" }),
                        new sap.m.Input({ value: "{/businessArea}", required: true }),

                        new sap.m.Label({ text: "Profit Center" }),
                        new sap.m.Input({ value: "{/profitCenter}", required: true }),

                        new sap.m.Label({ text: "Functional Area" }),
                        new sap.m.Input({ value: "{/functionalArea}", required: true })
                    ]
                }),
                beginButton: new sap.m.Button({
                    text: "Save",
                    type: "Emphasized",
                    press: function () {
                        var oData = that._oAddBuildingDialog.getModel().getData();

                        if (oData.validFrom) {
                            oData.validFrom = new Date(oData.validFrom).toISOString().split("T")[0];
                        }
                        if (oData.validTo) {
                            oData.validTo = new Date(oData.validTo).toISOString().split("T")[0];
                        }

                        fetch("/odata/v4/real-estate/Buildings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(oData)
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error("Failed to create Building");
                                }
                                return response.json();
                            })
                            .then((newBuilding) => {
                                sap.m.MessageToast.show("Building created!");

                                var oTable = that.getView().byId("buildingsTable");
                                var oModel = oTable.getModel();
                                var aBuildings = oModel.getProperty("/Buildings") || [];
                                aBuildings.push(newBuilding);
                                oModel.setProperty("/Buildings", aBuildings);

                                that._oAddBuildingDialog.close();
                            })
                            .catch(err => {
                                sap.m.MessageBox.error("Error: " + err.message);
                                console.log(err);
                            });
                    }
                }),
                endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function () {
                        that._oAddBuildingDialog.close();
                    }
                })
            });

            this._oAddBuildingDialog.setModel(oNewBuildingModel);
            this.getView().addDependent(this._oAddBuildingDialog);
            this._oAddBuildingDialog.open();
        },

        onEdit: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getParent().getParent().getBindingContext();

            if (!oContext) {
                sap.m.MessageBox.warning("Error: Unable to retrieve row data");
                return;
            }

            var oSelectedData = oContext.getObject();
            var oTable = this.getView().byId("buildingsTable");
            var oModel = oTable.getModel();

            if (!this._oEditDialog) {
                this._oEditBuildingModel = new sap.ui.model.json.JSONModel({
                    buildingId: "",
                    buildingDescription: "",
                    buildingOldCode: "",
                    projectId: "",
                    projectDescription: "",
                    companyCodeId: "",
                    companyCodeDescription: "",
                    validFrom: "",
                    validTo: "",
                    location: "",
                    businessArea: "",
                    profitCenter: "",
                    functionalArea: "",
                });

                this._oEditDialog = new sap.m.Dialog({
                    title: "Edit Building",
                    titleAlignment: "Center",
                    contentWidth: "600px",
                    content: [
                        new sap.ui.layout.form.SimpleForm({
                            editable: true,
                            layout: "ResponsiveGridLayout",
                            content: [
                                new sap.m.Label({ text: "Building ID" }),
                                new sap.m.Input({ value: "{/buildingId}", editable: false }),

                                new sap.m.Label({ text: "Building Description" }),
                                new sap.m.Input({ value: "{/buildingDescription}" }),

                                new sap.m.Label({ text: "Building Old Code" }),
                                new sap.m.Input({ value: "{/buildingOldCode}" }),

                                new sap.m.Label({ text: "Project ID" }),
                                new sap.m.Input({ value: "{/projectId}" }),

                                new sap.m.Label({ text: "Project Description" }),
                                new sap.m.Input({ value: "{/projectDescription}" }),

                                new sap.m.Label({ text: "Company Code" }),
                                new sap.m.Input({ value: "{/companyCodeId}" }),

                                new sap.m.Label({ text: "Company Code Description" }),
                                new sap.m.Input({ value: "{/companyCodeDescription}" }),

                                new sap.m.Label({ text: "Valid From" }),
                                new sap.m.DatePicker({ value: "{/validFrom}" }),

                                new sap.m.Label({ text: "Valid To" }),
                                new sap.m.DatePicker({ value: "{/validTo}" }),

                                new sap.m.Label({ text: "Location" }),
                                new sap.m.Input({ value: "{/location}" }),

                                new sap.m.Label({ text: "Business Area" }),
                                new sap.m.Input({ value: "{/businessArea}" }),

                                new sap.m.Label({ text: "Profit Center" }),
                                new sap.m.Input({ value: "{/profitCenter}" }),

                                new sap.m.Label({ text: "Functional Area" }),
                                new sap.m.Input({ value: "{/functionalArea}" }),
                            ]
                        })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Save",
                        type: "Emphasized",
                        press: () => {
                            var oUpdated = this._oEditBuildingModel.getData();

                            if (oUpdated.validFrom)
                                oUpdated.validFrom = new Date(oUpdated.validFrom).toISOString().split("T")[0];
                            if (oUpdated.validTo)
                                oUpdated.validTo = new Date(oUpdated.validTo).toISOString().split("T")[0];

                            fetch(`/odata/v4/real-estate/Buildings(${oUpdated.buildingId})`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(oUpdated)
                            })
                                .then(response => {
                                    if (!response.ok) throw new Error("Failed to update Building");
                                    return response.json();
                                })
                                .then(updatedBuilding => {
                                    var aBuildings = oModel.getProperty("/Buildings") || [];
                                    var iIndex = aBuildings.findIndex(b => b.buildingId === updatedBuilding.buildingId);
                                    if (iIndex > -1) {
                                        aBuildings[iIndex] = updatedBuilding;
                                        oModel.setProperty("/Buildings", aBuildings);
                                    }

                                    sap.m.MessageToast.show("Building updated successfully!");
                                    this._oEditDialog.close();
                                })
                                .catch(err => {
                                    sap.m.MessageBox.error("Error: " + err.message);
                                });
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: () => this._oEditDialog.close()
                    })
                });

                this._oEditDialog.setModel(this._oEditBuildingModel);
                this.getView().addDependent(this._oEditDialog);
            }

            this._oEditBuildingModel.setData(Object.assign({}, oSelectedData));
            this._oEditDialog.open();
        },

        onDelete: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const sBuildingId = oContext.getProperty("buildingId");
            MessageBox.confirm(`Delete Building ${sBuildingId}?`, {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        fetch(`/odata/v4/real-estate/Buildings('${encodeURIComponent(sBuildingId)}')`, { method: "DELETE" })
                            .then(r => {
                                if (r.ok) {
                                    MessageToast.show("Deleted successfully!");
                                    this._loadBuildings();
                                } else throw new Error("Delete failed");
                            })
                            .catch(err => MessageBox.error(err.message));
                    }
                }
            });
        },


        onDetails: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            if (!oBindingContext) {
                return;
            }

            var oData = oBindingContext.getObject();
            var oDialogModel = new sap.ui.model.json.JSONModel({
                BuildingId: oData.buildingId,
                BuildingDescription: oData.buildingDescription,
                BuildingOldCode: oData.buildingOldCode,
                ProjectId: oData.projectId,
                ProjectDescription: oData.projectDescription,
                CompanyCodeId: oData.companyCodeId,
                CompanyCodeDescription: oData.companyCodeDescription,
                validFrom: oData.validFrom,
                validTo: oData.validTo,
                location: oData.location,
                businessArea: oData.businessArea,
                profitCenter: oData.profitCenter,
                functionalArea: oData.functionalArea,
                supplementaryText: oData.supplementaryText
            });

            if (!this._oDetailsDialog) {
                this._oDetailsDialog = new sap.m.Dialog({
                    title: "Building Details",
                    contentWidth: "100%",
                    resizable: true,
                    draggable: true,
                    content: [
                        new sap.m.IconTabBar({
                            expandable: true,
                            items: [
                                // 🔹 Tab 1: Building General Data
                                new sap.m.IconTabFilter({
                                    text: "General Data",
                                    icon: "sap-icon://building",
                                    content: [
                                        new sap.ui.layout.form.SimpleForm({
                                            editable: false,
                                            layout: "ResponsiveGridLayout",
                                            labelSpanL: 3,
                                            columnsL: 2,
                                            content: [
                                                new sap.m.Label({ text: "Building ID (8 digits)" }),
                                                new sap.m.Text({ text: "{/BuildingId}" }),

                                                new sap.m.Label({ text: "Building Description" }),
                                                new sap.m.Text({ text: "{/BuildingDescription}" }),

                                                new sap.m.Label({ text: "Building Old Code" }),
                                                new sap.m.Text({ text: "{/BuildingOldCode}" }),

                                                new sap.m.Label({ text: "Project ID" }),
                                                new sap.m.Text({ text: "{/ProjectId}" }),

                                                new sap.m.Label({ text: "Project Description" }),
                                                new sap.m.Text({ text: "{/ProjectDescription}" }),

                                                new sap.m.Label({ text: "Company Code" }),
                                                new sap.m.Text({ text: "{/CompanyCodeId}" }),

                                                new sap.m.Label({ text: "Company Code Description" }),
                                                new sap.m.Text({ text: "{/CompanyCodeDescription}" }),

                                                new sap.m.Label({ text: "Valid From" }),
                                                new sap.m.Text({ text: "{/validFrom}" }),

                                                new sap.m.Label({ text: "Valid To" }),
                                                new sap.m.Text({ text: "{/validTo}" }),

                                                new sap.m.Label({ text: "Location" }),
                                                new sap.m.Text({ text: "{/location}" })
                                            ]
                                        })
                                    ]
                                }),

                                // 🔹 Tab 2: Posting Parameters
                                new sap.m.IconTabFilter({
                                    text: "Posting Parameters",
                                    icon: "sap-icon://post",
                                    content: [
                                        new sap.ui.layout.form.SimpleForm({
                                            editable: false,
                                            layout: "ResponsiveGridLayout",
                                            labelSpanL: 3,
                                            columnsL: 2,
                                            content: [
                                                new sap.m.Label({ text: "Business Area" }),
                                                new sap.m.Text({ text: "{/businessArea}" }),

                                                new sap.m.Label({ text: "Profit Center" }),
                                                new sap.m.Text({ text: "{/profitCenter}" }),

                                                new sap.m.Label({ text: "Functional Area" }),
                                                new sap.m.Text({ text: "{/functionalArea}" })
                                            ]
                                        })
                                    ]
                                }),

                                // 🔹 Tab 3: Supplementary Text
                                new sap.m.IconTabFilter({
                                    text: "Supplementary Text",
                                    icon: "sap-icon://document-text",
                                    content: [
                                        new sap.ui.layout.form.SimpleForm({
                                            editable: false,
                                            layout: "ResponsiveGridLayout",
                                            content: [
                                                new sap.m.Label({ text: "Supplementary Text" }),
                                                new sap.m.TextArea({
                                                    value: "{/supplementaryText}",
                                                    width: "100%",
                                                    rows: 6,
                                                    editable: false,
                                                    growing: true,
                                                    growingMaxLines: 10
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ],
                    endButton: new sap.m.Button({
                        text: "Close",
                        type: "Emphasized",
                        press: function () {
                            this._oDetailsDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oDetailsDialog);
            }

            this._oDetailsDialog.setModel(oDialogModel);
            this._oDetailsDialog.open();
        }



    });
});