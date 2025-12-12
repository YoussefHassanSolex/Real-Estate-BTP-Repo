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
                const simRes = await fetch(`/odata/v4/real-estate/PaymentPlanSimulations(simulationId='${savedSimulationId}')?$expand=schedule,paymentPlan($expand=schedule($expand=conditionType,basePrice,frequency))`);
                if (!simRes.ok) {
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

        // Fixed: Simulate conditions from saved simulation to match ReservationConditions entity
     // Fixed: Simulate conditions from saved simulation to match ReservationConditions entity, but keep conditionType for display
_simulateConditionsFromSaved: async function (simulation, pricePlanYears) {
    // Use the saved simulation's schedule directly (it has the calculated amounts)
    const savedSchedule = simulation.schedule || [];

    // Map to ReservationConditions format (exclude "Total" row, as it's a summary)
    // Added: Keep conditionType for display in the view (first column), but entity uses installment as Integer
    const conditions = savedSchedule.filter(s => s.conditionType !== "Total").map((s, index) => ({
        ID: this._generateUUID(),  // Auto-generate for composition
        conditionType: s.conditionType,  // For display in view (e.g., "Down Payment")
        installment: index + 1,  // Sequential installment number (for entity)
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

        // Added: Generate UUID for IDs
        _generateUUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        onSaveReservation: async function () {
            const oModel = this.getView().getModel("local");
            const oData = oModel.getData();

            // Fixed: Transform conditions directly to match ReservationConditions entity (no invalid fields)
            const transformedConditions = oData.conditions.map((c, index) => ({
                ID: c.ID || this._generateUUID(),  // Auto-generate if missing
                installment: c.installment || (index + 1),  // Use provided or sequential
                dueDate: c.dueDate ? new Date(c.dueDate).toISOString().split("T")[0] : null,
                amount: c.amount || 0,
                maintenance: c.maintenance || 0
            }));

            // Fixed: Transform partners to match ReservationPartners entity
            const transformedPartners = oData.partners.map(p => ({
                ID: p.ID || this._generateUUID(),
                customerCode: p.customerCode || "",
                customerName: p.customerName || "",
                customerAddress: p.customerAddress || "",
                validFrom: p.validFrom ? new Date(p.validFrom).toISOString().split("T")[0] : null
            }));

            // Fixed: Transform payments to match ReservationPayments entity
            const transformedPayments = oData.payments.map(p => ({
                ID: p.ID || this._generateUUID(),
                receiptType: p.receiptType || "",
                receiptStatus: p.receiptStatus || "",
                paymentMethod: p.paymentMethod || "",
                amount: p.amount || 0,
                houseBank: p.houseBank || "",
                bankAccount: p.bankAccount || "",
                dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split("T")[0] : null,
                transferNumber: p.transferNumber || "",
                checkNumber: p.checkNumber || "",
                customerBank: p.customerBank || "",
                customerBankAccount: p.customerBankAccount || "",
                branch: p.branch || "",
                collectedAmount: p.collectedAmount || 0,
                arValidated: p.arValidated || false,
                rejectionReason: p.rejectionReason || ""
            }));

            const payload = {
                reservationId: this._generateUUID(),  // Auto-generate UUID for key
                companyCodeId: oData.companyCodeId || "",
                oldReservationId: oData.oldReservationId || "",
                eoiId: oData.eoiId || "",
                salesType: oData.salesType || "",
                description: oData.description || "",
                validFrom: oData.validFrom ? new Date(oData.validFrom).toISOString().split("T")[0] : null,
                status: (oData.status || "").charAt(0) || "O",  // Default to 'O' (Open)
                customerType: oData.customerType || "",
                currency: oData.currency || "",
                afterSales: oData.afterSales || "",
                project_projectId: oData.project_projectId || "",  // Association
                building_buildingId: oData.building_buildingId || "",
                unit_unitId: oData.unit_unitId || "",
                bua: oData.bua || 0,
                phase: oData.phase || "",
                pricePlanYears: oData.pricePlanYears || 0,
                paymentPlan_paymentPlanId: oData.paymentPlan_paymentPlanId || "",
                planYears: oData.planYears || 0,
                unitPrice: oData.unitPrice || 0,
                planCurrency: oData.planCurrency || "",
                requestType: oData.requestType || "",
                reason: oData.reason || "",
                cancellationDate: oData.cancellationDate ? new Date(oData.cancellationDate).toISOString().split("T")[0] : null,
                cancellationStatus: oData.cancellationStatus || "",
                rejectionReason: oData.rejectionReason || "",
                cancellationFees: oData.cancellationFees || 0,
                partners: transformedPartners,  // Composition
                conditions: transformedConditions,  // Composition
                payments: transformedPayments  // Composition
            };

            try {
                const res = await fetch("/odata/v4/real-estate/Reservations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to create reservation: ${res.status} - ${errorText}`);
                }

                MessageToast.show("Reservation created successfully!");
                this._resetReservationForm();
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Units");

            } catch (err) {
                console.error("Save error:", err);
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
            const oContext = oEvent.getSource().getBindingContext("local");
            const sPath = oContext.getPath();
            const oModel = this.getView().getModel("local");
            const aPayments = oModel.getProperty("/payments");
            const iIndex = parseInt(sPath.split("/").pop());
            aPayments.splice(iIndex, 1);
            oModel.refresh();
        },

        // Partners table
        onAddPartnerRow: function () {
            const oModel = this.getView().getModel("local");
            const aPartners = oModel.getProperty("/partners");
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
            const oContext = oEvent.getSource().getBindingContext("local");
            const sPath = oContext.getPath();
            const oModel = this.getView().getModel("local");
            const aPartners = oModel.getProperty("/partners");
            const iIndex = parseInt(sPath.split("/").pop());
            aPartners.splice(iIndex, 1);
            oModel.refresh();
        },

        // Conditions table (now editable, can add/delete)
        onAddConditionRow: function () {
            const oModel = this.getView().getModel("local");
            const aConditions = oModel.getProperty("/conditions");
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
            const oContext = oEvent.getSource().getBindingContext("local");
            const sPath = oContext.getPath();
            const oModel = this.getView().getModel("local");
            const aConditions = oModel.getProperty("/conditions");
            const iIndex = parseInt(sPath.split("/").pop());
            aConditions.splice(iIndex, 1);
            oModel.refresh();
        },

        onCancelReservation: function () {
            this.getView().getModel("local").setData({}); // Clear form
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Units"); // Navigate back
        }
    });
});
