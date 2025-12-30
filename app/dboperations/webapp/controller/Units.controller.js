
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
    "sap/m/ComboBox",
    "sap/ui/core/Item",
    "sap/m/MessageToast",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem"
], function (
    Controller, MessageBox, Dialog, Input, Button, Label, Text, TextArea, VBox,
    DatePicker, Table, Column, ColumnListItem, JSONModel, Title, IconTabBar, IconTabFilter, SimpleForm,
    ComboBox, Item, MessageToast, SelectDialog, StandardListItem
) {
    "use strict";

    return Controller.extend("dboperations.controller.Units", {
        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("Units")
                .attachPatternMatched(this._onRouteMatched, this);

            var oModel = new sap.ui.model.json.JSONModel({
                Units: [],
            });
            oModel.setProperty("/selectedUnitStatus", "");
            oModel.setProperty("/selectedUnitId", "");
            this.getView().setModel(oModel, "view");

            // Fetch units data
            this._loadUnits();

            // Fetch config lists for dropdowns
            this._loadMeasurementsList();
            this._loadConditionsList();

            // New: Fetch lists for search helps
            this._loadCompanyCodesList();
            this._loadProjectsList();
            this._loadBuildingsList();
            this._loadPaymentPlansForFilter();

            // For Payment Plan Simulations (PPS) - initialize counter
            this._idCounter = parseInt(localStorage.getItem("simulationIdCounter")) || 0;
            this._unitIdCounter = parseInt(localStorage.getItem("unitIdCounter")) || 0;

        },

        _onRouteMatched: function () {
            this._loadUnits();
        },

        _loadUnits: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            fetch("/odata/v4/real-estate/Units?$expand=measurements,conditions,simulations")
                .then(response => response.json())
                .then(data => {
                    // 🔹 Post-process units to extract BUA & Original Price
                    const enrichedUnits = data.value.map(unit => {
                        // Extract BUA (from measurements where code = 'BUA')

                        let buaMeasurement = unit.measurements?.find(m =>
                            m.code && m.code.trim().toUpperCase() === "BUA"
                        );

                        let bua = buaMeasurement ? Number(buaMeasurement.quantity) : null;
                        let uom = buaMeasurement ? buaMeasurement.uom : null;
                        let measurementCode = buaMeasurement ? buaMeasurement.code : null;


                        /* 
                        
                            let bua = buaMeasurement ? buaMeasurement.quantity : null;
                            let uom = buaMeasurement ? buaMeasurement.uom : null;
                            let measurementCode = buaMeasurement ? buaMeasurement.code : null;
                        
                            let firstCondition = unit.conditions?.[0];
                            let originalPrice = firstCondition ? firstCondition.amount : null;*/
                        // Extract Original Price (from first condition or based on some rule)
                        let firstCondition = unit.conditions?.[0];
                        let originalPrice = firstCondition ? firstCondition.amount : null;
                      

                        return { ...unit, bua, originalPrice, uom, measurementCode };
                    });

                    oModel.setData({ Units: enrichedUnits });

                    const uniqueStatuses = [];
                    const unitId = [];
                    const unitType = []
                    enrichedUnits.forEach(u => {
                        if (u.unitStatusDescription && !uniqueStatuses.includes(u.unitStatusDescription)) {
                            uniqueStatuses.push(u.unitStatusDescription);
                        }
                        if (u.unitId && !unitId.includes(u.unitId)) {
                            unitId.push(u.unitId)
                        }
                        if (u.unitTypeDescription && !unitType.includes(u.unitTypeDescription)) {
                            unitType.push(u.unitTypeDescription)
                        }
                    });
                  



                    oModel.setProperty("/UnitStatuses", uniqueStatuses.map(s => ({ status: s })));
                    oModel.setProperty("/UnitId", unitId.map(s => ({ id: s })));
                    oModel.setProperty("/UnitType", unitType.map(s => ({ type: s })));




                    this.getView().setModel(oModel, "view");


                    this.getView().byId("unitsTable").setModel(oModel);[]
                })
                .catch(err => {
                    console.error("Error fetching units", err);
                });
        },

        _loadPaymentPlansForFilter: function () {
            fetch("/odata/v4/real-estate/PaymentPlans?$expand=assignedProjects($expand=project)")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "paymentPlansFilter");
                })
                .catch(err => console.error("Failed to load Payment Plans for filter:", err));
        },
        // Fetch measurements config for dropdown
        _loadMeasurementsList: function () {
            fetch("/odata/v4/real-estate/Measurements")
                .then(res => res.json())
                .then(data => {
                    const uniqueMeasurements = data.value.reduce((acc, curr) => {
                        if (!acc.find(c => c.code === curr.code)) {  // Fixed: compare code to code
                            acc.push({
                                code: curr.code,
                                description: curr.description
                            });
                        }
                        return acc;
                    }, []);
                    this.getView().setModel(new JSONModel(uniqueMeasurements), "measurementsList");
                })
                .catch(err => console.error("Failed to load Measurements list:", err));
        },

        // Fetch conditions config for dropdown
        _loadConditionsList: function () {
            fetch("/odata/v4/real-estate/Conditions")
                .then(res => res.json())
                .then(data => {
                    // Deduplicate by 'code' (assuming code is unique; adjust if needed)
                    const uniqueConditions = data.value.reduce((acc, curr) => {
                        if (!acc.find(c => c.code === curr.code)) {  // Check for unique code
                            acc.push({
                                code: curr.code,
                                description: curr.description
                            });
                        }
                        return acc;
                    }, []);

                    this.getView().setModel(new JSONModel(uniqueConditions), "conditionsList");
                })
                .catch(err => console.error("Failed to load Conditions list:", err));
        },

        // New: Fetch unique company codes from Projects
        _loadCompanyCodesList: function () {
            fetch("/odata/v4/real-estate/Projects")
                .then(res => res.json())
                .then(data => {
                    const uniqueCompanyCodes = data.value.reduce((acc, curr) => {
                        if (!acc.find(c => c.companyCodeId === curr.companyCodeId)) {
                            acc.push({
                                companyCodeId: curr.companyCodeId,
                                companyCodeDescription: curr.companyCodeDescription
                            });
                        }
                        return acc;
                    }, []);
                    this.getView().setModel(new JSONModel(uniqueCompanyCodes), "companyCodesList");

                })
                .catch(err => console.error("Failed to load Company Codes list:", err));
        },

        // New: Fetch projects list
        _loadProjectsList: function () {
            fetch("/odata/v4/real-estate/Projects")

                .then(res => res.json())
                .then(data => {
                    const projectIds = data.value.reduce((acc, curr) => {
                        if (!acc.find(c => c.projectId === curr.projectId)) {
                            acc.push({
                                projectId: curr.projectId,
                                projectDescription: curr.projectDescription,
                                profitCenter: curr.profitCenter,
                                functionalArea: curr.functionalArea
                            });
                        }
                        return acc;
                    }, []);
                    this.getView().setModel(new JSONModel(projectIds), "projectsList");
                })

                .catch(err => console.error("Failed to load Projects list:", err));
        },

        // New: Fetch buildings list
        _loadBuildingsList: function () {
            fetch("/odata/v4/real-estate/Buildings")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "buildingsList");
                })
                .catch(err => console.error("Failed to load Buildings list:", err));
        },

        _updateFilteredBuildings: function (sProjectId, oModel) {
            const allBuildings = this.getView().getModel("buildingsList").getData();
            const filtered = allBuildings.filter(b => b.projectId === sProjectId);
            oModel.setProperty("/filteredBuildings", filtered);
        },
        onNavigateToAddUnit: function () {
            // If dialog is not yet created, create it once
            if (!this._oAddDialog) {
                var oNewUnitModel = new sap.ui.model.json.JSONModel({
                    // unitId: "",
                    unitDescription: "",
                    companyCodeId: "",
                    companyCodeDescription: "",
                    projectId: "",
                    projectDescription: "",
                    buildingId: "",
                    buildingDescription: "",  // Added: for building description
                    unitTypeDescription: "",
                    usageTypeDescription: "",
                    unitStatusDescription: "",
                    floorDescription: "",
                    zone: "",
                    salesPhase: "",
                    finishingSpexDescription: "",
                    profitCenter: "",  // Will be auto-populated from building
                    functionalArea: "",  // Will be auto-populated from building
                    unitDeliveryDate: "",
                    supplementaryText: "",
                    measurements: [],
                    conditions: [],
                    filteredBuildings: []  // New: for filtered buildings
                });

                this._oAddDialog = new sap.m.Dialog({
                    title: "Add New Unit",
                    content: new sap.m.VBox({
                        items: [
                            new sap.m.Label({ text: "Unit Description", required: true }),
                            new sap.m.Input("unitDescInput", {
                                value: "{/unitDescription}",
                                tooltip: "Up to 60 characters"
                            }),

                            new sap.m.Label({ text: "Company Code ID", required: true }),
                            new ComboBox("companyCodeIdInput", {
                                selectedKey: "{/companyCodeId}",
                                change: this.onCompanyCodeChange.bind(this),
                                items: {
                                    path: "companyCodesList>/",
                                    template: new Item({
                                        key: "{companyCodesList>companyCodeId}",
                                        text: "{companyCodesList>companyCodeId} - {companyCodesList>companyCodeDescription}"

                                    })
                                },
                                tooltip: "Must be 4 characters"
                            }),

                            new sap.m.Label({ text: "Company Code Description", required: true }),
                            new sap.m.Input("companyCodeDescInput", {
                                value: "{/companyCodeDescription}",  // FIXED: Changed from "{companyCodesList>companyCodeDescription}" to bind to dialog model
                                tooltip: "Up to 60 characters"
                            }),
                            new sap.m.Label({ text: "Project ID", required: true }),
                            new ComboBox("projectIdInput", {
                                selectedKey: "{/projectId}",
                                change: this.onProjectChange.bind(this),  // Auto-populates profitCenter/functionalArea
                                items: {
                                    path: "projectsList>/",
                                    template: new Item({
                                        key: "{projectsList>projectId}",
                                        text: "{projectsList>projectId} - {projectsList>projectDescription}"
                                    })
                                },
                                tooltip: "Must be 8 characters"
                            }),

                            new sap.m.Label({ text: "Project Description", required: true }),
                            new sap.m.Input("projectDescInput", {
                                value: "{/projectDescription}",
                                tooltip: "Up to 60 characters"
                            }),

                            new sap.m.Label({ text: "Building ID", required: true }),
                            new ComboBox("buildingIdInput", {
                                selectedKey: "{/buildingId}",
                                change: this.onBuildingChange.bind(this),  // Added: to set building description
                                items: {
                                    path: "/filteredBuildings",
                                    template: new Item({
                                        key: "{buildingId}",
                                        text: "{buildingId} - {buildingDescription}"
                                    })
                                }
                            }),

                            new sap.m.Label({ text: "Building Description", required: true }),
                            new sap.m.Input("buildingDescInput", {
                                value: "{/buildingDescription}",
                                tooltip: "Up to 60 characters"
                            }),
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
                            new sap.m.Select("unitTypeDescInput", {
                                selectedKey: "{/unitTypeDescription}",
                                enabled: false
                            }),
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
                            new sap.m.Select("finishingSpexDescInput", {
                                selectedKey: "{/finishingSpexDescription}",
                                items: [
                                    new sap.ui.core.Item({ key: "", text: "" }),
                                    new sap.ui.core.Item({ key: "Core and Shell", text: "Core and Shell" }),
                                    new sap.ui.core.Item({ key: "Semi Finished", text: "Semi Finished" }),
                                    new sap.ui.core.Item({ key: "Fully Finished", text: "Fully Finished" }),
                                ]
                            }),

                            new sap.m.Label({ text: "Profit Center" }),
                            new sap.m.Text({ text: "{/profitCenter}" }),  // Read-only display
                            new sap.m.Label({ text: "Functional Area" }),
                            new sap.m.Text({ text: "{/functionalArea}" }),  // Read-only display

                            new sap.m.Label({ text: "Delivery Date", required: true }),
                            new sap.m.DatePicker("unitDeliveryDateInput", {
                                value: "{/unitDeliveryDate}",
                                displayFormat: "long",
                                valueFormat: "yyyy-MM-dd",
                                placeholder: "Select a date"
                            }),

                            new sap.m.Label({ text: "Supplementary Text" }),
                            new sap.m.Input("supplementaryTextInput", { value: "{/supplementaryText}" }),

                            // Adjusted Measurements section with better button layout
                            new sap.m.Title({ text: "Measurements", level: "H3" }),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Button({
                                        text: "add row",
                                        icon: "sap-icon://add",
                                        type: "Accept",
                                        press: this.onAddMeasurementRow.bind(this)
                                    }),
                                    new sap.m.Button({
                                        text: "delete row",
                                        icon: "sap-icon://delete",
                                        type: "Reject",
                                        press: this.onDeleteMeasurementRow.bind(this)
                                    })
                                ],
                                justifyContent: "Start",
                                alignItems: "Center"
                            }),
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
                                                items: {
                                                    path: "measurementsList>/",
                                                    template: new Item({
                                                        key: "{measurementsList>code}",
                                                        text: "{measurementsList>code} - {measurementsList>description}"
                                                    })
                                                }
                                            }),
                                            new Text({ text: "{description}" }),
                                            new Input({ value: "{quantity}", type: "Number" }),
                                            new Input({ value: "{uom}" })
                                        ]
                                    })
                                }
                            }),

                            // Adjusted Conditions section with better button layout
                            new sap.m.Title({ text: "Conditions", level: "H3" }),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Button({
                                        text: "add row",
                                        icon: "sap-icon://add",
                                        type: "Accept",
                                        press: this.onAddConditionRow.bind(this)
                                    }),
                                    new sap.m.Button({
                                        text: "delete row",
                                        icon: "sap-icon://delete",
                                        type: "Reject",
                                        press: this.onDeleteConditionRow.bind(this)
                                    })
                                ],
                                justifyContent: "Start",
                                alignItems: "Center"
                            }),
                            new sap.m.Table({
                                id: "addConditionsTable",
                                items: "{/conditions}",
                                columns: [
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Code" }) }),
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) }),
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Amount" }) }),
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Currency" }) }),
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Number of Years" }) })  // NEW: Add column
                                ],
                                items: {
                                    path: "/conditions",
                                    template: new sap.m.ColumnListItem({
                                        cells: [
                                            new ComboBox({
                                                selectedKey: "{code}",
                                                change: this.onConditionCodeChange.bind(this),
                                                items: {
                                                    path: "conditionsList>/",
                                                    template: new Item({
                                                        key: "{conditionsList>code}",
                                                        text: "{conditionsList>code} - {conditionsList>description}"
                                                    })
                                                }
                                            }),
                                            new Text({ text: "{description}" }),
                                            new Input({ value: "{amount}", type: "Number" }),
                                            new Input({ value: "{currency}" }),
                                            new Input({ value: "{numberOfYears}", type: "Number" })  // NEW: Editable input for numberOfYears
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

                            // 🧩 Required field validation
                            var aRequiredFields = [
                                // { id: "unitIdInput", name: "Unit ID" },
                                { id: "unitDescInput", name: "Unit Description" },
                                { id: "companyCodeIdInput", name: "Company Code ID" },
                                { id: "companyCodeDescInput", name: "Company Code Description" },
                                { id: "projectIdInput", name: "Project ID" },
                                { id: "projectDescInput", name: "Project Description" },
                                { id: "buildingIdInput", name: "Building ID" },  // Added: Building ID is now required
                                { id: "buildingDescInput", name: "Building Description" },  // Added: Building Description is now required
                                { id: "unitTypeDescInput", name: "Unit Type Description" },
                                { id: "usageTypeDescInput", name: "Usage Type Description" },
                                { id: "unitStatusDescInput", name: "Unit Status Description" },
                                { id: "floorDescInput", name: "Floor Description" },
                                { id: "zoneInput", name: "Zone" },
                                { id: "salesPhaseInput", name: "Sales Phase" },
                                { id: "finishingSpexDescInput", name: "Finishing Spex Description" },
                                // { id: "profitCenterInput", name: "Profit Center" },  // REMOVED: Auto-populated
                                // { id: "functionalAreaInput", name: "Functional Area" },  // REMOVED: Auto-populated
                                { id: "unitDeliveryDateInput", name: "Delivery Date" },
                                { id: "supplementaryTextInput", name: "Supplementary Text" }
                            ];

                            var bValid = true;

                            var aRequiredFields = [
                                { id: "usageTypeDescInput", name: "Usage Type" },
                                { id: "unitTypeDescInput", name: "Unit Type" }
                            ];

                            aRequiredFields.forEach(function (field) {
                                var oControl = sap.ui.getCore().byId(field.id);
                                if (!oControl) return;

                                // ✅ Skip disabled fields
                                if (oControl.getEnabled && !oControl.getEnabled()) {
                                    return;
                                }

                                var vValue = "";

                                // For Select and ComboBox
                                if (oControl.isA("sap.m.Select") || oControl.isA("sap.m.ComboBox")) {
                                    vValue = oControl.getSelectedKey();
                                }
                                // For Input, DatePicker, etc.
                                else if (oControl.getValue) {
                                    vValue = oControl.getValue();
                                }

                                if (!vValue) {
                                    oControl.setValueState("Error");
                                    oControl.setValueStateText(field.name + " is required");
                                    bValid = false;
                                } else {
                                    oControl.setValueState("None");
                                }
                            });

                            if (!bValid) {
                                sap.m.MessageBox.error("Please fill all required fields before saving.");
                                return;
                            }

                            // NEW: Auto-generate unitId in format "U000x" (increment counter)
                            this._unitIdCounter = (this._unitIdCounter || 0) + 1;
                            const generatedUnitId = "U" + ("000" + this._unitIdCounter).slice(-4);  // e.g., U0001, U0002, etc.
                            localStorage.setItem("unitIdCounter", this._unitIdCounter);  // Persist counter
                            // Revert to original POST logic with auto-generated unitId
                            const payload = {
                                unitId: generatedUnitId,  // NEW: Use auto-generated ID
                                unitDescription: oData.unitDescription,
                                companyCodeId: oData.companyCodeId,
                                companyCodeDescription: oData.companyCodeDescription,
                                projectId: oData.projectId,
                                projectDescription: oData.projectDescription,
                                buildingId: oData.buildingId,  // Added: Include buildingId
                                buildingDescription: oData.buildingDescription,  // Added: Include buildingDescription
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

                            // Fix for the error: Remove empty compositions from payload
                            if (payload.measurements.length === 0) {
                                delete payload.measurements;
                            }
                            if (payload.conditions.length === 0) {
                                delete payload.conditions;
                            }

                            // ✅ Proceed with POST request
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
                                    this._loadUnits();

                                    // 🧹 Reset form after save
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
                            // 🧹 Clear data on cancel
                            this._resetAddDialogFields();
                            this._oAddDialog.close();
                        }.bind(this)
                    })
                });

                this._oAddDialog.setModel(oNewUnitModel);
                this.getView().addDependent(this._oAddDialog);
            }

            // 🧼 Reset data every time dialog opens
            this._resetAddDialogFields();

            this._oAddDialog.open();
        },
        onAddDialogUsageTypeChange: function () {
            var oUsageSelect = sap.ui.getCore().byId("usageTypeDescInput");
            var oUnitTypeSelect = sap.ui.getCore().byId("unitTypeDescInput");

            var sUsageType = oUsageSelect.getSelectedKey();
            var sUnitType = oUnitTypeSelect.getSelectedKey();


            // Update model
            var oModel = this._oAddDialog.getModel();
            oModel.setProperty("/usageTypeDescription", sUsageType);

            // Clear previous items
            oUnitTypeSelect.removeAllItems();

            var mUnitTypes = {
                "Residential": ["Apartment", "Villa", "Townhouse", "Studio"],
                "Commercial": ["Retail", "Shops"],
                "Admin": ["Office", "Clinic"]
            };

            var aTypes = mUnitTypes[sUsageType] || [];

            // Enable/Disable based on result
            oUnitTypeSelect.setEnabled(aTypes.length > 0);

            // Add items
            aTypes.forEach(function (type) {
                oUnitTypeSelect.addItem(new sap.ui.core.Item({
                    key: type,
                    text: type
                }));
            });

            // Reset previous selection
            // oUnitTypeSelect.setSelectedKey("");
            oModel.setProperty("/unitTypeDescription", sUnitType); // reset
        },
        onProjectChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var oSelectedItem = oComboBox.getSelectedItem();
            var sDescription = oSelectedItem ? oSelectedItem.getText().split(" - ")[1] || "" : "";
            var oModel = oComboBox.getModel();
            oModel.setProperty("/projectDescription", sDescription);

            // Find selected project to get profit and functional
            const projects = this.getView().getModel("projectsList").getData();
            const selectedProject = projects.find(p => p.projectId === sSelectedKey);
            if (selectedProject) {
                oModel.setProperty("/profitCenter", selectedProject.profitCenter);
                oModel.setProperty("/functionalArea", selectedProject.functionalArea);
            }

            // Update filtered buildings
            this._updateFilteredBuildings(sSelectedKey, oModel);

            // Clear building selection when project changes
            oModel.setProperty("/buildingId", "");
            oModel.setProperty("/buildingDescription", "");
        },
        onBuildingChange: function (oEvent) {  // Added: New handler for building selection
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var oSelectedItem = oComboBox.getSelectedItem();
            var sDescription = oSelectedItem ? oSelectedItem.getText().split(" - ")[1] || "" : "";
            var oModel = oComboBox.getModel();
            oModel.setProperty("/buildingDescription", sDescription);
        },

        _resetAddDialogFields: function () {
            var oModel = this._oAddDialog.getModel();
            oModel.setData({
                // unitId: "",
                unitDescription: "",
                companyCodeId: "",
                companyCodeDescription: "",
                projectId: "",
                projectDescription: "",
                // buildingId: "",
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

            // Reset value states for validation
            [
                // "unitIdInput", 
                "unitDescInput", "companyCodeIdInput", "companyCodeDescInput",
                "projectIdInput", "projectDescInput", "buildingIdInput", "unitTypeDescInput",
                "usageTypeDescInput", "unitStatusDescInput", "floorDescInput", "zoneInput",
                "salesPhaseInput", "finishingSpexDescInput",
                // "profitCenterInput", "functionalAreaInput",  // REMOVED
                "unitDeliveryDateInput", "supplementaryTextInput"
            ].forEach(function (id) {
                var oControl = sap.ui.getCore().byId(id);
                if (oControl) oControl.setValueState("None");
            });
        },

        onDetails: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            if (!oBindingContext) {
                return;
            }

            var oData = oBindingContext.getObject();
            var oDialogModel = new sap.ui.model.json.JSONModel({
                unitId: oData.unitId,
                unitDescription: oData.unitDescription,
                companyCodeId: oData.companyCodeId,
                companyCodeDescription: oData.companyCodeDescription,
                projectId: oData.projectId,
                projectDescription: oData.projectDescription,
                buildingId: oData.buildingId,
                unitTypeDescription: oData.unitTypeDescription,
                usageTypeDescription: oData.usageTypeDescription,
                unitStatusDescription: oData.unitStatusDescription,
                floorDescription: oData.floorDescription,
                zone: oData.zone,
                salesPhase: oData.salesPhase,
                finishingSpexDescription: oData.finishingSpexDescription,
                profitCenter: oData.profitCenter,
                functionalArea: oData.functionalArea,
                unitDeliveryDate: oData.unitDeliveryDate,
                supplementaryText: oData.supplementaryText,
                measurements: oData.measurements,
                conditions: oData.conditions
            });

            if (!this._oDetailsDialog) {
                this._oDetailsDialog = new sap.m.Dialog({
                    title: "Unit Details",
                    contentWidth: "100%",
                    resizable: true,
                    draggable: true,
                    content: [
                        new sap.m.IconTabBar({
                            expandable: true,
                            items: [
                                // 🔹 Tab 1: Unit General Data
                                new sap.m.IconTabFilter({
                                    text: "General Data",
                                    icon: "sap-icon://project-definition",
                                    content: [
                                        new sap.ui.layout.form.SimpleForm({
                                            editable: false,
                                            layout: "ResponsiveGridLayout",
                                            labelSpanL: 3,
                                            columnsL: 2,
                                            content: [
                                                new sap.m.Label({ text: "Unit ID" }),
                                                new sap.m.Text({ text: "{/unitId}" }),

                                                new sap.m.Label({ text: "Unit Description" }),
                                                new sap.m.Text({ text: "{/unitDescription}" }),

                                                new sap.m.Label({ text: "Company Code ID" }),
                                                new sap.m.Text({ text: "{/companyCodeId}" }),

                                                new sap.m.Label({ text: "Company Code Description" }),
                                                new sap.m.Text({ text: "{/companyCodeDescription}" }),

                                                new sap.m.Label({ text: "Project ID" }),
                                                new sap.m.Text({ text: "{/projectId}" }),

                                                new sap.m.Label({ text: "Project Description" }),
                                                new sap.m.Text({ text: "{/projectDescription}" }),

                                                new sap.m.Label({ text: "Building ID" }),
                                                new sap.m.Text({ text: "{/buildingId}" }),

                                                new sap.m.Label({ text: "Unit Type Description" }),
                                                new sap.m.Text({ text: "{/unitTypeDescription}" }),

                                                new sap.m.Label({ text: "Usage Type Description" }),
                                                new sap.m.Text({ text: "{/usageTypeDescription}" }),

                                                new sap.m.Label({ text: "Unit Status Description" }),
                                                new sap.m.Text({ text: "{/unitStatusDescription}" }),

                                                new sap.m.Label({ text: "Floor Description" }),
                                                new sap.m.Text({ text: "{/floorDescription}" }),

                                                new sap.m.Label({ text: "Zone" }),
                                                new sap.m.Text({ text: "{/zone}" }),

                                                new sap.m.Label({ text: "Sales Phase" }),
                                                new sap.m.Text({ text: "{/salesPhase}" }),

                                                new sap.m.Label({ text: "Finishing Spex Description" }),
                                                new sap.m.Text({ text: "{/finishingSpexDescription}" }),

                                                new sap.m.Label({ text: "Delivery Date" }),
                                                new sap.m.Text({ text: "{/unitDeliveryDate}" })
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
                                }),

                                // 🔹 Tab 4: Measurements (maintained as is)
                                new sap.m.IconTabFilter({
                                    text: "Measurements",
                                    icon: "sap-icon://measure",
                                    content: [
                                        new sap.m.Table({
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
                                                        new sap.m.Text({ text: "{code}" }),
                                                        new sap.m.Text({ text: "{description}" }),
                                                        new sap.m.Text({ text: "{quantity}" }),
                                                        new sap.m.Text({ text: "{uom}" })
                                                    ]
                                                })
                                            }
                                        })
                                    ]
                                }),

                                // 🔹 Tab 5: Conditions (maintained as is)
                                new sap.m.IconTabFilter({
                                    text: "Conditions",
                                    icon: "sap-icon://list",
                                    content: [
                                        new sap.m.Table({
                                            columns: [
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Code" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Amount" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Currency" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Number of Years" }) }),  // NEW: Add column

                                            ],
                                            items: {
                                                path: "/conditions",
                                                template: new sap.m.ColumnListItem({
                                                    cells: [
                                                        new sap.m.Text({ text: "{code}" }),
                                                        new sap.m.Text({ text: "{description}" }),
                                                        new sap.m.Text({ text: "{amount}" }),
                                                        new sap.m.Text({ text: "{currency}" }),
                                                        new sap.m.Text({ text: "{numberOfYears}" })  // NEW: Read-only text for numberOfYears

                                                    ]
                                                })
                                            }
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
        },

        onDelete: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            if (oBindingContext) {
                var sPath = oBindingContext.getPath();
                var oModel = this.getView().byId("unitsTable").getModel();
                var oItem = oModel.getProperty(sPath);

                if (!oItem) {
                    sap.m.MessageBox.error("Could not find model data for deletion.");
                    return;
                }

                MessageBox.confirm("Are you sure you want to delete " + oItem.unitId + "?", {
                    title: "Confirm Deletion",
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            fetch(`/odata/v4/real-estate/Units(unitId='${oItem.unitId}')`, {
                                method: "DELETE"
                            })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error("Failed to delete: " + response.statusText);
                                    }

                                    var aRecords = oModel.getProperty("/Units");
                                    var iIndex = aRecords.findIndex(st => st.unitId === oItem.unitId);
                                    if (iIndex > -1) {
                                        aRecords.splice(iIndex, 1);
                                        oModel.setProperty("/Units", aRecords);
                                    }

                                    sap.m.MessageToast.show("Unit deleted successfully!");
                                })
                                .catch(err => {
                                    console.error("Error deleting Unit:", err);
                                    sap.m.MessageBox.error("Error: " + err.message);
                                });
                        }
                    }
                });
            }
        },
        onEditDialogUsageTypeChange: function () {
            var oUsageSelect = sap.ui.getCore().byId("editUsageTypeDescInput");
            var oUnitTypeSelect = sap.ui.getCore().byId("editUnitTypeDescInput");

            var sUsageType = oUsageSelect.getSelectedKey();

            var oModel = this._oEditDialog.getModel();
            var sCurrentUnitType = oModel.getProperty("/unitTypeDescription");

            oModel.setProperty("/usageTypeDescription", sUsageType);

            oUnitTypeSelect.removeAllItems();

            var mUnitTypes = {
                "Residential": ["Apartment", "Villa", "Townhouse", "Studio"],
                "Commercial": ["Retail", "Shops"],
                "Admin": ["Office", "Clinic"]
            };

            var aTypes = mUnitTypes[sUsageType] || [];

            oUnitTypeSelect.setEnabled(aTypes.length > 0);

            aTypes.forEach(type => {
                oUnitTypeSelect.addItem(new sap.ui.core.Item({
                    key: type,
                    text: type
                }));
            });
            if (aTypes.includes(sCurrentUnitType)) {
                oUnitTypeSelect.setSelectedKey(sCurrentUnitType);
            } else {
                oUnitTypeSelect.setSelectedKey(aTypes[0] || "");
                oModel.setProperty("/unitTypeDescription", aTypes[0] || "");
            }
        },
        _populateUnitTypeOnEdit: function (oModel) {

            var sUsageType = oModel.getProperty("/usageTypeDescription");
            var sCurrentUnitType = oModel.getProperty("/unitTypeDescription");

            var oUnitTypeSelect = sap.ui.getCore().byId("editUnitTypeDescInput");
            if (!oUnitTypeSelect) return;

            oUnitTypeSelect.removeAllItems();

            var mUnitTypes = {
                "Residential": ["Apartment", "Villa", "Townhouse", "Studio"],
                "Commercial": ["Retail", "Shops"],
                "Admin": ["Office", "Clinic"]
            };

            var aTypes = mUnitTypes[sUsageType] || [];

            // Populate items
            aTypes.forEach(type => {
                oUnitTypeSelect.addItem(new sap.ui.core.Item({
                    key: type,
                    text: type
                }));
            });

            // Restore selected Unit Type from table
            if (sCurrentUnitType && aTypes.includes(sCurrentUnitType)) {
                oUnitTypeSelect.setSelectedKey(sCurrentUnitType);
            } else {
                oUnitTypeSelect.setSelectedKey(aTypes[0] || "");
                oModel.setProperty("/unitTypeDescription", aTypes[0] || "");
            }
        },
        onEditUnit: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            if (!oBindingContext) return;

            var oData = oBindingContext.getObject();
            var oDialogModel = new sap.ui.model.json.JSONModel(Object.assign({}, oData, { filteredBuildings: [] }));

            // Pre-filter buildings for initial project
            this._updateFilteredBuildings(oData.projectId, oDialogModel);

            if (!this._oEditDialog) {
                this._oEditDialog = new sap.m.Dialog({
                    title: "Edit Unit",
                    content: new sap.m.VBox({
                        items: [
                            new sap.m.Label({ text: "Unit ID" }),
                            new sap.m.Input({ value: "{/unitId}", editable: false }),

                            new sap.m.Label({ text: "Unit Description", required: true }),
                            new sap.m.Input("editUnitDescInput", { value: "{/unitDescription}" }),

                            new sap.m.Label({ text: "Company Code ID", required: true }),
                            new ComboBox("editCompanyCodeIdInput", {
                                selectedKey: "{/companyCodeId}",
                                change: this.onCompanyCodeChange.bind(this),
                                items: {
                                    path: "companyCodesList>/",
                                    template: new Item({
                                        key: "{companyCodesList>companyCodeId}",
                                        text: "{companyCodesList>companyCodeId} - {companyCodesList>companyCodeDescription}"
                                    })
                                }
                            }),

                            new sap.m.Label({ text: "Company Code Description", required: true }),
                            new sap.m.Input("editCompanyCodeDescInput", { value: "{/companyCodeDescription}" }),

                            new sap.m.Label({ text: "Project ID", required: true }),
                            new ComboBox("editProjectIdInput", {
                                selectedKey: "{/projectId}",
                                change: this.onProjectChange.bind(this),
                                items: {
                                    path: "projectsList>/",
                                    template: new Item({
                                        key: "{projectsList>projectId}",
                                        text: "{projectsList>projectId} - {projectsList>projectDescription}"
                                    })
                                }
                            }),

                            new sap.m.Label({ text: "Project Description", required: true }),
                            new sap.m.Input("editProjectDescInput", { value: "{/projectDescription}" }),

                            new sap.m.Label({ text: "Building ID", required: true }),
                            new ComboBox("editBuildingIdInput", {
                                selectedKey: "{/buildingId}",
                                change: this.onBuildingChange.bind(this),  // Added: to set building description
                                items: {
                                    path: "/filteredBuildings",
                                    template: new Item({
                                        key: "{buildingId}",
                                        text: "{buildingId} - {buildingDescription}"
                                    })
                                }
                            }),

                            new sap.m.Label({ text: "Building Description", required: true }),
                            new sap.m.Input("editBuildingDescInput", { value: "{/buildingDescription}" }),
                            new sap.m.Label({ text: "Usage Type", required: true }),
                            new sap.m.Select("editUsageTypeDescInput", {
                                selectedKey: "{/usageTypeDescription}",

                                change: this.onEditDialogUsageTypeChange.bind(this),
                                items: [
                                    new sap.ui.core.Item({ key: "Residential", text: "Residential" }),
                                    new sap.ui.core.Item({ key: "Commercial", text: "Commercial" }),
                                    new sap.ui.core.Item({ key: "Admin", text: "Admin" })
                                ]
                            }),

                            new sap.m.Label({ text: "Unit Type", required: true }),
                            new sap.m.Select("editUnitTypeDescInput", {
                                selectedKey: "{/unitTypeDescription}",

                            }),
                            new sap.m.Label({ text: "Unit Status", required: true }),
                            new sap.m.Select("editUnitStatusDescInput", {

                                selectedKey: "{/unitStatusDescription}",

                                items: [

                                    new sap.ui.core.Item({ key: "Open", text: "Open" }),
                                    new sap.ui.core.Item({ key: "Closed", text: "Closed" }),
                                    new sap.ui.core.Item({ key: "Cancelled", text: "Cancelled" }),
                                    new sap.ui.core.Item({ key: "Terminated", text: "Terminated" })
                                ]
                            }),
                            // new sap.m.Label({ text: "Unit Type Description", required: true }),
                            // new sap.m.Input("editUnitTypeDescInput", { value: "{/unitTypeDescription}" }),

                            // new sap.m.Label({ text: "Usage Type Description", required: true }),
                            // new sap.m.Input("editUsageTypeDescInput", { value: "{/usageTypeDescription}" }),

                            // new sap.m.Label({ text: "Unit Status Description", required: true }),
                            // new sap.m.Input("editUnitStatusDescInput", { value: "{/unitStatusDescription}" }),

                            new sap.m.Label({ text: "Floor Description", required: true }),
                            new sap.m.Input("editFloorDescInput", { value: "{/floorDescription}" }),

                            new sap.m.Label({ text: "Zone", required: true }),
                            new sap.m.Input("editZoneInput", { value: "{/zone}" }),

                            // new sap.m.Label({ text: "Sales Phase", required: true }),
                            // new sap.m.Input("editSalesPhaseInput", { value: "{/salesPhase}" }),
                            new sap.m.Label({ text: "Sales Phase", required: true }),
                            new sap.m.Select("editSalesPhaseInput", {

                                selectedKey: "{/salesPhase}",

                                items: [

                                    new sap.ui.core.Item({ key: "1", text: "1" }),
                                    new sap.ui.core.Item({ key: "2", text: "2" }),
                                    new sap.ui.core.Item({ key: "3", text: "3" }),
                                    new sap.ui.core.Item({ key: "4", text: "4" })
                                ]
                            }),
                              new sap.m.Label({ text: "Finishing Spex Description", required: true }),
                            new sap.m.Select("editFinishingSpexDescInput", {
                                selectedKey: "{/finishingSpexDescription}",
                                items: [
                                    //new sap.ui.core.Item({ key: "", text: "" }),
                                    new sap.ui.core.Item({ key: "Core and Shell", text: "Core and Shell" }),
                                    new sap.ui.core.Item({ key: "Semi Finished", text: "Semi Finished" }),
                                    new sap.ui.core.Item({ key: "Fully Finished", text: "Fully Finished" }),
                                ]
                            }),
                           
                            new sap.m.Label({ text: "Profit Center", required: true }),
                            new sap.m.Input("editProfitCenterInput", { value: "{/profitCenter}" }),

                            new sap.m.Label({ text: "Functional Area", required: true }),
                            new sap.m.Input("editFunctionalAreaInput", { value: "{/functionalArea}" }),

                            new sap.m.Label({ text: "Delivery Date", required: true }),
                            new sap.m.DatePicker("editUnitDeliveryDateInput", {
                                value: "{/unitDeliveryDate}",
                                displayFormat: "long",
                                valueFormat: "yyyy-MM-dd",
                                placeholder: "Select a date"
                            }),

                            new sap.m.Label({ text: "Supplementary Text"}),
                            new sap.m.Input("editSupplementaryTextInput", { value: "{/supplementaryText}" }),

                            // Adjusted Measurements section with better button layout (icons and HBox)
                            new sap.m.Title({ text: "Measurements", level: "H3" }),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Button({
                                        text: "add row",
                                        icon: "sap-icon://add",
                                        type: "Accept",
                                        press: this.onAddMeasurementRow.bind(this)
                                    }),
                                    new sap.m.Button({
                                        text: "delete row",
                                        icon: "sap-icon://delete",
                                        type: "Reject",
                                        press: this.onDeleteMeasurementRow.bind(this)
                                    })
                                ],
                                justifyContent: "Start",
                                alignItems: "Center"
                            }),
                            new sap.m.Table({
                                id: "editMeasurementsTable",
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
                                                items: {
                                                    path: "measurementsList>/",
                                                    template: new Item({
                                                        key: "{measurementsList>code}",
                                                        text: "{measurementsList>code} - {measurementsList>description}"
                                                    })
                                                }
                                            }),
                                            new Text({ text: "{description}" }),
                                            new Input({ value: "{quantity}", type: "Number" }),
                                            new Input({ value: "{uom}" })
                                        ]
                                    })
                                }
                            }),

                            // Adjusted Conditions section with better button layout (icons and HBox)
                            new sap.m.Title({ text: "Conditions", level: "H3" }),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Button({
                                        text: "add row",
                                        icon: "sap-icon://add",
                                        type: "Accept",
                                        press: this.onAddConditionRow.bind(this)
                                    }),
                                    new sap.m.Button({
                                        text: "delete row",
                                        icon: "sap-icon://delete",
                                        type: "Reject",
                                        press: this.onDeleteConditionRow.bind(this)
                                    })
                                ],
                                justifyContent: "Start",
                                alignItems: "Center"
                            }),
                            new sap.m.Table({
                                id: "editConditionsTable",
                                items: "{/conditions}",
                                columns: [
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Code" }) }),
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) }),
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Amount" }) }),
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Currency" }) }),
                                    new sap.m.Column({ header: new sap.m.Label({ text: "Number of Years" }) })  // NEW: Add column

                                ],
                                items: {
                                    path: "/conditions",
                                    template: new sap.m.ColumnListItem({
                                        cells: [
                                            new ComboBox({
                                                selectedKey: "{code}",
                                                change: this.onConditionCodeChange.bind(this),
                                                items: {
                                                    path: "conditionsList>/",
                                                    template: new Item({
                                                        key: "{conditionsList>code}",
                                                        text: "{conditionsList>code} - {conditionsList>description}"
                                                    })
                                                }
                                            }),
                                            new Text({ text: "{description}" }),
                                            new Input({ value: "{amount}", type: "Number" }),
                                            new Input({ value: "{currency}" }),
                                            new Input({ value: "{numberOfYears}", type: "Number" })  // NEW: Editable input for numberOfYears

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
                            var oUpdatedData = this._oEditDialog.getModel().getData();

                            // 🧩 Validate required fields (FIXED: Proper validation for Select/ComboBox vs Input/DatePicker)
                            var aRequiredFields = [
                                { id: "editUnitDescInput", name: "Unit Description" },
                                { id: "editCompanyCodeIdInput", name: "Company Code ID" },
                                { id: "editCompanyCodeDescInput", name: "Company Code Description" },
                                { id: "editProjectIdInput", name: "Project ID" },
                                { id: "editProjectDescInput", name: "Project Description" },
                                { id: "editBuildingIdInput", name: "Building ID" },  // Added: Building ID is now required
                                { id: "editBuildingDescInput", name: "Building Description" },  // Added: Building Description is now required
                                { id: "editUnitTypeDescInput", name: "Unit Type Description" },
                                { id: "editUsageTypeDescInput", name: "Usage Type Description" },
                                { id: "editUnitStatusDescInput", name: "Unit Status Description" },
                                { id: "editFloorDescInput", name: "Floor Description" },
                                { id: "editZoneInput", name: "Zone" },
                                { id: "editSalesPhaseInput", name: "Sales Phase" },
                                { id: "editFinishingSpexDescInput", name: "Finishing Spex Description" },
                                { id: "editProfitCenterInput", name: "Profit Center" },
                                { id: "editFunctionalAreaInput", name: "Functional Area" },
                                { id: "editUnitDeliveryDateInput", name: "Delivery Date" },
                                { id: "editSupplementaryTextInput", name: "Supplementary Text" }
                            ];

                            var bValid = true;
                            aRequiredFields.forEach(function (field) {
                                var oControl = sap.ui.getCore().byId(field.id);
                                if (!oControl) return;

                                // ✅ Skip disabled fields
                                if (oControl.getEnabled && !oControl.getEnabled()) {
                                    return;
                                }

                                var vValue = "";

                                // For Select and ComboBox
                                if (oControl.isA("sap.m.Select") || oControl.isA("sap.m.ComboBox")) {
                                    vValue = oControl.getSelectedKey();
                                }
                                // For Input, DatePicker, etc.
                                else if (oControl.getValue) {
                                    vValue = oControl.getValue();
                                }

                                if (!vValue) {
                                    oControl.setValueState("Error");
                                    oControl.setValueStateText(field.name + " is required");
                                    bValid = false;
                                } else {
                                    oControl.setValueState("None");
                                }
                            });

                            if (!bValid) {
                                sap.m.MessageBox.warning("Please fill all required fields before saving.");
                                return;
                            }

                            // Revert to original PATCH logic with defaults
                            const payload = {
                                unitId: oUpdatedData.unitId,
                                unitDescription: oUpdatedData.unitDescription,
                                companyCodeId: oUpdatedData.companyCodeId,
                                companyCodeDescription: oUpdatedData.companyCodeDescription,
                                projectId: oUpdatedData.projectId,
                                projectDescription: oUpdatedData.projectDescription,
                                buildingId: oUpdatedData.buildingId,  // Added: Include buildingId
                                buildingDescription: oUpdatedData.buildingDescription,  // Added: Include buildingDescription
                                unitTypeDescription: oUpdatedData.unitTypeDescription,
                                usageTypeDescription: oUpdatedData.usageTypeDescription,
                                unitStatusDescription: oUpdatedData.unitStatusDescription,
                                floorDescription: oUpdatedData.floorDescription,
                                zone: oUpdatedData.zone,
                                salesPhase: oUpdatedData.salesPhase,
                                finishingSpexDescription: oUpdatedData.finishingSpexDescription,
                                unitDeliveryDate: oUpdatedData.unitDeliveryDate || null,
                                supplementaryText: oUpdatedData.supplementaryText,
                                profitCenter: oUpdatedData.profitCenter || 0,
                                functionalArea: oUpdatedData.functionalArea || 0,
                                measurements: oUpdatedData.measurements,
                                conditions: oUpdatedData.conditions
                            };

                            // Fix for the error: Remove empty compositions from payload
                            if (payload.measurements.length === 0) {
                                delete payload.measurements;
                            }
                            if (payload.conditions.length === 0) {
                                delete payload.conditions;
                            }

                            // 🟢 Proceed with PATCH request
                            fetch(`/odata/v4/real-estate/Units(unitId='${oUpdatedData.unitId}')`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            })
                                .then(response => {
                                    if (!response.ok) throw new Error("Update failed");
                                    return response.json();
                                })
                                .then(() => {
                                    sap.m.MessageToast.show("Unit updated successfully!");
                                    this._loadUnits();
                                    this._oEditDialog.close();
                                })
                                .catch(err => sap.m.MessageBox.error("Error: " + err.message));
                        }.bind(this)
                    }),

                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            this._oEditDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oEditDialog);
            }

            this._oEditDialog.setModel(oDialogModel);
            this._populateUnitTypeOnEdit(oDialogModel);

            this._oEditDialog.open();
        },
        onCompanyCodeChange: function (oEvent) {
            var sSelectedKey = oEvent.getSource().getSelectedKey();  // Safer way to get the selected key
            var oCompanyCodesList = this.getView().getModel("companyCodesList").getData();

            // Find the selected company's description
            var oSelectedCompany = oCompanyCodesList.find(function (item) {
                return item.companyCodeId === sSelectedKey;
            });

            if (oSelectedCompany) {
                // Set the description in the dialog model
                this._oAddDialog.getModel().setProperty("/companyCodeDescription", oSelectedCompany.companyCodeDescription);
            }
        },
        onAddMeasurementRow: function (oEvent) {
            const oModel = oEvent.getSource().getModel();
            oModel.getProperty("/measurements").push({ code: "", description: "", quantity: 0, uom: "" });
            oModel.refresh();
        },
        onDeleteMeasurementRow: function (oEvent) {
            const oModel = oEvent.getSource().getModel();
            const aMeasurements = oModel.getProperty("/measurements");
            aMeasurements.pop();
            oModel.refresh();
        },
        onAddConditionRow: function (oEvent) {
            const oModel = oEvent.getSource().getModel();
            oModel.getProperty("/conditions").push({ code: "", description: "", amount: 0, currency: "", numberOfYears: 0 });
            oModel.refresh();
        },
        onDeleteConditionRow: function (oEvent) {
            const oModel = oEvent.getSource().getModel();
            const aConditions = oModel.getProperty("/conditions");
            aConditions.pop();
            oModel.refresh();
        },
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

        onConditionCodeChange: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var oSelectedItem = oComboBox.getSelectedItem();
            var sDescription = oSelectedItem ? oSelectedItem.getText().split(" - ")[1] || "" : "";
            var oContext = oComboBox.getBindingContext();
            if (oContext) {
                oContext.getModel().setProperty(oContext.getPath() + "/description", sDescription);

                // NEW: Set numberOfYears based on selected condition code
                var numberOfYears = 0;  // Default
                if (sSelectedKey === "CASH") {
                    numberOfYears = 0;
                } else if (sSelectedKey === "5YP") {
                    numberOfYears = 5;
                } else if (sSelectedKey === "7YP") {
                    numberOfYears = 7;
                }
                oContext.getModel().setProperty(oContext.getPath() + "/numberOfYears", numberOfYears);
            }
        },
        //Updated Filters Fields ..
        onFilterUnits: function () {
            var oTable = this.byId("unitsTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            // Company Code
            var sCompanyCode = this.byId("companyCodeFilter").getSelectedKey();
            if (sCompanyCode) {
                aFilters.push(new sap.ui.model.Filter("companyCodeId", sap.ui.model.FilterOperator.EQ, sCompanyCode));
            }

            // Project ID
            var sProjectId = this.byId("projectIdFilter").getSelectedKey();
            if (sProjectId) {
                aFilters.push(new sap.ui.model.Filter("projectId", sap.ui.model.FilterOperator.EQ, sProjectId));
            }

            // Unit Type
            var sUnitType = this.byId("unitTypeFilter").getSelectedKey();
            if (sUnitType) {
                aFilters.push(new sap.ui.model.Filter("unitTypeDescription", sap.ui.model.FilterOperator.EQ, sUnitType));
            }

            // Floor range
            var sFloorFrom = this.byId("_IDGenInput17").getValue();
            var sFloorTo = this.byId("_IDGenInput18").getValue();

            if (sFloorFrom) {
                aFilters.push(new sap.ui.model.Filter("floorDescription", sap.ui.model.FilterOperator.GE, sFloorFrom));
            }
            if (sFloorTo) {
                aFilters.push(new sap.ui.model.Filter("floorDescription", sap.ui.model.FilterOperator.LE, sFloorTo));
            }

            // BUA
            var sBUA = this.byId("_IDGenInput22")?.getValue(); // adjust ID if needed
            if (sBUA) {
                aFilters.push(new sap.ui.model.Filter("bua", sap.ui.model.FilterOperator.EQ, sBUA));
            }

            // === KEEPING YOUR COMPLEX PRICE PLAN YEARS LOGIC ===
            var sPricePlanYears = this.byId("_IDGenInput20").getValue();

            if (sPricePlanYears) {
                var aValidProjectIds = [];
                var aPaymentPlans = this.getView().getModel("paymentPlansFilter").getData() || [];

                aPaymentPlans.forEach(function (plan) {
                    var matchesYears = plan.planYears === parseInt(sPricePlanYears);

                    if (matchesYears) {
                        if (Array.isArray(plan.assignedProjects)) {
                            plan.assignedProjects.forEach(function (assignment) {
                                if (assignment.project && assignment.project.projectId) {
                                    var projId = assignment.project.projectId;
                                    if (aValidProjectIds.indexOf(projId) === -1) {
                                        aValidProjectIds.push(projId);
                                    }
                                }
                            });
                        }
                    }
                });

                if (aValidProjectIds.length > 0) {
                    var aProjectFilters = aValidProjectIds.map(function (projId) {
                        return new sap.ui.model.Filter("projectId", sap.ui.model.FilterOperator.EQ, projId);
                    });

                    // OR logic between projects
                    aFilters.push(new sap.ui.model.Filter({
                        aFilters: aProjectFilters,
                        bAnd: false
                    }));
                } else {
                    aFilters.push(new sap.ui.model.Filter("projectId", sap.ui.model.FilterOperator.EQ, null));
                }
            }

            // Price range (From / To)
            var sPriceFrom = this.byId("_IDGenInput23")?.getValue();
            var sPriceTo = this.byId("_IDGenInput24")?.getValue();

            if (sPriceFrom) {
                aFilters.push(new sap.ui.model.Filter("price", sap.ui.model.FilterOperator.GE, parseFloat(sPriceFrom)));
            }
            if (sPriceTo) {
                aFilters.push(new sap.ui.model.Filter("price", sap.ui.model.FilterOperator.LE, parseFloat(sPriceTo)));
            }

            // Apply filters
            var oCombinedFilter = aFilters.length > 0
                ? new sap.ui.model.Filter(aFilters, true)
                : null;

            oBinding.filter(oCombinedFilter ? [oCombinedFilter] : []);
        },
        onCreateReservation: function (oEvent) {
            var oUnit = oEvent.getSource().getBindingContext().getObject();
            var oReservationData = {
                bua: oUnit.measurements?.find(m => m.code?.trim() === "BUA")?.quantity || 0,
                companyCodeId: oUnit.companyCodeId,
                project_projectId: oUnit.projectId,
                buildingId: oUnit.buildingId,
                unit_unitId: oUnit.unitId,
                unitPrice: oUnit.originalPrice || 0,
                unitStatusDescription: oUnit.unitStatusDescription,
                phase: oUnit.salesPhase,
                reservationType: oUnit.usageTypeDescription,
                unitType: oUnit.unitTypeDescription,
                currency: oUnit.conditions?.find(m => m.currency)?.currency,
                // Map Conditions to get the Price Plan Years of unit
                 unitConditions: (oUnit.conditions || []).map(cond => ({
                    conditionId: cond.ID,
                    pricePlanYears: cond.code,
                    finalPrice: cond.amount,
                    
                })),

                simulations: (oUnit.simulations || []).map(sim => ({
                    simulationId: sim.simulationId,
                    paymentPlan_paymentPlanId: sim.paymentPlan_paymentPlanId,
                    pricePlanYears: sim.pricePlanYears,
                    finalPrice: sim.finalPrice,
                    projectId: sim.projectId,
                    unitId: sim.unit_unitId
                }))

            };


            var sData = encodeURIComponent(JSON.stringify(oReservationData));
            sap.ui.core.UIComponent.getRouterFor(this).navTo("CreateReservation", {
                reservationData: sData
            });
        }

        ,
        onClearFilter: function () {
            var oModel = this.getView().getModel("view");

            this.byId("unitTypeFilter").setSelectedKey("");
            this.byId("companyCodeFilter").setSelectedKey("");
            this.byId("projectIdFilter").setSelectedKey("");

            oModel.setProperty("/selectedUnitStatus", "");
            oModel.setProperty("/selectedUnitId", "");
            oModel.setProperty("/selectedUnitId", "");

            var oTable = this.byId("unitsTable");
            oTable.getBinding("items").filter([]);
        },

        //#region Payment Plan Simulation Part 

        // New: Reset function to clear all data when dialog closes
        _resetSimulationDialog: function () {
            if (this._oSimulationDialog) {
                // Reset local model to initial state
                var oLocal = this._oSimulationDialog.getModel("local");
                oLocal.setData({
                    headerVisible: false,
                    pricePlan: "",
                    clientName: "",
                    headerFields: [],
                    totalAmount: 0,
                    totalMaintenance: 0
                });

                // Clear simulation output table
                var oSimulationOutput = this._oSimulationDialog.getModel("simulationOutput");
                oSimulationOutput.setData([]);

                // Clear hidden inputs
                sap.ui.getCore().byId("pricePlanInputPPS").setValue("");
                sap.ui.getCore().byId("projectIdInputPPS").setValue("");
                sap.ui.getCore().byId("paymentPlanIdInputPPS").setValue("");
                sap.ui.getCore().byId("leadIdInputPPS").setValue("");
                sap.ui.getCore().byId("simIdInput").setValue("");

                console.log("Simulation dialog reset to initial state.");
            }
        },


        // Added: Print function for the simulation dialog
        _printSimulation: function () {
            // Get the dialog's model data
            var oLocal = this._oSimulationDialog.getModel("local");
            var oSimulationOutput = this._oSimulationDialog.getModel("simulationOutput");

            // Build printable HTML content from the dialog's data
            var printContent = `
                <html>
                <head>
                    <title>Payment Plan Simulation</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .center { text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>Payment Plan Simulation</h1>
                    <h2 class="center">Price Plan: ${oLocal.getProperty("/pricePlan")}</h2>
                    <p>Client Name: ${oLocal.getProperty("/clientName")}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${oLocal.getProperty("/headerFields").map(field => `
                                <tr>
                                    <td>${field.field}</td>
                                    <td>${field.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <h3>Installment Schedule</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Installment</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Maintenance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${oSimulationOutput.getData().map(item => `
                                <tr>
                                    <td>${item.conditionType}</td>
                                    <td>${item.dueDate}</td>
                                    <td>${item.amount}</td>
                                    <td>${item.maintenance}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            // Open a new window with the content and print
            var printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        },

        // Updated: Value help for Price Plan (Years) - shows all available years for the project, user selects, then runs simulation
        onOpenPricePlanValueHelpPPS: function () {
            const oView = this._oSimulationDialog;
            const projectId = sap.ui.getCore().byId("projectIdInputPPS").getValue();

            if (!this._oPricePlanValueHelpPPS) {
                this._oPricePlanValueHelpPPS = new SelectDialog({
                    title: "Select Payment Plan Year",
                    items: {
                        path: "filteredPlans>/",
                        template: new StandardListItem({
                            title: "{filteredPlans>planYears} Years",
                            description: "{filteredPlans>description}"
                        })
                    },
                    search: function (oEvent) {
                        const sValue = oEvent.getParameter("value") || "";
                        const aFilters = [
                            new sap.ui.model.Filter("planYears", sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue)
                        ];
                        oEvent.getSource().getBinding("items").filter(new sap.ui.model.Filter(aFilters, false));
                    },
                    confirm: function (oEvent) {
                        const oSelectedItem = oEvent.getParameter("selectedItem");
                        if (oSelectedItem) {
                            const oContext = oSelectedItem.getBindingContext("filteredPlans");
                            const oPlan = oContext.getObject();
                            const planYears = oPlan.planYears;
                            const paymentPlanId = oPlan.paymentPlanId;
                            const description = oPlan.description || "";


                            // Set the Input display value (for Input, use setValue)
                            sap.ui.getCore().byId("pricePlanInputPPS").setValue(`${planYears} Years`);

                            // Set Payment Plan ID in the input
                            sap.ui.getCore().byId("paymentPlanIdInputPPS").setValue(paymentPlanId);

                            // Auto-run simulation after selection
                            this.onSimulatePPS();
                        }
                    }.bind(this)
                });
                oView.addDependent(this._oPricePlanValueHelpPPS);
            }

            // Filter items by current project
            const oPlansModel = this._oSimulationDialog.getModel("paymentPlans");
            const aPlans = oPlansModel ? oPlansModel.getData() : [];

            const filteredPlans = aPlans.filter(p =>
                Array.isArray(p.assignedProjects) &&
                p.assignedProjects.some(ap => ap.project?.projectId === projectId)
            );

            if (filteredPlans.length === 0) {
                sap.m.MessageBox.warning("No payment plans available for the selected project.");
                return;  // Don't open if no data
            }

            // Set filtered data on the SelectDialog's model
            this._oPricePlanValueHelpPPS.setModel(new JSONModel(filteredPlans), "filteredPlans");

            // Refresh binding to ensure data is displayed
            const oBinding = this._oPricePlanValueHelpPPS.getBinding("items");
            if (oBinding) {
                oBinding.refresh();
            }

            this._oPricePlanValueHelpPPS.open();
        },

        // Adapted from PaymentPlanSimulations: Price plan change (handles manual input of years)
        onPricePlanChangePPS: function (oEvent) {
            const pricePlanYears = parseInt(oEvent.getParameter("value"));
            const projectId = sap.ui.getCore().byId("projectIdInputPPS").getValue();
            const oPlansModel = this._oSimulationDialog.getModel("paymentPlans");
            const aPlans = oPlansModel ? oPlansModel.getData() : [];

            const oSelectedPlan = (aPlans || []).find(p =>
                p.planYears === pricePlanYears &&
                Array.isArray(p.assignedProjects) &&
                p.assignedProjects.some(ap => ap.project?.projectId === projectId)
            );

            if (oSelectedPlan) {
                sap.ui.getCore().byId("paymentPlanIdInputPPS").setValue(oSelectedPlan.paymentPlanId);
                // Auto-run simulation after valid selection
                this.onSimulatePPS();
            } else {
                // Clear paymentPlanId if no matching plan found
                sap.ui.getCore().byId("paymentPlanIdInputPPS").setValue("");
                MessageBox.warning("No payment plan found for the entered years and project. Please select from the value help.");
            }
        },

        // Adapted from PaymentPlanSimulations: Load units for PPS

        _loadUnitsForSim: function () {
            return new Promise((resolve, reject) => {
                var oModel = new sap.ui.model.json.JSONModel();
                fetch("/odata/v4/real-estate/Units?$expand=measurements,conditions")
                    .then(response => response.json())
                    .then(data => {
                        // Post-process units to extract BUA, Garden Area, & Original Price
                        const enrichedUnits = data.value.map(unit => {
                            // Extract BUA (from measurements where code = 'BUA' – trim to handle tabs)
                            let buaMeasurement = unit.measurements?.find(m => m.code?.toUpperCase().trim() === "BUA");
                            let bua = buaMeasurement ? buaMeasurement.quantity : null;
                            let uom = buaMeasurement ? buaMeasurement.uom : null;

                            // Extract Garden Area (from measurements where code = 'GA' – trim to handle tabs)
                            let gardenMeasurement = unit.measurements?.find(m => m.code?.toUpperCase().trim() === "GA");
                            let gardenArea = gardenMeasurement ? gardenMeasurement.quantity : null;
                            let gardenUom = gardenMeasurement ? gardenMeasurement.uom : null;

                            // Extract Original Price (from first condition)
                            let firstCondition = unit.conditions?.[0];
                            let originalPrice = firstCondition ? firstCondition.amount : null;

                            return { ...unit, bua, originalPrice, uom, gardenArea, gardenUom };
                        });

                        oModel.setData({ Units: enrichedUnits });
                        this.getView().setModel(oModel, "view");
                        resolve();
                    })
                    .catch(err => {
                        console.error("Error fetching units for sim", err);
                        reject(err);
                    });
            });
        },

        // Adapted from PaymentPlanSimulations: Load dropdown data for PPS
        _loadDropdownDataForSim: async function () {
            try {
                const [projectsRes, plansRes] = await Promise.all([
                    fetch("/odata/v4/real-estate/Projects"),
                    fetch("/odata/v4/real-estate/PaymentPlans?$expand=assignedProjects($expand=project)")
                ]);
                const projects = await projectsRes.json();
                const plans = await plansRes.json();

                this._oSimulationDialog.setModel(new JSONModel(projects.value || []), "projects");
                this._oSimulationDialog.setModel(new JSONModel(plans.value || []), "paymentPlans");
            } catch (err) {
                console.error("Failed to load dropdown data for PPS:", err);
            }
        },

        // Adapted from PaymentPlanSimulations: Value help for unit (simplified, since pre-filled)
        onOpenUnitValueHelpPPS: function () {
            const oView = this._oSimulationDialog;

            if (!this._oUnitValueHelpPPS) {
                this._oUnitValueHelpPPS = new SelectDialog({
                    title: "Select Unit",
                    items: {
                        path: "units>/",
                        template: new StandardListItem({
                            title: "{units>unitDescription}",
                            description: "{units>unitId}"
                        })
                    },
                    search: function (oEvent) {
                        const sValue = oEvent.getParameter("value") || "";
                        const aFilters = [
                            new sap.ui.model.Filter("unitDescription", sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("unitId", sap.ui.model.FilterOperator.Contains, sValue)
                        ];
                        oEvent.getSource().getBinding("items").filter(new sap.ui.model.Filter(aFilters, false));
                    },
                    confirm: function (oEvent) {
                        const oSelectedItem = oEvent.getParameter("selectedItem");
                        if (oSelectedItem) {
                            const oContext = oSelectedItem.getBindingContext("units");
                            const oUnit = oContext.getObject();
                            const unitId = oUnit.unitId;
                            const desc = oUnit.unitDescription;
                            const oLocalModel = oView.getModel("local");
                            oLocalModel.setProperty("/unitId", unitId);
                            sap.ui.getCore().byId("unitIdInputPPS").setValue(`${desc} (${unitId})`);
                            this._onUnitSelectedPPS(unitId);
                        }
                    }.bind(this)
                });
                oView.addDependent(this._oUnitValueHelpPPS);
            }

            this._oUnitValueHelpPPS.open();
        },

        // Adapted: Handle unit selection
        _onUnitSelectedPPS: function (selectedUnitId) {
            this.onUnitChangePPS({ getParameter: () => ({ selectedItem: { getKey: () => selectedUnitId } }) });
        },

        // Adapted from PaymentPlanSimulations: Unit change logic
        onUnitChangePPS: async function (oEvent) {
            let selectedUnitId = null;
            if (oEvent && typeof oEvent.getParameter === "function") {
                const oSelItem = oEvent.getParameter("selectedItem");
                if (oSelItem && typeof oSelItem.getKey === "function") {
                    selectedUnitId = oSelItem.getKey();
                }
            }
            if (!selectedUnitId) {
                const oLocal = this._oSimulationDialog.getModel("local");
                selectedUnitId = oLocal ? oLocal.getProperty("/unitId") : null;
            }

            if (!selectedUnitId) return;

            const oUnitsModel = this._oSimulationDialog.getModel("units");
            const aUnits = oUnitsModel ? oUnitsModel.getData() : [];
            const oSelectedUnit = aUnits.find(u => u.unitId === selectedUnitId);

            if (oSelectedUnit) {
                const projectId = oSelectedUnit.project?.projectId || oSelectedUnit.projectId;
                const projectDescription = oSelectedUnit.project?.projectDescription || oSelectedUnit.projectDescription;
                const oLocalModel = this._oSimulationDialog.getModel("local");
                oLocalModel.setProperty("/projectId", projectId);
                oLocalModel.setProperty("/projectDescription", projectDescription);
                this._calculateFinalPricePPS(selectedUnitId, oLocalModel);
            }
        },

        // Helper: Calculate final price (adapted)
        _calculateFinalPricePPS: async function (unitId, oLocalModel) {
            try {
                const conditionsRes = await fetch(`/odata/v4/real-estate/Conditions?$filter=unit_unitId eq '${unitId}'`);
                const conditions = await conditionsRes.json();
                const aConditions = conditions.value || [];
                const finalPrice = aConditions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
                oLocalModel.setProperty("/finalPrice", finalPrice);
            } catch (err) {
                console.error("Failed to calculate final price for PPS:", err);
            }
        },

        // Adapted from PaymentPlanSimulations: Price plan change
        onPricePlanChangePPS: function (oEvent) {
            const pricePlanYears = parseInt(oEvent.getParameter("value"));
            const projectId = sap.ui.getCore().byId("projectIdInputPPS").getValue();
            const oPlansModel = this._oSimulationDialog.getModel("paymentPlans");
            const aPlans = oPlansModel ? oPlansModel.getData() : [];
            const oSelectedPlan = aPlans.find(p =>
                p.planYears === pricePlanYears &&
                Array.isArray(p.assignedProjects) &&
                p.assignedProjects.some(ap => ap.project?.projectId === projectId)
            );
            if (oSelectedPlan) {
                sap.ui.getCore().byId("paymentPlanIdInputPPS").setValue(oSelectedPlan.paymentPlanId);
            } else {
                sap.ui.getCore().byId("paymentPlanIdInputPPS").setValue("");
            }
        },
        onOpenPaymentSimulation: async function (oEvent) {  // Added async
            var unitId = oEvent.getSource().getBindingContext().getObject().unitId;
            var units = this.getView().getModel("view").getProperty("/Units");
            if (!units || units.length === 0 || !units[0].bua) {  // Updated: Also check if units are enriched
                await this._loadUnitsForSim();  // Await to ensure data is loaded and enriched
            }

            if (!this._oSimulationDialog) {
                // Simplified VBox: Price Plan input, hidden inputs for backend data, header section, and output table
                var oVBox = new sap.m.VBox({
                    items: [
                        new sap.m.Title({ text: "", level: "H3" }),
                        new sap.m.Label({ text: "Price Plan (Years)" }),
                        new sap.m.Input({
                            id: "pricePlanInputPPS",
                            showValueHelp: true,
                            valueHelpRequest: this.onOpenPricePlanValueHelpPPS.bind(this),
                            placeholder: "Select a payment plan year..."
                        }),
                        // Hidden inputs for backend data (not visible to user)
                        new sap.m.Input({ id: "projectIdInputPPS", visible: false }),
                        new sap.m.Input({ id: "paymentPlanIdInputPPS", visible: false }),
                        new sap.m.Input({ id: "leadIdInputPPS", visible: false }),
                        new sap.m.Input({ id: "simIdInput", visible: false }),  // Added: For simulation ID
                        // Header section (shown after selection) - Table layout for fields
                        new sap.m.VBox({
                            id: "simulationHeaderVBox",
                            visible: "{local>/headerVisible}",
                            items: [
                                // Centered Price Plan
                                new sap.m.Text({
                                    text: "Price Plan: {local>/pricePlan}",
                                    textAlign: "Center",
                                    width: "100%"
                                }),
                                // Client Name alone
                                new sap.m.Text({ text: "Client Name: {local>/clientName}" }),
                                // Table for remaining fields
                                new sap.m.Table({
                                    id: "simulationHeaderTable",
                                    width: "20%",
                                    showSeparators: "All",
                                    columns: [
                                        new sap.m.Column({ header: new sap.m.Label({ text: "" }) }),
                                        new sap.m.Column({ header: new sap.m.Label({ text: "" }) })
                                    ],
                                    items: {
                                        path: "local>/headerFields",
                                        template: new sap.m.ColumnListItem({
                                            cells: [
                                                new sap.m.Text({ text: "{local>field}" }),
                                                new sap.m.Text({ text: "{local>value}" })
                                            ]
                                        })
                                    }
                                })
                            ]
                        }),
                        new sap.m.Title({ text: "", level: "H3", visible: "{local>/headerVisible}" }),
                        new sap.m.Table({
                            id: "simulationTablePPS",
                            items: "{simulationOutput>/}",
                            width: "100%",
                            showSeparators: "All",
                            columns: [
                                new sap.m.Column({ header: new sap.m.Label({ text: "Installment" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "Due Date" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "Amount" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "Maintenance" }) })
                            ],
                            items: {
                                path: "simulationOutput>/",
                                template: new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({ text: "{simulationOutput>conditionType}" }),
                                        new sap.m.Text({ text: "{simulationOutput>dueDate}" }),
                                        new sap.m.Text({ text: "{simulationOutput>amount}" }),
                                        new sap.m.Text({ text: "{simulationOutput>maintenance}" })
                                    ]
                                })
                            }
                            // Footer removed: Total is now a row in the table
                        })
                    ]
                });

                this._oSimulationDialog = new sap.m.Dialog({
                    title: "Payment Plan Simulation",
                    contentWidth: "100%",
                    resizable: false,
                    content: oVBox,
                    beforeClose: this._resetSimulationDialog.bind(this),  // Added: Reset on close
                    buttons: [
                        new sap.m.Button({
                            text: "",
                            type: "Accept",
                            press: this.onSaveSimulationPPS.bind(this)
                        }),
                        new sap.m.Button({
                            text: "Print",
                            type: "Default",
                            press: this._printSimulation.bind(this)
                        }),
                        new sap.m.Button({
                            text: "Close",
                            press: function () {
                                this._oSimulationDialog.close();
                            }.bind(this)
                        })
                    ]
                });

                // Set models for the dialog
                this._oSimulationDialog.setModel(new JSONModel({
                    headerVisible: false,  // Initially hide header and table
                    pricePlan: "",
                    clientName: "",
                    headerFields: [],  // Array for table rows
                    totalAmount: 0,
                    totalMaintenance: 0
                }), "local");
                this._oSimulationDialog.setModel(new JSONModel([]), "simulationOutput");

                // Load data for PPS (removed redundant call here, as data is loaded in onInit)
                this._loadDropdownDataForSim();

                this.getView().addDependent(this._oSimulationDialog);
            }

            // Pre-fill hidden data from the selected unit (behind the scenes)
            if (this._oSimulationDialog) {
                var oLocal = this._oSimulationDialog.getModel("local");
                oLocal.setProperty("/unitId", unitId);
                oLocal.setProperty("/headerVisible", false);  // Reset visibility

                // Find unit and set project/final price (auto-populated)
                var units = this.getView().getModel("view").getProperty("/Units");
                var unit = units.find(u => u.unitId === unitId);
                if (unit) {
                    oLocal.setProperty("/projectDescription", unit.projectDescription || "N/A");
                    oLocal.setProperty("/builtUpArea", unit.bua ? unit.bua + " " + (unit.uom || "") : "N/A");
                    oLocal.setProperty("/gardenArea", unit.gardenArea ? unit.gardenArea + " " + (unit.gardenUom || "") : "N/A");  // Now uses "GA" code
                    oLocal.setProperty("/deliveryDate", unit.unitDeliveryDate || "N/A");
                    this._calculateFinalPricePPS(unitId, oLocal);  // Auto-calculate final price

                    // Pre-fill hidden inputs
                    sap.ui.getCore().byId("projectIdInputPPS").setValue(unit.projectId || "");
                    sap.ui.getCore().byId("paymentPlanIdInputPPS").setValue("");  // Will be set on selection
                    sap.ui.getCore().byId("leadIdInputPPS").setValue("");  // Placeholder; set if available

                    // Pre-populate header fields with initial data
                    oLocal.setProperty("/headerFields", [
                        { field: "Project", value: unit.projectDescription || "N/A" },
                        { field: "Built Up Area", value: unit.bua ? unit.bua + " " + (unit.uom || "") : "N/A" },
                        { field: "Unit Number", value: unitId },
                        { field: "Garden Area", value: unit.gardenArea ? unit.gardenArea + " " + (unit.gardenUom || "") : "N/A" },  // Now uses "GA" code
                        { field: "Unit Price", value: "Calculating..." },  // Placeholder until calculated
                        { field: "Delivery Date", value: unit.unitDeliveryDate || "N/A" },
                        { field: "Maintenance", value: "Calculating..." }  // Placeholder until calculated
                    ]);
                }

                this._oSimulationDialog.open();
            } else {
                console.error("Simulation dialog could not be created.");
            }
        },

        onSimulatePPS: async function () {
            const oLocal = this._oSimulationDialog.getModel("local");
            const unitId = oLocal ? oLocal.getProperty("/unitId") : null;
            const projectId = sap.ui.getCore().byId("projectIdInputPPS").getValue();
            const paymentPlanId = sap.ui.getCore().byId("paymentPlanIdInputPPS").getValue();
            const pricePlanYears = parseInt(sap.ui.getCore().byId("pricePlanInputPPS").getValue());
            const leadId = sap.ui.getCore().byId("leadIdInputPPS").getValue();

            if (!unitId) {
                MessageBox.error("Please select a unit.");
                return;
            }

            try {
                const conditionsRes = await fetch(`/odata/v4/real-estate/Conditions?$filter=unit_unitId eq '${unitId}'`);
                const conditions = await conditionsRes.json();
                const aConditions = conditions.value || [];

                // Filter conditions to only include those matching the selected plan years
                const filteredConditions = aConditions.filter(c => c.numberOfYears === pricePlanYears);

                // Check if any matching conditions exist; if not, error out
                if (filteredConditions.length === 0) {
                    MessageBox.error(`No conditions found for ${pricePlanYears} years. Please check unit conditions.`);
                    return;
                }

                // Calculate and set finalPrice using only filtered conditions (e.g., Cash for 0 years)
                const finalPrice = filteredConditions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
                oLocal.setProperty("/finalPrice", finalPrice);
                oLocal.setProperty("/unitPrice", finalPrice.toLocaleString('de-DE') + " EGP");  // Format like example
                oLocal.setProperty("/pricePlan", pricePlanYears + "YP");  // e.g., "5YP"
                oLocal.setProperty("/clientName", leadId || "N/A");  // Placeholder; fetch from lead if needed

                // Now check for matching payment plan
                const oPlansModel = this._oSimulationDialog.getModel("paymentPlans");
                const aPlans = oPlansModel ? oPlansModel.getData() : [];
                const matchingPlan = aPlans.find(p =>
                    p.planYears === pricePlanYears &&
                    Array.isArray(p.assignedProjects) &&
                    p.assignedProjects.some(ap => ap.project?.projectId === projectId)
                );

                let simulationSchedule = [];

                if (pricePlanYears === 0) {
                    // Special case for Cash (0 years): Create a single one-time installment with full finalPrice
                    const today = new Date();
                    simulationSchedule.push({
                        conditionType: "Cash Payment",
                        dueDate: today.toISOString().split('T')[0],  // Due today
                        amount: Math.round(finalPrice * 100) / 100,  // Full amount, rounded to 2 decimals
                        maintenance: 0
                    });
                } else if (!matchingPlan) {
                    // For non-zero years with no plan, warn and clear schedule
                    MessageBox.warning(`No payment plan found for ${pricePlanYears} years. Final price set, but no schedule available.`);
                    simulationSchedule = [];  // Clear schedule
                } else {
                    // Proceed with schedule simulation for valid plans (non-zero years)
                    const scheduleRes = await fetch(`/odata/v4/real-estate/PaymentPlanSchedules?$filter=paymentPlan_paymentPlanId eq '${paymentPlanId}'&$expand=conditionType,basePrice,frequency`);
                    const scheduleData = await scheduleRes.json();
                    const aSchedules = scheduleData.value || [];

                    const today = new Date();

                    aSchedules.forEach(schedule => {
                        const basePriceCode = schedule.basePrice?.code;
                        // Use filteredConditions for base amount
                        const condition = filteredConditions.find(c => c.code === basePriceCode);
                        const baseAmount = condition ? Number(condition.amount) : 0;
                        const amount = (baseAmount * schedule.percentage) / 100;
                        const interval = this._getFrequencyIntervalPPS(schedule.frequency?.description);

                        if (schedule.conditionType?.description === "Maintenance") {
                            for (let i = 0; i < (schedule.numberOfInstallments || 1); i++) {
                                const monthsToAdd = schedule.dueInMonth + i * interval;
                                const dueDate = new Date(today.getTime() + monthsToAdd * 30 * 24 * 60 * 60 * 1000);
                                simulationSchedule.push({
                                    conditionType: "",  // Keep as is for maintenance
                                    dueDate: dueDate.toISOString().split('T')[0],
                                    amount: 0,  // Maintenance has no amount
                                    maintenance: Math.round((amount / Math.max(1, schedule.numberOfInstallments)) * 100) / 100  // Round to 2 decimals
                                });
                            }
                        } else {
                            // Fixed: Use schedule's conditionType for labeling
                            let conditionType = schedule.conditionType?.description || "Installement";
                            if (conditionType === "Down payment") conditionType = "Down Payment";
                            if (conditionType === "Installment") conditionType = "Installement";

                            for (let i = 0; i < (schedule.numberOfInstallments || 1); i++) {
                                const monthsToAdd = schedule.dueInMonth + i * interval;
                                const dueDate = new Date(today.getTime() + monthsToAdd * 30 * 24 * 60 * 60 * 1000);
                                simulationSchedule.push({
                                    conditionType: conditionType,
                                    dueDate: dueDate.toISOString().split('T')[0],
                                    amount: Math.round((amount / Math.max(1, schedule.numberOfInstallments)) * 100) / 100,  // Round to 2 decimals
                                    maintenance: 0
                                });
                            }
                        }
                    });
                }

                // Sort the schedule by dueDate (ascending, empty dueDate for Total will be handled below)
                simulationSchedule.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

                // Calculate totals and add Total row (after sorting, so Total is last)
                const totalAmount = simulationSchedule.reduce((sum, item) => sum + Number(item.amount || 0), 0);
                const totalMaintenance = simulationSchedule.reduce((sum, item) => sum + Number(item.maintenance || 0), 0);
                oLocal.setProperty("/totalAmount", totalAmount.toLocaleString('de-DE') + " EGP");
                oLocal.setProperty("/totalMaintenance", totalMaintenance.toLocaleString('de-DE') + " EGP");
                oLocal.setProperty("/maintenanceTotal", totalMaintenance.toLocaleString('de-DE') + " EGP");

                // Add Total row to schedule (always last)
                simulationSchedule.push({
                    conditionType: "Total",
                    dueDate: "",
                    amount: totalAmount,
                    maintenance: totalMaintenance
                });

                // Set header data including table fields
                oLocal.setProperty("/pricePlan", pricePlanYears + "YP");
                oLocal.setProperty("/clientName", leadId || "N/A");
                oLocal.setProperty("/headerFields", [
                    { field: "Project", value: oLocal.getProperty("/projectDescription") || "N/A" },
                    { field: "Built Up Area", value: oLocal.getProperty("/builtUpArea") || "N/A" },
                    { field: "Unit Number", value: oLocal.getProperty("/unitId") || "N/A" },
                    { field: "Garden Area", value: oLocal.getProperty("/gardenArea") || "N/A" },
                    { field: "Unit Price", value: oLocal.getProperty("/unitPrice") || "N/A" },
                    { field: "Delivery Date", value: oLocal.getProperty("/deliveryDate") || "N/A" },
                    { field: "Maintenance", value: oLocal.getProperty("/maintenanceTotal") || "N/A" }
                ]);

                this._oSimulationDialog.getModel("simulationOutput").setData(simulationSchedule);
                oLocal.setProperty("/headerVisible", true);  // Show header and table

                const oTable = sap.ui.getCore().byId("simulationTablePPS");
                if (oTable && oTable.getBinding("items")) {
                    oTable.getBinding("items").refresh();
                }

                const simulationId = this._generateIdPPS();
                sap.ui.getCore().byId("simIdInput").setValue(simulationId);
                oLocal.setProperty("/simulationId", simulationId);

            } catch (err) {
                MessageBox.error("Simulation failed: " + (err.message || err));
            }
        },



        // Adapted from PaymentPlanSimulations: Save simulation
        onSaveSimulationPPS: async function () {
            const simulationId = sap.ui.getCore().byId("simIdInput").getValue();
            const oLocal = this._oSimulationDialog.getModel("local");
            const unitId = oLocal ? oLocal.getProperty("/unitId") : null;
            const projectId = sap.ui.getCore().byId("projectIdInputPPS").getValue();
            const paymentPlanId = sap.ui.getCore().byId("paymentPlanIdInputPPS").getValue();  // This is set in value help
            const pricePlanYears = parseInt(sap.ui.getCore().byId("pricePlanInputPPS").getValue());
            const leadId = sap.ui.getCore().byId("leadIdInputPPS").getValue();
            const finalPrice = Number(oLocal ? oLocal.getProperty("/finalPrice") : NaN);
            const userId = "currentUser";
            const fullSchedule = this._oSimulationDialog.getModel("simulationOutput").getData();

            // Exclude the "Total" row from the save payload (it's a summary, not a real schedule item)
            const schedule = (fullSchedule || []).filter(s => s.conditionType !== "Total");

            try {
                // Step 1: Save the simulation as a deep insert under the unit
                const payload = {
                    simulationId,
                    // Removed: unitId (handled by the composition association)
                    projectId,
                    paymentPlan_paymentPlanId: paymentPlanId,  // Link to payment plan
                    pricePlanYears,
                    leadId,
                    finalPrice,
                    userId,
                    schedule: schedule.map(s => ({
                        conditionType: s.conditionType,
                        dueDate: s.dueDate,
                        amount: s.amount,
                        maintenance: s.maintenance
                    }))
                };

                const res = await fetch(`/odata/v4/real-estate/Units('${unitId}')/simulations`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    const errorMessage = errorData.error?.message || "Unknown error";
                    throw new Error(errorMessage);
                }

                // Removed: Step 2 (no longer needed, as savedSimulationId is removed and multiple simulations are allowed)

                MessageToast.show("Simulation saved successfully!");
                this._oSimulationDialog.close();  // Close dialog after save
            } catch (err) {
                MessageBox.error("Error: " + (err.message || err));
            }
        },



        // Helper: Map frequency description to months per installment
        _getFrequencyIntervalPPS: function (frequencyDesc) {
            if (!frequencyDesc) return 12;  // Default to annual
            switch (frequencyDesc.toLowerCase()) {
                case "monthly":
                    return 1;
                case "quarterly":
                    return 3;
                case "semi-annual":
                    return 6;
                case "annual":
                    return 12;
                default:
                    return 12;  // Default
            }
        },

        // Helper: Generate simulation ID
        _generateIdPPS: function () {
            this._idCounter += 1;
            localStorage.setItem("simulationIdCounter", this._idCounter);
            const paddedNumber = ("00000" + this._idCounter).slice(-5);  // Pad to 5 digits
            return "PPS" + paddedNumber;
        },

        //#endregion

    });
});
