sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/ComboBox",
    "sap/ui/core/Item"
], function (Controller, MessageBox, Dialog, Input, Button, Label, VBox, JSONModel, ComboBox, Item) {
    "use strict";

    return Controller.extend("dboperations.controller.Projects", {
        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("Projects")
                .attachPatternMatched(this._onRouteMatched, this);

            var oModel = new sap.ui.model.json.JSONModel({
                Projects: [],
            });
            this.getView().setModel(oModel, "view");

            // For auto-generating projectId
            this._projectIdCounter = parseInt(localStorage.getItem("projectIdCounter")) || 0;

            // For auto-generating buildingId
            this._buildingIdCounter = parseInt(localStorage.getItem("buildingIdCounter")) || 0;

            // Fetch data from CAP OData service
            var oModel = new JSONModel();
            fetch("/odata/v4/real-estate/Projects")
                .then(response => response.json())
                .then(data => {
                    oModel.setData({ Projects: data.value });
                    this.getView().setModel(oModel, "projects");
                })
                .catch(err => {
                    console.error("Error fetching projects", err);
                    sap.m.MessageBox.error("Failed to load projects. Please check your connection and try again.");
                });

            // Set static company codes
            var oCompanyCodesModel = new sap.ui.model.json.JSONModel({
                companyCodesList: [
                    { companyCodeId: "1000", companyCodeDescription: "SOLEX" }
                ]
            });
            this.getView().setModel(oCompanyCodesModel, "companyCodes");
        },

        _onRouteMatched: function () {
            this._loadProjects();
        },

        _loadProjects: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            fetch("/odata/v4/real-estate/Projects")
                .then(response => response.json())
                .then(data => {
                    oModel.setData({ Projects: data.value });
                    this.getView().setModel(oModel, "projects");
                })
                .catch(err => {
                    console.error("Error fetching projects", err);
                    sap.m.MessageBox.error("Failed to load projects. Please check your connection and try again.");
                });
        },



        onNavigateToAddProject: function () {
            // If dialog is not yet created, create it once
            if (!this._oAddDialog) {
                var oNewProjectModel = new sap.ui.model.json.JSONModel({
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
                    supplementaryText: ""
                });

                this._oAddDialog = new sap.m.Dialog({
                    title: "Add New Project",
                    content: new sap.ui.layout.form.SimpleForm({
                        editable: true,
                        content: [
                            new sap.m.Label({ text: "Description", required: true }),
                            new sap.m.Input("projectDescInput", {
                                value: "{/projectDescription}",
                                tooltip: "Up to 60 characters"
                            }),

                            new sap.m.Label({ text: "Company Code", required: true }),
                            new sap.m.ComboBox("companyCodeComboBox", {
                                selectedKey: "{/companyCodeId}",
                                selectionChange: function (oEvent) {
                                    var oSelectedItem = oEvent.getParameter("selectedItem");
                                    if (oSelectedItem) {
                                        this._oAddDialog.getModel().setProperty("/companyCodeDescription", "SOLEX");
                                    }
                                }.bind(this),
                                items: {
                                    path: "companyCodes>/companyCodesList",
                                    template: new sap.ui.core.Item({
                                        key: "{companyCodes>companyCodeId}",
                                        text: "{companyCodes>companyCodeId} - {companyCodes>companyCodeDescription}"
                                    })
                                }
                            }),

                            new sap.m.Label({ text: "Company Code Description", required: true }),
                            new sap.m.Input("companyCodeDescInput", {
                                value: "{/companyCodeDescription}",
                                editable: false,
                                tooltip: "Auto-populated from Company Code selection"
                            }),

                            new sap.m.Label({ text: "Valid From", required: true }),
                            new sap.m.DatePicker("validFromInput", {
                                value: "{/validFrom}",
                                displayFormat: "long",
                                valueFormat: "yyyy-MM-dd",
                                placeholder: "Select a date"
                            }),

                            new sap.m.Label({ text: "Valid To", required: true }),
                            new sap.m.DatePicker("validToInput", {
                                value: "{/validTo}",
                                displayFormat: "long",
                                valueFormat: "yyyy-MM-dd",
                                placeholder: "Select a date"
                            }),

                            new sap.m.Label({ text: "Location", required: true }),
                            new sap.m.Input("locationInput", {
                                value: "{/location}",
                                tooltip: "Up to 40 characters"
                            }),

                            new sap.m.Label({ text: "Business Area", required: true }),
                            new sap.m.Input("businessAreaInput", { value: "{/businessArea}" }),

                            new sap.m.Label({ text: "Profit Center", required: true }),
                            new sap.m.Input("profitCenterInput", { value: "{/profitCenter}" }),

                            new sap.m.Label({ text: "Functional Area", required: true }),
                            new sap.m.Input("functionalAreaInput", { value: "{/functionalArea}" }),

                            new sap.m.Label({ text: "Supplementary Text", required: true }),
                            new sap.m.Input("supplementaryTextInput", { value: "{/supplementaryText}" })
                        ]
                    }),

                    beginButton: new sap.m.Button({
                        text: "Save",
                        type: "Emphasized",
                        press: function () {
                            var oData = this._oAddDialog.getModel().getData();

                            // 🧩 Required field validation
                            var aRequiredFields = [
                                { id: "projectDescInput", name: "Description" },
                                { id: "companyCodeComboBox", name: "Company Code" },
                                { id: "companyCodeDescInput", name: "Company Code Description" },
                                { id: "validFromInput", name: "Valid From" },
                                { id: "validToInput", name: "Valid To" },
                                { id: "locationInput", name: "Location" },
                                { id: "businessAreaInput", name: "Business Area" },
                                { id: "profitCenterInput", name: "Profit Center" },
                                { id: "functionalAreaInput", name: "Functional Area" },
                                { id: "supplementaryTextInput", name: "Supplementary Text" },

                            ];

                            var bValid = true;
                            aRequiredFields.forEach(function (field) {
                                var oControl = sap.ui.getCore().byId(field.id);
                                if (!oControl.getValue()) {
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

                            // 🧠 Date validation
                            var oValidFrom = sap.ui.getCore().byId("validFromInput").getDateValue();
                            var oValidTo = sap.ui.getCore().byId("validToInput").getDateValue();

                            if (oValidFrom && oValidTo && oValidTo < oValidFrom) {
                                sap.ui.getCore().byId("validToInput").setValueState("Error");
                                sap.ui.getCore().byId("validToInput").setValueStateText("'Valid To' must be later than 'Valid From'");
                                sap.m.MessageBox.error("'Valid To' date must be later than 'Valid From' date.");
                                return;
                            } else {
                                sap.ui.getCore().byId("validToInput").setValueState("None");
                            }

                            // ✅ Proceed with POST request
                            fetch("/odata/v4/real-estate/Projects", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(oData)
                            })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error("Failed to create project");
                                    }
                                    return response.json();
                                })
                                .then(() => {
                                    sap.m.MessageToast.show("Project created!");
                                    this._loadProjects();

                                    // 🧹 Reset form after save
                                    this._resetAddDialogFields();

                                    this._oAddDialog.close();
                                    // 🧹 Destroy dialog after close
                                    this._oAddDialog.destroy();
                                    this._oAddDialog = null;
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
                            // 🧹 Destroy dialog after close
                            this._oAddDialog.destroy();
                            this._oAddDialog = null;
                        }.bind(this)
                    })
                });

                this._oAddDialog.setModel(oNewProjectModel);
                this.getView().addDependent(this._oAddDialog);
            }

            // 🧼 Reset data every time dialog opens
            this._resetAddDialogFields();

            // Generate auto projectId
            this._projectIdCounter++;
            localStorage.setItem("projectIdCounter", this._projectIdCounter);
            var sProjectId = "PRJ" + String(this._projectIdCounter).padStart(3, '0');
            this._oAddDialog.getModel().setProperty("/projectId", sProjectId);

            this._oAddDialog.open();
        },

        // 🧹 Helper function to reset dialog data and value states
        _resetAddDialogFields: function () {
            var oModel = this._oAddDialog.getModel();
            oModel.setData({
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
                supplementaryText: ""
            });

            // Reset value states for validation
            [
                "projectIdInput", "projectDescInput", "companyCodeInput", "companyCodeDescInput",
                "validFromInput", "validToInput", "locationInput"
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
                ProjectId: oData.projectId,
                Description: oData.projectDescription,
                CompanyCode: oData.companyCodeId,
                companyCodeDescription: oData.companyCodeDescription,
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
                    title: "Project Details",
                    contentWidth: "100%",
                    resizable: true,
                    draggable: true,
                    content: [
                        new sap.m.IconTabBar({
                            expandable: true,
                            items: [
                                // 🔹 Tab 1: Project General Data
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
                                                new sap.m.Label({ text: "Company Code ID" }),
                                                new sap.m.Text({ text: "{/CompanyCode}" }),

                                                new sap.m.Label({ text: "Company Code Description" }),
                                                new sap.m.Text({ text: "{/companyCodeDescription}" }),

                                                new sap.m.Label({ text: "Project ID" }),
                                                new sap.m.Text({ text: "{/ProjectId}" }),

                                                new sap.m.Label({ text: "Project Description" }),
                                                new sap.m.Text({ text: "{/Description}" }),

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
                            // 🧹 Destroy dialog after close
                            this._oDetailsDialog.destroy();
                            this._oDetailsDialog = null;
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
                var oModel = this.getView().getModel("projects");
                var oItem = oModel.getProperty(sPath);

                if (!oItem) {
                    sap.m.MessageBox.error("Could not find model data for deletion.");
                    return;
                }

                MessageBox.confirm("Are you sure you want to delete " + oItem.projectId + "?", {
                    title: "Confirm Deletion",
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            fetch(`/odata/v4/real-estate/Projects(projectId='${oItem.projectId}')`, {
                                method: "DELETE"
                            })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error("Failed to delete: " + response.statusText);
                                    }

                                    var aRecords = oModel.getProperty("/Projects");
                                    var iIndex = aRecords.findIndex(st => st.projectId === oItem.projectId);
                                    if (iIndex > -1) {
                                        aRecords.splice(iIndex, 1);
                                        oModel.setProperty("/Projects", aRecords);
                                    }

                                    sap.m.MessageToast.show("Project deleted successfully!");
                                })
                                .catch(err => {
                                    console.error("Error deleting Project:", err);
                                    sap.m.MessageBox.error("Error: " + err.message);
                                });
                        }
                    }
                });
            }
        }
        ,
        onEditProject: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            if (!oBindingContext) return;

            var oData = oBindingContext.getObject();
            var oDialogModel = new sap.ui.model.json.JSONModel(Object.assign({}, oData));

            if (!this._oEditDialog) {
                this._oEditDialog = new sap.m.Dialog({
                    title: "Edit Project",
                    content: new sap.ui.layout.form.SimpleForm({
                        editable: true,
                        content: [
                            new sap.m.Label({ text: "Project ID" }),
                            new sap.m.Input({ value: "{/projectId}", editable: false }),

                            new sap.m.Label({ text: "Description", required: true }),
                            new sap.m.Input("editProjectDescInput", { value: "{/projectDescription}" }),

                            new sap.m.Label({ text: "Company Code", required: true }),
                            new sap.m.ComboBox("editCompanyCodeComboBox", {
                                selectedKey: "{/companyCodeId}",
                                selectionChange: function (oEvent) {
                                    var oSelectedItem = oEvent.getParameter("selectedItem");
                                    if (oSelectedItem) {
                                        this._oEditDialog.getModel().setProperty("/companyCodeDescription", "SOLEX");
                                    }
                                }.bind(this),
                                items: {
                                    path: "companyCodes>/companyCodesList",
                                    template: new sap.ui.core.Item({
                                        key: "{companyCodes>companyCodeId}",
                                        text: "{companyCodes>companyCodeId} - {companyCodes>companyCodeDescription}"
                                    })
                                }
                            }),

                            new sap.m.Label({ text: "Company Code Description", required: true }),
                            new sap.m.Input("editCompanyCodeDescInput", {
                                value: "{/companyCodeDescription}",
                                editable: false,
                                tooltip: "Auto-populated from Company Code selection"
                            }),

                            new sap.m.Label({ text: "Valid From", required: true }),
                            new sap.m.DatePicker("editValidFromInput", {
                                value: "{/validFrom}",
                                displayFormat: "long",
                                valueFormat: "yyyy-MM-dd",
                                placeholder: "Select a date"
                            }),

                            new sap.m.Label({ text: "Valid To", required: true }),
                            new sap.m.DatePicker("editValidToInput", {
                                value: "{/validTo}",
                                displayFormat: "long",
                                valueFormat: "yyyy-MM-dd",
                                placeholder: "Select a date"
                            }),

                            new sap.m.Label({ text: "Location", required: true }),
                            new sap.m.Input("editLocationInput", { value: "{/location}" }),

                            new sap.m.Label({ text: "Business Area", required: true }),
                            new sap.m.Input("editBusinessAreaInput", { value: "{/businessArea}" }),

                            new sap.m.Label({ text: "Profit Center", required: true }),
                            new sap.m.Input("editProfitCenterInput", { value: "{/profitCenter}" }),

                            new sap.m.Label({ text: "Functional Area", required: true }),
                            new sap.m.Input("editFunctionalAreaInput", { value: "{/functionalArea}" }),

                            new sap.m.Label({ text: "Supplementary Text", required: true }),
                            new sap.m.Input("editSupplementaryTextInput", { value: "{/supplementaryText}" })
                        ]
                    }),

                    beginButton: new sap.m.Button({
                        text: "Save",
                        type: "Emphasized",
                        press: function () {
                            var oUpdatedData = this._oEditDialog.getModel().getData();

                                                        // 🧩 Validate required fields
                            var aRequiredFields = [
                                { id: "editProjectDescInput", name: "Description" },
                                { id: "editCompanyCodeComboBox", name: "Company Code" },
                                { id: "editCompanyCodeDescInput", name: "Company Code Description" },
                                { id: "editValidFromInput", name: "Valid From" },
                                { id: "editValidToInput", name: "Valid To" },
                                { id: "editLocationInput", name: "Location" },
                                { id: "editBusinessAreaInput", name: "Business Area" },
                                { id: "editProfitCenterInput", name: "Profit Center" },
                                { id: "editFunctionalAreaInput", name: "Functional Area" },
                                { id: "editSupplementaryTextInput", name: "Supplementary Text" }
                            ];

                            var bValid = true;
                            aRequiredFields.forEach(function (field) {
                                var oControl = sap.ui.getCore().byId(field.id);
                                if (!oControl.getValue()) {
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

                            // 🧠 Date validation
                            var oValidFrom = sap.ui.getCore().byId("editValidFromInput").getDateValue();
                            var oValidTo = sap.ui.getCore().byId("editValidToInput").getDateValue();

                            if (oValidFrom && oValidTo && oValidTo < oValidFrom) {
                                sap.ui.getCore().byId("editValidToInput").setValueState("Error");
                                sap.ui.getCore().byId("editValidToInput").setValueStateText("'Valid To' must be later than 'Valid From'");
                                sap.m.MessageBox.error("'Valid To' date must be later than 'Valid From' date.");
                                return;
                            } else {
                                sap.ui.getCore().byId("editValidToInput").setValueState("None");
                            }

                            // 🟢 Proceed with PATCH request
                            fetch(`/odata/v4/real-estate/Projects(projectId='${oUpdatedData.projectId}')`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(oUpdatedData)
                            })
                                .then(response => {
                                    if (!response.ok) throw new Error("Update failed");
                                    return response.json();
                                })
                                .then(() => {
                                    sap.m.MessageToast.show("Project updated successfully!");
                                    this._loadProjects();
                                    this._oEditDialog.close();
                                    // 🧹 Destroy dialog after close
                                    this._oEditDialog.destroy();
                                    this._oEditDialog = null;
                                })
                                .catch(err => sap.m.MessageBox.error("Error: " + err.message));
                        }.bind(this)
                    }),

                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            this._oEditDialog.close();
                            // 🧹 Destroy dialog after close
                            this._oEditDialog.destroy();
                            this._oEditDialog = null;
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oEditDialog);
                this._oEditDialog.setModel(this.getView().getModel("companyCodes"), "companyCodes");
            }

            this._oEditDialog.setModel(oDialogModel);
            this._oEditDialog.open();
        },

        onAddBuilding: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                sap.m.MessageToast.show("No project selected.");
                return;
            }

            var oProject = oContext.getObject();

            // ✅ Prefill Building model with values from Project, including Business Area, Profit Center, Functional Area
            var oNewBuildingModel = new sap.ui.model.json.JSONModel({
                buildingId: "",
                buildingDescription: "",
                buildingOldCode: "",
                location: oProject.location || "", // 🧩 Copy location from Project
                validFrom: "",
                validTo: "",
                companyCodeId: oProject.companyCodeId,
                companyCodeDescription: oProject.companyCodeDescription, // 🧩 Copy company description
                projectId: oProject.projectId,
                projectDescription: oProject.projectDescription,
                businessArea: oProject.businessArea || "", // 🔹 Set from Project
                profitCenter: oProject.profitCenter || "", // 🔹 Set from Project
                functionalArea: oProject.functionalArea || "" // 🔹 Set from Project
            });

            if (!this._oAddBuildingDialog) {
                this._oAddBuildingDialog = new sap.m.Dialog({
                    title: "Add Building for " + oProject.projectDescription,
                    contentWidth: "600px",
                    content: new sap.ui.layout.form.SimpleForm({
                        editable: true,
                        content: [
                            new sap.m.Label({ text: "Building Description", required: true }),
                            new sap.m.Input("buildingDescInput", { value: "{/buildingDescription}" }),

                            new sap.m.Label({ text: "Old Building Code" }),
                            new sap.m.Input({ value: "{/buildingOldCode}" }),

                            new sap.m.Label({ text: "Location", required: true }),
                            new sap.m.Input("buildingLocationInput", { value: "{/location}" }),

                            new sap.m.Label({ text: "Valid From", required: true }),
                            new sap.m.DatePicker("buildingValidFromInput", {
                                value: "{/validFrom}",
                                displayFormat: "long",
                                valueFormat: "yyyy-MM-dd",
                                placeholder: "Select date",
                                showClearIcon: true
                            }),

                            new sap.m.Label({ text: "Valid To", required: true }),
                            new sap.m.DatePicker("buildingValidToInput", {
                                value: "{/validTo}",
                                displayFormat: "long",
                                valueFormat: "yyyy-MM-dd",
                                placeholder: "Select date",
                                showClearIcon: true
                            }),

                            new sap.m.Label({ text: "Company Code ID" }),
                            new sap.m.Text({ text: "{/companyCodeId}" }),

                            new sap.m.Label({ text: "Company Code Description" }), // 🧩 Added
                            new sap.m.Text({ text: "{/companyCodeDescription}" }),

                            new sap.m.Label({ text: "Project ID" }),
                            new sap.m.Text({ text: "{/projectId}" }),

                            new sap.m.Label({ text: "Project Description" }), // 🧩 Added
                            new sap.m.Text({ text: "{/projectDescription}" }),

                            new sap.m.Label({ text: "Business Area", required: true }),
                            new sap.m.Input("businessAreaInput", { value: "{/businessArea}" }),

                            new sap.m.Label({ text: "Profit Center", required: true }),
                            new sap.m.Input("profitCenterInput", { value: "{/profitCenter}" }),

                            new sap.m.Label({ text: "Functional Area", required: true }),
                            new sap.m.Input("functionalAreaInput", { value: "{/functionalArea}" })
                        ]
                    }),

                    beginButton: new sap.m.Button({
                        text: "Save",
                        type: "Emphasized",
                        press: function () {
                            var oData = this._oAddBuildingDialog.getModel().getData();

                            // 🔹 Required field validation
                            var aRequiredFields = [
                                { id: "buildingDescInput", name: "Building Description" },
                                { id: "buildingLocationInput", name: "Location" },
                                { id: "buildingValidFromInput", name: "Valid From" },
                                { id: "buildingValidToInput", name: "Valid To" },
                                { id: "businessAreaInput", name: "Business Area" },
                                { id: "profitCenterInput", name: "Profit Center" },
                                { id: "functionalAreaInput", name: "Functional Area" }
                            ];

                            var bValid = true;
                            aRequiredFields.forEach(function (field) {
                                var oControl = sap.ui.getCore().byId(field.id);
                                if (!oControl.getValue()) {
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

                            // 🔹 Date validation
                            var projectFrom = new Date(oProject.validFrom);
                            var projectTo = new Date(oProject.validTo);
                            var buildingFrom = sap.ui.getCore().byId("buildingValidFromInput").getDateValue();
                            var buildingTo = sap.ui.getCore().byId("buildingValidToInput").getDateValue();

                            if (buildingFrom > buildingTo) {
                                sap.ui.getCore().byId("buildingValidToInput").setValueState("Error");
                                sap.ui.getCore().byId("buildingValidToInput").setValueStateText("'Valid To' must be later than 'Valid From'");
                                sap.m.MessageBox.error("Building 'Valid From' cannot be after 'Valid To'.");
                                return;
                            }

                            if (buildingFrom < projectFrom) {
                                sap.m.MessageBox.error(
                                    "Building 'Valid From' must be on or after the Project 'Valid From' (" + oProject.validFrom + ")."
                                );
                                return;
                            }

                            if (buildingTo > projectTo) {
                                sap.m.MessageBox.error(
                                    "Building 'Valid To' must be on or before the Project 'Valid To' (" + oProject.validTo + ")."
                                );
                                return;
                            }

                            // ✅ Save to backend
                            fetch("/odata/v4/real-estate/Buildings", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(oData)
                            })
                                .then(response => {
                                    if (!response.ok) throw new Error("Failed to create building");
                                    return response.json();
                                })
                                .then(() => {
                                    sap.m.MessageToast.show("Building added successfully!");
                                    this._oAddBuildingDialog.close();
                                    // 🧹 Destroy the dialog after closing to clean up the form
                                    this._oAddBuildingDialog.destroy();
                                    this._oAddBuildingDialog = null;
                                })
                                .catch(err => {
                                    sap.m.MessageBox.error("Error: " + err.message);
                                });
                        }.bind(this)
                    }),

                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            this._oAddBuildingDialog.close();
                            // 🧹 Destroy the dialog after closing to clean up the form
                            this._oAddBuildingDialog.destroy();
                            this._oAddBuildingDialog = null;
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oAddBuildingDialog);
            }

            this._oAddBuildingDialog.setModel(oNewBuildingModel);

            // Generate auto buildingId
            this._buildingIdCounter++;
            localStorage.setItem("buildingIdCounter", this._buildingIdCounter);
            var sBuildingId = "B00" + String(this._buildingIdCounter);
            this._oAddBuildingDialog.getModel().setProperty("/buildingId", sBuildingId);

            this._oAddBuildingDialog.open();
        }
    });
});
