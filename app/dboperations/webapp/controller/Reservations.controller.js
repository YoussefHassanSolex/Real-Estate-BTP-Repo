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
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, Dialog, Input, Button, Label, ComboBox, DatePicker, TextArea, JSONModel) {
    "use strict";

    return Controller.extend("dboperations.controller.Reservations", {
        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("Reservations")
                .attachPatternMatched(this._onRouteMatched, this);
            var oModel = new JSONModel({ Reservations: [] });
            this.getView().setModel(oModel);  // Default model (no name)

            this._oPaymentPlansModel = new JSONModel([]);
            this.getView().setModel(this._oPaymentPlansModel, "paymentPlans");

            this._loadPaymentPlans();
            this._loadReservations();
        },

        _onRouteMatched: function () {
            this._loadReservations();
        },

        _loadReservations: function () {
            var oModel = this.getView().getModel();
            // Add $expand for compositions (partners, conditions, payments) along with associations
            fetch("/odata/v4/real-estate/Reservations?$expand=project,building,unit,paymentPlan,partners,conditions,payments")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.value) {
                        oModel.setData({ Reservations: data.value });
                        this.getView().byId("reservationsTable").setModel(oModel);
                    } else {
                        console.warn("No 'value' array in response:", data);
                        oModel.setData({ Reservations: [] });
                        this.getView().byId("reservationsTable").setModel(oModel);
                    }
                })
                .catch(err => {
                    console.error("Error fetching reservations:", err);
                    sap.m.MessageBox.error("Failed to load reservations: " + err.message);
                });
        },




        _loadProjectsForCombo: function () {
            fetch("/odata/v4/real-estate/Projects")
                .then(response => response.json())
                .then(data => {
                    var oModel = this._oAddDialog.getModel();
                    oModel.setProperty("/projects", data.value.map(p => ({ key: p.projectId, text: p.projectDescription })));
                });
        },
        _loadBuildingsForCombo: function () {
            fetch("/odata/v4/real-estate/Buildings")
                .then(response => response.json())
                .then(data => {
                    var oModel = this._oAddDialog.getModel();
                    oModel.setProperty("/buildings", data.value.map(b => ({ key: b.buildingId, text: b.buildingDescription })));
                });
        },
        _loadUnitsForCombo: function () {
            fetch("/odata/v4/real-estate/Units")
                .then(response => response.json())
                .then(data => {
                    var oModel = this._oAddDialog.getModel();
                    oModel.setProperty("/units", data.value.map(u => ({ key: u.unitId, text: u.unitDescription })));
                });
        },
        _loadPaymentPlansForCombo: function () {
            fetch("/odata/v4/real-estate/PaymentPlans")
                .then(response => response.json())
                .then(data => {
                    var oModel = this._oAddDialog.getModel();
                    oModel.setProperty("/paymentPlans", data.value.map(p => ({ key: p.paymentPlanId, text: p.description })));
                });
        },

        _loadPaymentPlans: function () {
            fetch("/odata/v4/real-estate/PaymentPlans")
                .then(response => response.json())
                .then(data => {
                    this._oPaymentPlansModel.setData(data.value);
                })
                .catch(err => console.error("Error loading payment plans:", err));
        },

        _populateAvailableYears: function (oDialogModel) {
            var aPaymentPlans = this._oPaymentPlansModel.getData();
            var aAvailableYears = [];
            aPaymentPlans.forEach(function (oPlan) {
                if (oPlan.planYears && oPlan.planYears > 0) {
                    aAvailableYears.push({ key: oPlan.planYears, text: oPlan.planYears + " Years" });
                }
            });
            oDialogModel.setProperty("/availableYears", aAvailableYears);
        },

        onPricePlanYearsChange: function (oEvent) {
            var sSelectedYears = oEvent.getParameter("selectedItem").getKey();
            var oDialogModel = this._oEditDialog.getModel();
            oDialogModel.setProperty("/pricePlanYears", parseInt(sSelectedYears));
            this._resolveSimulations(oDialogModel);
        },

        _resolveSimulations: function (oDialogModel) {
            var sUnitId = oDialogModel.getProperty("/unit_unitId");
            var iPricePlanYears = oDialogModel.getProperty("/pricePlanYears");
            if (sUnitId && iPricePlanYears) {
                fetch(`/odata/v4/real-estate/Units(unitId='${sUnitId}')?$expand=simulations`)
                    .then(response => response.json())
                    .then(data => {
                        var aSimulations = data.simulations || [];
                        var aFilteredSimulations = aSimulations.filter(function (oSim) {
                            return oSim.years === iPricePlanYears;
                        });
                        oDialogModel.setProperty("/simulations", aFilteredSimulations);
                        // Set Payment Plan ID and Unit Price from the first matching simulation
                        if (aFilteredSimulations.length > 0) {
                            var oSelectedSim = aFilteredSimulations[0];
                            oDialogModel.setProperty("/paymentPlan_paymentPlanId", oSelectedSim.paymentPlan_paymentPlanId || "");
                            oDialogModel.setProperty("/unitPrice", oSelectedSim.finalPrice || 0);
                            this._loadConditionsFromSimulation(oSelectedSim.simulationId, oDialogModel);
                        }
                    })
                    .catch(err => console.error("Error resolving simulations:", err));
            }
        },

        _simulateConditions: function (oDialogModel) {
            var aSimulations = oDialogModel.getProperty("/simulations") || [];
            var aConditions = [];
            var iTotalAmount = 0;
            aSimulations.forEach(function (oSim, index) {
                var sInstallmentType = "";
                if (oSim.conditionType === "ZZ03") {
                    sInstallmentType = "Maintenance";
                } else if (oSim.conditionType === "ZZ01") {
                    sInstallmentType = "Down Payment";
                } else {
                    sInstallmentType = "Installement";
                }
                aConditions.push({
                    ID: this._generateUUID(),
                    installment: sInstallmentType,
                    dueDate: oSim.dueDate || "",
                    amount: typeof oSim.amount === 'number' ? (oSim.amount || 0).toLocaleString('en-US') : (typeof oSim.amount === 'string' && !oSim.amount.includes(',') ? parseFloat((oSim.amount || '0').replace(/,/g, '')) : (oSim.amount || 0)).toLocaleString('en-US'),
                    maintenance: typeof oSim.maintenance === 'number' ? (oSim.maintenance || 0).toLocaleString('en-US') : (typeof oSim.maintenance === 'string' && !oSim.maintenance.includes(',') ? parseFloat((oSim.maintenance || '0').replace(/,/g, '')) : (oSim.maintenance || 0)).toLocaleString('en-US')
                });
                iTotalAmount += oSim.amount || 0;
            }.bind(this));
            oDialogModel.setProperty("/conditions", aConditions);
            oDialogModel.setProperty("/unitPrice", iTotalAmount);
        },

        _loadConditionsFromSimulation: async function (sSimulationId, oDialogModel) {
            if (!sSimulationId) {
                return;
            }

            const res = await fetch(
                `/odata/v4/real-estate/PaymentPlanSimulations(simulationId='${sSimulationId}')?$expand=schedule`
            );

            if (!res.ok) {
                sap.m.MessageBox.error("Failed to load simulation conditions");
                return;
            }

            const simulation = await res.json();

            const aConditions = (simulation.schedule || [])
                .filter(s => s.conditionType !== "Total")
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map((s, index) => ({
                    ID: this._generateUUID(),
                    installment: s.conditionType,
                    conditionType: s.conditionType,
                    dueDate: s.dueDate,
                    amount: typeof s.amount === 'number' ? s.amount.toLocaleString('en-US') : (typeof s.amount === 'string' && !s.amount.includes(',') ? parseFloat(s.amount.replace(/,/g, '')) : s.amount).toLocaleString('en-US'),
                    maintenance: typeof s.maintenance === 'number' ? s.maintenance.toLocaleString('en-US') : (typeof s.maintenance === 'string' && !s.maintenance.includes(',') ? parseFloat(s.maintenance.replace(/,/g, '')) : s.maintenance).toLocaleString('en-US')
                }));

            oDialogModel.setProperty("/conditions", aConditions);
        },

        onDetails: function (oEvent) {
            var oData = oEvent.getSource().getBindingContext().getObject();
            // Ensure installment is set based on conditionType for consistency
            if (oData.conditions) {
                oData.conditions.forEach(condition => {
                    // Derive a human-readable installment label from either an existing label
                    // or from known conditionType codes. Keep fallback to the raw value.
                    condition.installment = condition.installment || (condition.conditionType === 'ZZ01' ? 'Down Payment' : (condition.conditionType === 'ZZ03' ? 'Maintenance' : (condition.conditionType === 'Maintenance' ? '' : (condition.conditionType || 'Installment'))));

                    // Normalize conditionType to a description for display in the details dialog
                    if (condition.conditionType === 'ZZ01') {
                        condition.conditionType = 'Down Payment';
                    } else if (condition.conditionType === 'ZZ03') {
                        condition.conditionType = 'Maintenance';
                    }

                    // Format numbers with comma separators - handle both numbers and strings
                    if (typeof condition.amount === 'number') {
                        condition.amount = condition.amount.toLocaleString('en-US');
                    } else if (typeof condition.amount === 'string' && !condition.amount.includes(',')) {
                        const numValue = parseFloat(condition.amount.replace(/,/g, ''));
                        if (!isNaN(numValue)) {
                            condition.amount = numValue.toLocaleString('en-US');
                        }
                    }
                    if (typeof condition.maintenance === 'number') {
                        condition.maintenance = condition.maintenance.toLocaleString('en-US');
                    } else if (typeof condition.maintenance === 'string' && !condition.maintenance.includes(',')) {
                        const numValue = parseFloat(condition.maintenance.replace(/,/g, ''));
                        if (!isNaN(numValue)) {
                            condition.maintenance = numValue.toLocaleString('en-US');
                        }
                    }
                });
            }
            var oDialogModel = new JSONModel(oData);

            if (!this._oDetailsDialog) {
                this._oDetailsDialog = new Dialog({
                    title: "Reservation Details",
                    contentWidth: "100%",
                    resizable: true,
                    content: new sap.m.IconTabBar({
                        expandable: true,
                        items: [
                            new sap.m.IconTabFilter({
                                text: "General",
                                content: new sap.ui.layout.form.SimpleForm({
                                    editable: false,
                                    layout: "ResponsiveGridLayout",
                                    labelSpanL: 3,
                                    columnsL: 2,
                                    content: [
                                        new Label({ text: "Reservation ID" }), new sap.m.Text({ text: "{/reservationId}" }),
                                        new Label({ text: "Company Code ID" }), new sap.m.Text({ text: "{/companyCodeId}" }),
                                        new Label({ text: "Old Reservation ID" }), new sap.m.Text({ text: "{/oldReservationId}" }),
                                        new Label({ text: "EOI ID" }), new sap.m.Text({ text: "{/eoiId}" }),
                                        new Label({ text: "Sales Type" }), new sap.m.Text({ text: "{/salesType}" }),
                                        new Label({ text: "Reservation Type" }), new sap.m.Text({ text: "{/reservationType}" }),
                                        new Label({ text: "Description" }), new sap.m.Text({ text: "{/description}" }),
                                        new Label({ text: "Valid From" }), new sap.m.Text({ text: "{/validFrom}" }),
                                        new Label({ text: "Status" }), new sap.m.Text({ text: "{/status}" }),
                                        new Label({ text: "Customer Type" }), new sap.m.Text({ text: "{/customerType}" }),
                                        new Label({ text: "Currency" }), new sap.m.Text({ text: "{/currency}" }),
                                        new Label({ text: "After Sales" }), new sap.m.Text({ text: "{/afterSales}" }),
                                        new Label({ text: "Project" }), new sap.m.Text({ text: "{/project/projectDescription}" }),
                                        new Label({ text: "Project ID" }), new sap.m.Text({ text: "{/project_projectId}" }),
                                        new Label({ text: "Building" }), new sap.m.Text({ text: "{/building/buildingDescription}" }),
                                        new Label({ text: "Building ID" }), new sap.m.Text({ text: "{/building_buildingId}" }),
                                        new Label({ text: "Unit" }), new sap.m.Text({ text: "{/unit/unitDescription}" }),
                                        new Label({ text: "Unit ID" }), new sap.m.Text({ text: "{/unit_unitId}" }),
                                        new Label({ text: "Unit Type" }), new sap.m.Text({ text: "{/unitType}" }),
                                        new Label({ text: "BUA" }), new sap.m.Text({ text: "{/bua}" }),
                                        new Label({ text: "Phase" }), new sap.m.Text({ text: "{/phase}" }),
                                        new Label({ text: "Price Plan Years" }), new sap.m.Text({ text: "{/pricePlanYears}" }),
                                        new Label({ text: "Payment Plan ID" }), new sap.m.Text({ text: "{/paymentPlan_paymentPlanId}" }),
                                        new Label({ text: "Unit Price" }), new sap.m.Text({ text: "{/unitPrice}" }),
                                        // new Label({ text: "Plan Currency" }), new sap.m.Text({ text: "{/planCurrency}" }),
                                        new Label({ text: "Request Type" }), new sap.m.Text({ text: "{/requestType}" }),
                                        new Label({ text: "Reason" }), new sap.m.Text({ text: "{/reason}" }),
                                        new Label({ text: "Cancellation Date" }), new sap.m.Text({ text: "{/cancellationDate}" }),
                                        new Label({ text: "Cancellation Status" }), new sap.m.Text({ text: "{/cancellationStatus}" }),
                                        new Label({ text: "Rejection Reason" }), new sap.m.Text({ text: "{/rejectionReason}" }),
                                        new Label({ text: "Cancellation Fees" }), new sap.m.Text({ text: "{/cancellationFees}" })
                                    ]
                                })
                            }),
                            new sap.m.IconTabFilter({
                                text: "Partners",
                                content: new sap.m.Table({
                                    columns: [
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Customer Code" }), width: "15%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Customer Name" }), width: "20%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Customer Address" }), width: "30%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Valid From" }), width: "15%" })
                                    ]
                                }).bindItems({
                                    path: "/partners",
                                    template: new sap.m.ColumnListItem({
                                        cells: [
                                            new sap.m.Text({ text: "{customerCode}" }),
                                            new sap.m.Text({ text: "{customerName}" }),
                                            new sap.m.Text({ text: "{customerAddress}" }),
                                            new sap.m.Text({ text: "{validFrom}" })
                                        ]
                                    })
                                })
                            }),
                            new sap.m.IconTabFilter({
                                text: "Conditions",
                                content: new sap.m.Table({
                                    columns: [
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Installment" }), width: "20%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Due Date" }), width: "20%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Amount" }), width: "20%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Maintenance" }), width: "20%" })
                                    ]
                                }).bindItems({
                                    path: "/conditions",
                                    template: new sap.m.ColumnListItem({
                                        cells: [
                                            new sap.m.Text({ text: "{installment}" }),
                                            new sap.m.Text({ text: "{dueDate}" }),
                                            new sap.m.Text({ text: "{amount}" }),
                                            new sap.m.Text({ text: "{maintenance}" })
                                        ]
                                    })
                                })
                            }),
                            new sap.m.IconTabFilter({
                                text: "Payments",
                                content: new sap.m.Table({
                                    columns: [
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Receipt Type" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Receipt Status" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Payment Method" }), width: "12%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Amount" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "House Bank" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Bank Account" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Due Date" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Transfer Number" }), width: "12%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Check Number" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Customer Bank" }), width: "12%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Customer Bank Account" }), width: "15%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Branch" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Collected Amount" }), width: "12%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "AR Validated" }), width: "10%" }),
                                        new sap.m.Column({ header: new sap.m.Text({ text: "Rejection Reason" }), width: "15%" })
                                    ]
                                }).bindItems({
                                    path: "/payments",
                                    template: new sap.m.ColumnListItem({
                                        cells: [
                                            new sap.m.Text({ text: "{receiptType}" }),
                                            new sap.m.Text({ text: "{receiptStatus}" }),
                                            new sap.m.Text({ text: "{paymentMethod}" }),
                                            new sap.m.Text({ text: "{amount}" }),
                                            new sap.m.Text({ text: "{houseBank}" }),
                                            new sap.m.Text({ text: "{bankAccount}" }),
                                            new sap.m.Text({ text: "{dueDate}" }),
                                            new sap.m.Text({ text: "{transferNumber}" }),
                                            new sap.m.Text({ text: "{checkNumber}" }),
                                            new sap.m.Text({ text: "{customerBank}" }),
                                            new sap.m.Text({ text: "{customerBankAccount}" }),
                                            new sap.m.Text({ text: "{branch}" }),
                                            new sap.m.Text({ text: "{collectedAmount}" }),
                                            new sap.m.CheckBox({ selected: "{arValidated}", editable: false }),
                                            new sap.m.Text({ text: "{rejectionReason}" })
                                        ]
                                    })
                                })
                            })
                        ]
                    }),
                    endButton: new Button({
                        text: "Close",
                        press: function () {
                            this._oDetailsDialog.close();
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
_mergeConditionsByDueDate: function (aConditions) {
    const mByDate = {};

    (aConditions || []).forEach(c => {
        const sDate = c.dueDate;

        if (!mByDate[sDate]) {
            mByDate[sDate] = {
                ID: c.ID || this._generateUUID(),
                installment: c.installment || "Installment",
                conditionType: c.conditionType,
                dueDate: sDate,
                amount: 0,
                maintenance: 0
            };
        }

        if (c.amount && c.amount > 0) {
            mByDate[sDate].amount += Number(c.amount);
            mByDate[sDate].installment = c.installment || "Installment";
        }

        if (c.maintenance && c.maintenance > 0) {
            mByDate[sDate].maintenance += Number(c.maintenance);
        }
    });

    return Object.values(mByDate)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
,
        // UPDATED: onEditReservation - Navigate to CreateReservation in edit mode
        onEditReservation: function (oEvent) {
            var oData = oEvent.getSource().getBindingContext().getObject();
            var sReservationId = oData.reservationId;

            // Fetch full reservation data with compositions for editing
            fetch(`/odata/v4/real-estate/Reservations(reservationId=${sReservationId})?$expand=project,building,unit,paymentPlan,partners,conditions,payments`)
                .then(response => {
                    if (!response.ok) throw new Error("Failed to fetch reservation");
                    return response.json();
                })
                .then(data => {
                    // FIXED: Syntax error (was !==  &&)
                    if (data.paymentPlan && data.paymentPlan.planYears !== undefined && data.paymentPlan.planYears !== null && data.paymentPlan.planYears !== 0) {
                        data.pricePlanYears = data.paymentPlan.planYears;
                    } else {
                        data.pricePlanYears = null;  // Set to null so Number input shows empty and it's not sent if unchanged
                    }
                    // Fetch unit conditions (simulations) to enable simulation in CreateReservation
                    if (data.unit_unitId) {
                        return fetch(`/odata/v4/real-estate/Units(unitId='${data.unit_unitId}')?$expand=simulations`)
                            .then(unitRes => unitRes.ok ? unitRes.json() : { simulations: [] })
                            .then(unitData => {
                                data.unitConditions = unitData.simulations || [];
                                return data;
                            });
                    }
                    return data;
                })
                .then(data => {
                    // Navigate to CreateReservation screen with edit mode
                    var oReservationData = {
                        ...data,
                        mode: "edit"  // Indicate edit mode
                    };
                    var sData = encodeURIComponent(JSON.stringify(oReservationData));
                    sap.ui.core.UIComponent.getRouterFor(this).navTo("CreateReservation", {
                        reservationData: sData
                    });
                })
                .catch(err => {
                    console.error("Error fetching reservation for edit:", err);
                    sap.m.MessageBox.error("Failed to load reservation for edit: " + err.message);
                });
        },

        _openEditDialog: function (oReservationData) {
            if (!this._oEditDialog) {
                this._oEditDialog = new sap.m.Dialog({
                    title: "Edit Reservation",
                    contentWidth: "100%",
                    resizable: true,
                    content: new sap.m.IconTabBar({
                        expandable: true,
                        items: [
                            // General Tab (unchanged)
                            new sap.m.IconTabFilter({
                                text: "General",
                                content: new sap.ui.layout.form.SimpleForm({
                                    editable: true,
                                    layout: "ResponsiveGridLayout",
                                    labelSpanL: 4,
                                    columnsL: 2,
                                    content: [
                                        new sap.m.Label({ text: "Reservation ID" }),
                                        new sap.m.Input({ value: "{/reservationId}", editable: false }),
                                        new sap.m.Label({ text: "Company Code ID", required: true }),
                                        new sap.m.Input("editCompanyCodeInput", { value: "{/companyCodeId}" }),
                                        new sap.m.Label({ text: "Old Reservation ID" }),
                                        new sap.m.Input({ value: "{/oldReservationId}" }),
                                        new sap.m.Label({ text: "EOI ID" }),
                                        new sap.m.Input({ value: "{/eoiId}" }),
                                        new sap.m.Label({ text: "Sales Type" }),
                                        new sap.m.Select({
                                            selectedKey: "{/salesType}",
                                            items: [
                                                new sap.ui.core.Item({ key: "", text: "" }),
                                                new sap.ui.core.Item({ key: "New sale", text: "New sale" }),
                                                new sap.ui.core.Item({ key: "Upgrade", text: "Upgrade" }),
                                                new sap.ui.core.Item({ key: "Downgrade", text: "Downgrade" }),
                                                new sap.ui.core.Item({ key: "Reallocate", text: "Reallocate" })
                                            ]
                                        }),
                                        new sap.m.Label({ text: "Description", required: true }),
                                        new sap.m.Input("editDescInput", { value: "{/description}" }),
                                        new sap.m.Label({ text: "Valid From", required: true }),
                                        new sap.m.DatePicker("editValidFromInput", {
                                            value: "{/validFrom}",
                                            displayFormat: "yyyy-MM-dd",
                                            valueFormat: "yyyy-MM-dd"
                                        }),
                                        new sap.m.Label({ text: "Status" }),
                                        new sap.m.Input({ value: "{/status}" }),
                                        new sap.m.Label({ text: "Customer Type" }),
                                        new sap.m.Select({
                                            selectedKey: "{/customerType}",
                                            items: [
                                                new sap.ui.core.Item({ key: "", text: "" }),
                                                new sap.ui.core.Item({ key: "Local", text: "Local" }),
                                                new sap.ui.core.Item({ key: "Over seas", text: "Over seas" })
                                            ]
                                        }),
                                        new sap.m.Label({ text: "Currency" }),
                                        new sap.m.Input({ value: "{/currency}" }),
                                        new sap.m.Label({ text: "After Sales" }),
                                        new sap.m.Input({ value: "{/afterSales}" }),
                                        new sap.m.Label({ text: "Project ID" }),
                                        new sap.m.Input({ value: "{/project_projectId}", editable: false }),
                                        new sap.m.Label({ text: "Building ID" }),
                                        new sap.m.Input({ value: "{/building_buildingId}", editable: false }),
                                        new sap.m.Label({ text: "Unit ID" }),
                                        new sap.m.Input({ value: "{/unit_unitId}", editable: false }),
                                        new sap.m.Label({ text: "BUA" }),
                                        new sap.m.Input({ value: "{/bua}", editable: false }),
                                        new sap.m.Label({ text: "Phase" }),
                                        new sap.m.Input({ value: "{/phase}", editable: false }),
                                        new sap.m.Label({ text: "Price Plan Years" }),
                                        new sap.m.Select({
                                            selectedKey: "{/pricePlanYears}",
                                            change: this.onPricePlanYearsChange.bind(this),
                                            items: {
                                                path: "/availableYears",
                                                template: new sap.ui.core.Item({
                                                    key: "{key}",
                                                    text: "{text}"
                                                })
                                            }
                                        }),
                                        new sap.m.Label({ text: "Payment Plan ID" }),
                                        new sap.m.Input({ value: "{/paymentPlan_paymentPlanId}", editable: false }),
                                        new sap.m.Label({ text: "Unit Price" }),
                                        new sap.m.Input({ value: "{/unitPrice}", editable: false }),
                                        // new sap.m.Label({ text: "Plan Currency" }),
                                        new sap.m.Input({ value: "{/planCurrency}" }),
                                        new sap.m.Label({ text: "Request Type" }),
                                        new sap.m.Input({ value: "{/requestType}" }),
                                        new sap.m.Label({ text: "Reason" }),
                                        new sap.m.TextArea({ value: "{/reason}", rows: 3 }),
                                        new sap.m.Label({ text: "Cancellation Date" }),
                                        new sap.m.DatePicker({
                                            value: "{/cancellationDate}",
                                            displayFormat: "yyyy-MM-dd",
                                            valueFormat: "yyyy-MM-dd"
                                        }),
                                        new sap.m.Label({ text: "Cancellation Status" }),
                                        new sap.m.Input({ value: "{/cancellationStatus}" }),
                                        new sap.m.Label({ text: "Rejection Reason" }),
                                        new sap.m.TextArea({ value: "{/rejectionReason}", rows: 3 }),
                                        new sap.m.Label({ text: "Cancellation Fees" }),
                                        new sap.m.Input({ value: "{/cancellationFees}", type: "Number" })
                                    ]
                                })
                            }),
                            // Partners Tab (all fields)
                            new sap.m.IconTabFilter({
                                text: "Partners",
                                content: new sap.m.VBox({
                                    items: [
                                        new sap.m.Toolbar({
                                            content: [
                                                new sap.m.Button({
                                                    text: "Add Row",
                                                    icon: "sap-icon://add",
                                                    press: this.onAddPartnerRow.bind(this)
                                                }),
                                                new sap.m.Button({
                                                    text: "Delete Row",
                                                    icon: "sap-icon://delete",
                                                    press: this.onDeletePartnerRow.bind(this)
                                                })
                                            ]
                                        }),
                                        new sap.m.ScrollContainer({
                                            horizontal: true,
                                            vertical: false,
                                            height: "300px",
                                            content: new sap.m.Table({
                                                id: "editPartnersTable",
                                                items: "{/partners}",
                                                width: "auto",
                                                columns: [
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "ID" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Customer Code" }), width: "15%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Customer Name" }), width: "20%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Customer Address" }), width: "30%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Valid From" }), width: "15%" })
                                                ],
                                                items: {
                                                    template: new sap.m.ColumnListItem({
                                                        cells: [
                                                            new sap.m.Input({ value: "{ID}", editable: false }),
                                                            new sap.m.Input({ value: "{customerCode}" }),
                                                            new sap.m.Input({ value: "{customerName}" }),
                                                            new sap.m.Input({ value: "{customerAddress}" }),
                                                            new sap.m.DatePicker({
                                                                value: "{validFrom}",
                                                                displayFormat: "yyyy-MM-dd",
                                                                valueFormat: "yyyy-MM-dd"
                                                            })
                                                        ]
                                                    })
                                                }
                                            })
                                        })
                                    ]
                                })
                            }),
                            // Conditions Tab (all fields)
                            new sap.m.IconTabFilter({
                                text: "Conditions",
                                content: new sap.m.VBox({
                                    items: [
                                        new sap.m.Toolbar({
                                            content: [
                                                new sap.m.Button({
                                                    text: "Add Row",
                                                    icon: "sap-icon://add",
                                                    press: this.onAddConditionRow.bind(this)
                                                }),
                                                new sap.m.Button({
                                                    text: "Delete Row",
                                                    icon: "sap-icon://delete",
                                                    press: this.onDeleteConditionRow.bind(this)
                                                })
                                            ]
                                        }),
                                        new sap.m.ScrollContainer({
                                            horizontal: true,
                                            vertical: false,
                                            height: "300px",
                                            content: new sap.m.Table({
                                                id: "editConditionsTable",
                                                items: "{/conditions}",
                                                width: "auto",
                                                columns: [
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Installment" }), width: "20%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Due Date" }), width: "20%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Amount" }), width: "20%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Maintenance" }), width: "20%" })
                                                ],
                                                items: {
                                                    template: new sap.m.ColumnListItem({
                                                        cells: [
                                                            new sap.m.Input({ value: "{installment}" }),
                                                            new sap.m.DatePicker({
                                                                value: "{dueDate}",
                                                                displayFormat: "yyyy-MM-dd",
                                                                valueFormat: "yyyy-MM-dd"
                                                            }),
                                                            new sap.m.Input({ value: "{amount}", type: "Number" }),
                                                            new sap.m.Input({ value: "{maintenance}", type: "Number" })
                                                        ]
                                                    })
                                                }
                                            })
                                        })
                                    ]
                                })
                            }),
                            // Payments Tab (all fields)
                            new sap.m.IconTabFilter({
                                text: "Payments",
                                content: new sap.m.VBox({
                                    items: [
                                        new sap.m.Toolbar({
                                            content: [
                                                new sap.m.Button({
                                                    text: "Add Row",
                                                    icon: "sap-icon://add",
                                                    press: this.onAddPaymentRow.bind(this)
                                                }),
                                                new sap.m.Button({
                                                    text: "Delete Row",
                                                    icon: "sap-icon://delete",
                                                    press: this.onDeletePaymentRow.bind(this)
                                                })
                                            ]
                                        }),
                                        new sap.m.ScrollContainer({
                                            horizontal: true,
                                            vertical: false,
                                            height: "300px",
                                            content: new sap.m.Table({
                                                id: "editPaymentsTable",
                                                items: "{/payments}",
                                                width: "auto",
                                                columns: [
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "ID" }), width: "8%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Receipt Type" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Receipt Status" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Payment Method" }), width: "12%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Amount" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "House Bank" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Bank Account" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Due Date" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Transfer Number" }), width: "12%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Check Number" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Customer Bank" }), width: "12%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Customer Bank Account" }), width: "15%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Branch" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Collected Amount" }), width: "12%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "AR Validated" }), width: "10%" }),
                                                    new sap.m.Column({ header: new sap.m.Text({ text: "Rejection Reason" }), width: "15%" })
                                                ],
                                                items: {
                                                    template: new sap.m.ColumnListItem({
                                                        cells: [
                                                            new sap.m.Input({ value: "{ID}", editable: false }),
                                                            new sap.m.Input({ value: "{receiptType}" }),
                                                            new sap.m.Input({ value: "{receiptStatus}" }),
                                                            new sap.m.Input({ value: "{paymentMethod}" }),
                                                            new sap.m.Input({ value: "{amount}", type: "Number" }),
                                                            new sap.m.Input({ value: "{houseBank}" }),
                                                            new sap.m.Input({ value: "{bankAccount}" }),
                                                            new sap.m.DatePicker({
                                                                value: "{dueDate}",
                                                                displayFormat: "yyyy-MM-dd",
                                                                valueFormat: "yyyy-MM-dd"
                                                            }),
                                                            new sap.m.Input({ value: "{transferNumber}" }),
                                                            new sap.m.Input({ value: "{checkNumber}" }),
                                                            new sap.m.Input({ value: "{customerBank}" }),
                                                            new sap.m.Input({ value: "{customerBankAccount}" }),
                                                            new sap.m.Input({ value: "{branch}" }),
                                                            new sap.m.Input({ value: "{collectedAmount}", type: "Number" }),
                                                            new sap.m.CheckBox({ selected: "{arValidated}" }),
                                                            new sap.m.Input({ value: "{rejectionReason}" })
                                                        ]
                                                    })
                                                }
                                            })
                                        })
                                    ]
                                })
                            })
                        ]
                    }),
                    beginButton: new sap.m.Button({
                        text: "Save",
                        type: "Emphasized",
                        press: function () {
                            var oData = this._oEditDialog.getModel().getData();
                            // Validation (same as before)
                            var oDescControl = sap.ui.getCore().byId("editDescInput");
                            var oCompanyControl = sap.ui.getCore().byId("editCompanyCodeInput");
                            var oValidFromControl = sap.ui.getCore().byId("editValidFromInput");
                            if (!oDescControl.getValue() || !oCompanyControl.getValue() || !oValidFromControl.getDateValue()) {
                                sap.m.MessageBox.warning("Fill required fields: Description, Company Code ID, Valid From.");
                                return;
                            }
                            // Remove pricePlanYears if it's 0 or null to avoid sending default value
                            if (oData.pricePlanYears === 0 || oData.pricePlanYears === null) {
                                delete oData.pricePlanYears;
                            }
                            // PATCH
                            fetch(`/odata/v4/real-estate/Reservations(reservationId=${oData.reservationId})`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(oData)
                            })
                                .then(response => {
                                    if (!response.ok) throw new Error("Update failed");
                                    return response.json();
                                })
                                .then(() => {
                                    sap.m.MessageToast.show("Reservation updated successfully!");
                                    this._loadReservations();
                                    this._oEditDialog.close();
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
                            this._oEditDialog.destroy();
                            this._oEditDialog = null;
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._oEditDialog);
            }

            var oDialogModel = new sap.ui.model.json.JSONModel(oReservationData);
            this._populateAvailableYears(oDialogModel);
            this._oEditDialog.setModel(oDialogModel);
            this._oEditDialog.open();
        },


        // Helper methods for table rows (add to the end of the controller)
        onAddPartnerRow: function () {
            var oModel = this._oEditDialog.getModel();
            var aPartners = oModel.getProperty("/partners") || [];
            aPartners.push({
                ID: this._generateUUID(),
                customerCode: "",
                customerName: "",
                customerAddress: "",
                validFrom: ""
            });
            oModel.refresh();
        },

        onDeletePartnerRow: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sPath = oContext.getPath();
            var oModel = this._oEditDialog.getModel();
            var aPartners = oModel.getProperty("/partners");
            var iIndex = parseInt(sPath.split("/").pop());
            aPartners.splice(iIndex, 1);
            oModel.refresh();
        },

        onAddConditionRow: function () {
            var oModel = this._oEditDialog.getModel();
            var aConditions = oModel.getProperty("/conditions") || [];
            aConditions.push({
                ID: this._generateUUID(),
                installment: aConditions.length + 1,
                dueDate: "",
                amount: 0,
                maintenance: 0
            });
            oModel.refresh();
        },

        onDeleteConditionRow: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sPath = oContext.getPath();
            var oModel = this._oEditDialog.getModel();
            var aConditions = oModel.getProperty("/conditions");
            var iIndex = parseInt(sPath.split("/").pop());
            aConditions.splice(iIndex, 1);
            oModel.refresh();
        },

        onAddPaymentRow: function () {
            var oModel = this._oEditDialog.getModel();
            var aPayments = oModel.getProperty("/payments") || [];
            aPayments.push({
                ID: this._generateUUID(),
                receiptType: "",
                receiptStatus: "",
                paymentMethod: "",
                amount: 0,
                houseBank: "",
                bankAccount: "",
                dueDate: "",
                transferNumber: "",
                checkNumber: "",
                customerBank: "",
                customerBankAccount: "",
                branch: "",
                collectedAmount: 0,
                arValidated: false,
                rejectionReason: ""
            });
            oModel.refresh();
        },

        onDeletePaymentRow: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var sPath = oContext.getPath();
            var oModel = this._oEditDialog.getModel();
            var aPayments = oModel.getProperty("/payments");
            var iIndex = parseInt(sPath.split("/").pop());
            aPayments.splice(iIndex, 1);
            oModel.refresh();
        },

        // UUID generator (add if not already present)
        _generateUUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },


        onDelete: function (oEvent) {
            var oData = oEvent.getSource().getBindingContext().getObject();
            MessageBox.confirm("Delete reservation " + oData.reservationId + "?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        fetch(`/odata/v4/real-estate/Reservations(reservationId=${oData.reservationId})`, {
                            method: "DELETE"
                        })
                            .then(response => {
                                if (!response.ok) throw new Error("Delete failed");
                                this._loadReservations();
                                sap.m.MessageToast.show("Reservation deleted!");
                            })
                            .catch(err => MessageBox.error("Error: " + err.message));
                    }
                }.bind(this)
            });
        },


        formatCreateContractVisible: function (oReservation) {
    if (!oReservation || !oReservation.conditions || !oReservation.payments) {
        return false;
    }

    const downPaymentAmount = oReservation.conditions
        .filter(c => c.conditionType === "Down Payment")
        .reduce((s, c) => s + (Number(c.amount) || 0), 0);

    const totalPaymentAmount = oReservation.payments
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    return Math.abs(downPaymentAmount - totalPaymentAmount) < 0.01;
},

onCreateContract: function (oEvent) {
    const oReservation = oEvent.getSource()
        .getBindingContext()
        .getObject();

    sap.m.MessageBox.confirm(
        `Create contract for reservation ${oReservation.reservationId}?`,
        {
            onClose: async (oAction) => {
                if (oAction !== sap.m.MessageBox.Action.OK) return;

                try {
                    const oModel = this.getOwnerComponent().getModel();

                    const payload = {
                        CompanyCode: oReservation.companyCode,
                        Responsible: oReservation.responsible,
                        REContractType: oReservation.contractType,
                        ContractStartDate: new Date().toISOString().split('T')[0]
                    };

                    await oModel.callFunction("/CreateREContract", {
                        method: "POST",
                        urlParameters: payload
                    });

                    sap.m.MessageToast.show("Contract created successfully");

                } catch (e) {
                    sap.m.MessageBox.error(
                        e.message || "Contract creation failed"
                    );
                }
            }
        }
    );
},

        onPrint: function () {
            var printWindow = window.open('', '_blank');
            var htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Reservation Document</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .section { margin-bottom: 20px; }
                        .field { margin-bottom: 10px; }
                        .field label { display: inline-block; width: 150px; font-weight: bold; }
                        .field input, .field textarea { width: 300px; padding: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        table, th, td { border: 1px solid #ddd; }
                        th, td { padding: 8px; text-align: left; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                 <div>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        },
        
          // Formatter for Create Contract button visibility
        formatCreateContractVisible: function (oReservation) {
            if (!oReservation) return false;

            // Sum of amounts in payments
            const payments = oReservation.payments || [];
            const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            // Sum of down payments in conditions
            const conditions = oReservation.conditions || [];
            const totalDownPayments = conditions.reduce((sum, c) => {
                if (c.conditionType === 'Down Payment') {  // Using description since code not available in data
                    return sum + (parseFloat(c.amount) || 0);
                }
                return sum;
            }, 0);

            // Visible if total payments equal total down payments
            return totalPayments === totalDownPayments;
        },
    });
});