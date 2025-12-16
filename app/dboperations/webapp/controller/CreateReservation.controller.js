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
            oRouter.getRoute("CreateReservation")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: async function (oEvent) {
            this._resetReservationForm();

            var sData = oEvent.getParameter("arguments").reservationData;
            if (!sData) {
                return;
            }

            var oReservation = JSON.parse(decodeURIComponent(sData));
            console.log("Decoded reservation:", oReservation);

            var oModel = new sap.ui.model.json.JSONModel({
                bua: oReservation.bua,
                companyCodeId: oReservation.companyCodeId,
                project_projectId: oReservation.project_projectId,
                unit_unitId: oReservation.unit_unitId,
                building_buildingId: oReservation.buildingId,
                unitPrice: oReservation.unitPrice,
                currency: oReservation.currency,
                status: oReservation.unitStatusDescription,

                // ✅ persisted simulations from unit
                simulations: oReservation.simulations || [],

                // selection state
                selectedPricePlanYears: "",
                selectedSimulationId: "",
                paymentPlan_paymentPlanId: "",

                // result
                conditions: [],
                partners:[],
                payments:[]
            });

            this.getView().setModel(oModel, "local");

            // optional: auto-select first plan
            if (oReservation.simulations?.length) {
                const iDefaultYears = oReservation.simulations[0].pricePlanYears;
                oModel.setProperty("/selectedPricePlanYears", iDefaultYears);
                await this._resolveSimulationByYears(iDefaultYears);
            }
        },


        onPricePlanYearsChange: async function (oEvent) {
            const iYears = Number(oEvent.getSource().getSelectedKey());
            await this._resolveSimulationByYears(iYears);
        },

        _resolveSimulationByYears: async function (iYears) {
            const oModel = this.getView().getModel("local");
            const aSims = oModel.getProperty("/simulations") || [];

            const oSelectedSim = aSims.find(
                sim => Number(sim.pricePlanYears) === iYears
            );

            if (!oSelectedSim) {
                oModel.setProperty("/conditions", []);
                return;
            }

            oModel.setProperty("/selectedPricePlanYears", iYears);
            oModel.setProperty("/selectedSimulationId", oSelectedSim.simulationId);
            oModel.setProperty(
                "/paymentPlan_paymentPlanId",
                oSelectedSim.paymentPlan_paymentPlanId
            );
            console.log(
                "Years:", iYears,
                "Simulation:", oSelectedSim.simulationId,
                "PaymentPlan:", oSelectedSim.paymentPlan_paymentPlanId
            );
            await this._loadConditionsFromSimulation(oSelectedSim.simulationId);
        },



        _loadConditionsFromSimulation: async function (sSimulationId) {
            if (!sSimulationId) {
                return;
            }

            const res = await fetch(
                `/odata/v4/real-estate/PaymentPlanSimulations(simulationId='${sSimulationId}')?$expand=schedule`
            );

            if (!res.ok) {
                MessageBox.error("Failed to load simulation conditions");
                return;
            }

            const simulation = await res.json();

            const aConditions = (simulation.schedule || [])
                .filter(s => s.conditionType !== "Total")
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map((s, index) => ({
                    ID: this._generateUUID(),
                    installment: index + 1,
                    conditionType: s.conditionType,
                    dueDate: s.dueDate,
                    amount: s.amount,
                    maintenance: s.maintenance
                }));

            this.getView().getModel("local")
                .setProperty("/conditions", aConditions);
        }
        ,



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
