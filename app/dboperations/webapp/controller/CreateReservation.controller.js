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

            var bIsEdit = oReservation.mode === "edit";

            var oModel = new sap.ui.model.json.JSONModel({
                mode: oReservation.mode || "create",
                isEditMode: bIsEdit,
                title: bIsEdit ? `Edit Reservation - ${oReservation.description || ''}` : "Create Reservation",
                reservationId: bIsEdit ? oReservation.reservationId : "",
                bua: oReservation.bua,
                companyCodeId: oReservation.companyCodeId,
                oldReservationId: oReservation.oldReservationId,
                eoiId: oReservation.eoiId,
                salesType: oReservation.salesType,
                description: oReservation.description,
                validFrom: oReservation.validFrom,
                status: oReservation.status === "O" ? "Open" : oReservation.status || "Open",
                customerType: oReservation.customerType,
                currency: oReservation.currency,
                afterSales: oReservation.afterSales,
                project_projectId: oReservation.project_projectId,
                unit_unitId: oReservation.unit_unitId,
                building_buildingId: oReservation.buildingId,
                unitPrice: oReservation.unitPrice,
                planCurrency: oReservation.planCurrency,
                requestType: oReservation.requestType,
                reason: oReservation.reason,
                cancellationDate: oReservation.cancellationDate,
                cancellationStatus: oReservation.cancellationStatus,
                rejectionReason: oReservation.rejectionReason,
                cancellationFees: oReservation.cancellationFees,
                reservationType: oReservation.reservationType,
                unitType: oReservation.unitType,
                phase: oReservation.phase,
                pricePlanYears: oReservation.pricePlanYears,
                planYears: oReservation.pricePlanYears,
                paymentPlan_paymentPlanId: oReservation.paymentPlan_paymentPlanId,
                simulations: oReservation.simulations || [],

                selectedPricePlanYears: "",
                selectedSimulationId: "",
                // result
                conditions: bIsEdit ? oReservation.conditions || [] : [],
                partners: bIsEdit ? oReservation.partners || [] : [],
                payments: bIsEdit ? oReservation.payments || [] : []
            });

            this.getView().setModel(oModel, "local");

            // For edit mode, load simulations from the unit
            if (bIsEdit && oReservation.unit_unitId) {
                try {
                    const unitRes = await fetch(`/odata/v4/real-estate/Units(unitId='${oReservation.unit_unitId}')?$expand=simulations`);
                    if (unitRes.ok) {
                        const unit = await unitRes.json();
                        console.log("Loaded simulations for edit:", unit.simulations);
                        let aSimulations = unit.simulations || [];
                        // Ensure the current pricePlanYears is in the simulations for the Select
                        if (oReservation.pricePlanYears !== undefined && oReservation.pricePlanYears !== null && !aSimulations.some(sim => sim.pricePlanYears === String(oReservation.pricePlanYears))) {
                            aSimulations.push({
                                simulationId: `edit-${oReservation.pricePlanYears}`,
                                pricePlanYears: String(oReservation.pricePlanYears),
                                paymentPlan_paymentPlanId: oReservation.paymentPlan_paymentPlanId || ""
                            });
                        }
                        // Ensure all simulations have pricePlanYears as string
                        aSimulations.forEach(sim => {
                            sim.pricePlanYears = String(sim.pricePlanYears);
                        });
                        // Remove duplicates based on pricePlanYears
                        const uniqueSimulations = aSimulations.filter((sim, index, self) =>
                            index === self.findIndex(s => s.pricePlanYears === sim.pricePlanYears)
                        );
                        oModel.setProperty("/simulations", uniqueSimulations);
                        oModel.refresh();
                        this.getView().byId("_IDGenSelect2").updateItems();
                        // Set selected price plan years after simulations are loaded
                        console.log("Setting selectedPricePlanYears to:", oReservation.pricePlanYears);
                        oModel.setProperty("/selectedPricePlanYears", String(oReservation.pricePlanYears));
                        this.getView().byId("_IDGenSelect2").invalidate();
                        setTimeout(() => {
                            this.getView().byId("_IDGenSelect2").setSelectedKey(String(oReservation.pricePlanYears));
                        }, 0);
                        this._resolveSimulationByYears(Number(oReservation.pricePlanYears));
                    } else {
                        console.error("Failed to load simulations for edit, status:", unitRes.status);
                    }
                } catch (err) {
                    console.error("Failed to load simulations for edit", err);
                }
            } else if (oReservation.simulations?.length) {
                const iDefaultYears = oReservation.simulations[0].pricePlanYears;
                console.log("Setting selectedPricePlanYears to default:", iDefaultYears);
                oModel.setProperty("/selectedPricePlanYears", iDefaultYears);
                oModel.updateBindings(true);
                await this._resolveSimulationByYears(Number(iDefaultYears));
            }

            // For edit mode, ensure conditions have installment as conditionType
            if (bIsEdit) {
                const aConditions = oModel.getProperty("/conditions") || [];
                console.log("Conditions before installment fix:", aConditions);
                aConditions.forEach((condition, index) => {
                    if (!condition.installment) {
                        condition.installment = condition.conditionType || "Installment";
                    }
                });
                console.log("Conditions after installment fix:", aConditions);
                oModel.setProperty("/conditions", aConditions);
            }
        },


        onPricePlanYearsChange: async function (oEvent) {
            const iYears = Number(oEvent.getSource().getSelectedKey());
            const oModel = this.getView().getModel("local");
            oModel.setProperty("/pricePlanYears", iYears);
            oModel.setProperty("/planYears", iYears);
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

            oModel.setProperty("/selectedPricePlanYears", String(iYears));
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
            const oModel = this.getView().getModel("local");
            const bIsEdit = oModel.getProperty("/isEditMode");

            const aConditions = (simulation.schedule || [])
                .filter(s => s.conditionType !== "Total")
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map((s, index) => ({
                    ID: this._generateUUID(),
                    installment: s.conditionType,
                    conditionType: s.conditionType,
                    dueDate: s.dueDate,
                    amount: s.amount,
                    maintenance: s.maintenance
                }));

            oModel.setProperty("/conditions", aConditions);
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
            alert(oData)
            const bIsEdit = oData.mode === "edit";

            // For edit mode, use existing reservationId; for create, generate new one
            const reservationId = bIsEdit ? oData.reservationId : this._generateUUID();

            const transformedConditions = oData.conditions.map((c, index) => ({
                ID: c.ID || this._generateUUID(),
                installment: c.installment || "Installment",
                conditionType: c.conditionType || c.installment,
                dueDate: c.dueDate
                    ? new Date(c.dueDate).toISOString().split("T")[0]
                    : null,
                amount: c.amount ?? 0,
                maintenance: c.maintenance ?? 0,
                reservation_reservationId: reservationId
            }));

            console.log("Conditions before save:", transformedConditions);

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

            // Remove pricePlanYears and planYears if they are 0 or null to avoid sending default values
            if (oData.pricePlanYears === 0 || oData.pricePlanYears === null) {
                delete oData.pricePlanYears;
            }
            if (oData.planYears === 0 || oData.planYears === null) {
                delete oData.planYears;
            }

            const payload = {
                reservationId: reservationId,
                companyCodeId: oData.companyCodeId || "",
                oldReservationId: oData.oldReservationId || "",
                eoiId: oData.eoiId || "",
                salesType: oData.salesType || "",
                description: oData.description || "",
                validFrom: oData.validFrom ? new Date(oData.validFrom).toISOString().split("T")[0] : null,
                status: oData.status || "O",  // Default to 'O' (Open)
                customerType: oData.customerType || "",
                currency: oData.currency || "",
                afterSales: oData.afterSales || "",
                project_projectId: oData.project_projectId || "",  // Association
                building_buildingId: oData.building_buildingId || "",
                unit_unitId: oData.unit_unitId || "",
                bua: oData.bua || 0,
                reservationType:oData.reservationType,
                unitType:oData.unitType,
                phase: oData.phase || "",
                paymentPlan_paymentPlanId: oData.paymentPlan_paymentPlanId || "",
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

            // Conditionally add pricePlanYears and planYears if they exist
            if (oData.pricePlanYears !== undefined) {
                payload.pricePlanYears = oData.pricePlanYears;
            }
            if (oData.planYears !== undefined) {
                payload.planYears = oData.planYears;
            }

            try {
                const method = bIsEdit ? "PATCH" : "POST";
                const url = bIsEdit
                    ? `/odata/v4/real-estate/Reservations(reservationId=${reservationId})`
                    : "/odata/v4/real-estate/Reservations";

                const res = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to ${bIsEdit ? 'update' : 'create'} reservation: ${res.status} - ${errorText}`);
                }
                console.log("reservation saved", res);

                MessageToast.show(`Reservation ${bIsEdit ? 'updated' : 'created'} successfully!`);
                this._resetReservationForm();
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Reservations");

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
                installment: "Installment",
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
