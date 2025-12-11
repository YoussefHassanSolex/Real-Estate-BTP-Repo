sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageBox, MessageToast, JSONModel) => {
    "use strict";

    return Controller.extend("dboperations.controller.CreateReservation", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("CreateReservation").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: async function (oEvent) {
            var sData = oEvent.getParameter("arguments").reservationData;
            this._resetReservationForm();

            if (sData) {
                var oReservation = JSON.parse(decodeURIComponent(sData));
                console.log("Decoded reservation:", oReservation);

                // Set the initial model
                var oModel = new sap.ui.model.json.JSONModel({
                    bua: oReservation.bua,
                    companyCodeId: oReservation.companyCodeId,
                    project_projectId: oReservation.project_projectId,
                    unit_unitId: oReservation.unit_unitId,
                    building_buildingId: oReservation.buildingId,
                    unitPrice: oReservation.unitPrice,
                    paymentPlan_paymentPlanId: oReservation.paymentPlan_paymentPlanId,
                    // User-editable fields
                    oldReservationId: "",
                    eoiId: "",
                    salesType: "",
                    description: "",
                    validFrom: "",
                    status: oReservation.unitStatusDescription,
                    customerType: "",
                    currency: oReservation.currency,
                    afterSales: "",
                    phase: oReservation.phase,
                    pricePlanYears: oReservation.pricePlanYears,
                    planYears: 0,
                    planCurrency: "",
                    requestType: "",
                    reason: "",
                    cancellationDate: "",
                    cancellationStatus: "",
                    rejectionReason: "",
                    cancellationFees: 0,
                    payments: [],
                    partners: [],
                    conditions: []  // Will be populated from simulation
                });
                this.getView().setModel(oModel, "local");

                // Fetch unit's saved simulation and simulate conditions
                await this._loadAndSimulateConditions(oReservation.unit_unitId, oReservation.pricePlanYears);
            }
        },
        

               // Updated: Load unit's saved simulation and simulate conditions
        _loadAndSimulateConditions: async function (unitId, pricePlanYears) {
            try {
                // Fetch unit to get savedSimulationId
                const unitRes = await fetch(`/odata/v4/real-estate/Units(unitId='${unitId}')?$select=savedSimulationId`);
                if (!unitRes.ok) throw new Error("Failed to fetch unit");
                const unitData = await unitRes.json();
                const savedSimulationId = unitData.savedSimulationId;

                console.log("Fetched savedSimulationId:", savedSimulationId);  // Debug log

                if (!savedSimulationId) {
                    MessageBox.information("No saved simulation found for this unit. Conditions will be empty.");
                    return;
                }

                // Fixed: Use guid format for UUID key in OData v4
const simRes = await fetch(`/odata/v4/real-estate/PaymentPlanSimulations(simulationId='${savedSimulationId}')?$expand=schedule,paymentPlan($expand=schedule($expand=conditionType,basePrice,frequency))`);                if (!simRes.ok) {
                    console.error("Fetch response status:", simRes.status, simRes.statusText);  // Debug log
                    throw new Error("Failed to fetch simulation");
                }
                const simulation = await simRes.json();

                console.log("Fetched simulation:", simulation);  // Debug log

                // Simulate conditions based on simulation data
                const conditions = await this._simulateConditionsFromSaved(simulation, pricePlanYears);
                const oModel = this.getView().getModel("local");
                oModel.setProperty("/conditions", conditions);
                oModel.refresh();

            } catch (err) {
                console.error("Error loading simulation:", err);
                MessageBox.error("Failed to load simulation for conditions: " + err.message);
            }
        },

               // Updated: Simulate conditions from saved simulation (use saved schedule directly, including Total)
        _simulateConditionsFromSaved: async function (simulation, pricePlanYears) {
            // Use the saved simulation's schedule directly (it has the calculated amounts, including Total)
            const savedSchedule = simulation.schedule || [];

            // Map to conditions format (include all rows, including "Total")
            const conditions = savedSchedule.map(s => ({
                conditionType: s.conditionType,  // Installment
                dueDate: s.dueDate,  // Due Date
                amount: s.amount,  // Amount
                maintenance: s.maintenance  // Maintenance
            }));

            return conditions;
        },



        // Helper: Get frequency interval (from PPS)
        _getFrequencyIntervalPPS: function (frequencyDesc) {
            if (!frequencyDesc) return 12;
            switch (frequencyDesc.toLowerCase()) {
                case "monthly": return 1;
                case "quarterly": return 3;
                case "semi-annual": return 6;
                case "annual": return 12;
                default: return 12;
            }
        },

             onSaveReservation: async function () {
            const oModel = this.getView().getModel("local");
            const oData = oModel.getData();

            // Transform conditions from simulation format to entity format
            const transformedConditions = [];
            oData.conditions.forEach(c => {
                // Add amount condition (if amount > 0)
                if (c.amount > 0) {
                    transformedConditions.push({
                        conditionType: c.conditionType,
                        amount: c.amount,
                        currency: "EGP",  // Default; can be from model if available
                        frequency: "One-time",  // Default for installments
                        validFrom: c.dueDate,
                        validTo: null
                    });
                }
                // Add maintenance condition (if maintenance > 0)
                if (c.maintenance > 0) {
                    transformedConditions.push({
                        conditionType: "Maintenance",
                        amount: c.maintenance,
                        currency: "EGP",
                        frequency: "Annual",  // Default for maintenance
                        validFrom: c.dueDate,
                        validTo: null
                    });
                }
            });

            const payload = {
                companyCodeId: oData.companyCodeId,
                project_projectId: oData.project_projectId,
                unit_unitId: oData.unit_unitId,
                bua: oData.bua,
                unitPrice: oData.unitPrice,
                paymentPlan_paymentPlanId: oData.paymentPlan_paymentPlanId,

                oldReservationId: oData.oldReservationId,
                eoiId: oData.eoiId,
                salesType: oData.salesType,
                description: oData.description,
                validFrom: oData.validFrom,
                status: (oData.status || "").charAt(0) || "O",
                customerType: oData.customerType,
                currency: oData.currency,
                afterSales: oData.afterSales,

                phase: oData.phase,
                pricePlanYears: oData.pricePlanYears,
                planYears: oData.planYears,
                planCurrency: oData.planCurrency,

                requestType: oData.requestType,
                reason: oData.reason,
                cancellationDate: oData.cancellationDate || null,
                cancellationStatus: oData.cancellationStatus,
                rejectionReason: oData.rejectionReason,
                cancellationFees: oData.cancellationFees,

                payments: oData.payments,
                partners: oData.partners,
                conditions: transformedConditions  // Use transformed conditions
            };

            try {
                const res = await fetch("/odata/v4/real-estate/Reservations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to create reservation");

                MessageToast.show("Reservation created successfully!");
                this._resetReservationForm();
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Units");

                oModel.setData({}); // Clear form
            } catch (err) {
                MessageBox.error(err.message);
            }
        },


        _resetReservationForm: function () {
            const oEmptyModel = new sap.ui.model.json.JSONModel({
                reservationId: "",
                companyCodeId: "",
                oldReservationId: "",
                eoiId: "",
                salesType: "",
                description: "",
                validFrom: "",
                status: "",
                customerType: "",
                currency: "",
                afterSales: "",
                project_projectId: "",
                building_buildingId: "",
                unit_unitId: "",
                paymentPlan_paymentPlanId: "",
                bua: 0,
                phase: "",
                pricePlanYears: 0,
                planYears: 0,
                unitPrice: 0,
                planCurrency: "",
                requestType: "",
                reason: "",
                cancellationDate: null,
                cancellationStatus: "",
                rejectionReason: "",
                cancellationFees: 0,
                payments: [],
                partners: [],
                conditions: []
            });

            this.getView().setModel(oEmptyModel, "local");
        },

        // Payments table
        onAddPaymentRow: function () {
            const oModel = this.getView().getModel("local");
            const aPayments = oModel.getProperty("/payments");
            aPayments.push({});
            oModel.refresh();
        },
        onDeletePaymentRow: function () {
            const oModel = this.getView().getModel("local");
            const aPayments = oModel.getProperty("/payments");
            aPayments.pop();
            oModel.refresh();
        },

        // Partners table
        onAddPartnerRow: function () {
            const oModel = this.getView().getModel("local");
            const aPartners = oModel.getProperty("/partners");
            aPartners.push({});
            oModel.refresh();
        },
        onDeletePartnerRow: function () {
            const oModel = this.getView().getModel("local");
            const aPartners = oModel.getProperty("/partners");
            aPartners.pop();
            oModel.refresh();
        },

        // Conditions table (no add/delete since auto-populated)
        onAddConditionRow: function () {
            // Removed: Conditions are auto-populated from simulation
        },
        onDeleteConditionRow: function () {
            // Removed: Conditions are auto-populated from simulation
        },

        onCancelReservation: function () {
            this.getView().getModel("local").setData({}); // Clear form
        }
    });
});