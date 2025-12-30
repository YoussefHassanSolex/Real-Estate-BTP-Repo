sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("dboperations.controller.PaymentPlanSimulations", {

        onInit: function () {
            // Initialize local model and simulation output model
            this.getView().setModel(new JSONModel({}), "local");
            this.getView().setModel(new JSONModel([]), "simulationOutput");

            // Load units and dropdowns
            this._loadUnits();
            this._loadDropdownData();
            this._idCounter = parseInt(localStorage.getItem("simulationIdCounter")) || 0;
        },

        /* ----------------------------
           Value Help (Search Help)
        ---------------------------- */
        onOpenUnitValueHelp: function () {
            const oView = this.getView();

            if (!this._oUnitValueHelp) {
                this._oUnitValueHelp = new sap.m.SelectDialog({
                    title: "Select Unit",
                    items: {
                        path: "units>/",
                        template: new sap.m.StandardListItem({
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
                        // Combined as OR
                        oEvent.getSource().getBinding("items").filter(new sap.ui.model.Filter(aFilters, false));
                    },
                    confirm: function (oEvent) {
                        const oSelectedItem = oEvent.getParameter("selectedItem");
                        if (oSelectedItem) {
                            const oContext = oSelectedItem.getBindingContext("units");
                            const oUnit = oContext.getObject();
                            const unitId = oUnit.unitId;
                            const desc = oUnit.unitDescription;

                            // Store in local model
                            const oLocalModel = oView.getModel("local");
                            oLocalModel.setProperty("/unitId", unitId);

                            // Show friendly text in input
                            const oUnitInput = oView.byId("unitIdInput");
                            if (oUnitInput) {
                                oUnitInput.setValue(`${desc} (${unitId})`);
                            }

                            // Trigger existing logic to set project and compute final price
                            this._onUnitSelected(unitId);
                        }
                    }.bind(this),
                    liveChange: function (oEvent) {
                        // Keep list responsive while typing (optional)
                        // same as search
                        const sValue = oEvent.getParameter("value") || "";
                        const aFilters = [
                            new sap.ui.model.Filter("unitDescription", sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("unitId", sap.ui.model.FilterOperator.Contains, sValue)
                        ];
                        oEvent.getSource().getBinding("items").filter(new sap.ui.model.Filter(aFilters, false));
                    }
                });
                oView.addDependent(this._oUnitValueHelp);
            }

            this._oUnitValueHelp.open();
        },

        // Called by selection to reuse onUnitChange logic
        _onUnitSelected: function (selectedUnitId) {
            // Reuse old onUnitChange path by creating a compatible event-like wrapper
            this.onUnitChange({
                getParameter: () => ({ selectedItem: { getKey: () => selectedUnitId } })
            });
        },

        /* ----------------------------
           Loading helper data
        ---------------------------- */
        _loadUnits: function () {
            fetch("/odata/v4/real-estate/Units?$expand=project")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "units");

                    // If there is a ComboBox (legacy) refresh bindings safely
                    const oComboBox = this.getView().byId("unitIdSelect");
                    if (oComboBox && oComboBox.getBinding("items")) {
                        oComboBox.getBinding("items").refresh();
                    }
                })
                .catch(err => console.error("Failed to load units:", err));
        },

        _loadDropdownData: async function () {
            try {
                const [projectsRes, plansRes] = await Promise.all([
                    fetch("/odata/v4/real-estate/Projects"),
                    fetch("/odata/v4/real-estate/PaymentPlans?$expand=assignedProjects($expand=project)")
                ]);
                const projects = await projectsRes.json();
                const plans = await plansRes.json();

                this.getView().setModel(new JSONModel(projects.value || []), "projects");
                this.getView().setModel(new JSONModel(plans.value || []), "paymentPlans");
            } catch (err) {
                console.error("Failed to load dropdown data:", err);
            }
        },

        /* ----------------------------
           Unit change (original logic restored)
           Accepts both ComboBox events and our wrapper
        ---------------------------- */
        onUnitChange: async function (oEvent) {
            // Determine selectedUnitId from event, ComboBox, or local model
            let selectedUnitId = null;

            // 1. From event wrapper (ComboBox style)
            if (oEvent && typeof oEvent.getParameter === "function") {
                const oSelItem = oEvent.getParameter("selectedItem");
                if (oSelItem && typeof oSelItem.getKey === "function") {
                    selectedUnitId = oSelItem.getKey();
                }
            }

            // 2. If there's still a ComboBox based flow
            if (!selectedUnitId) {
                const oComboBox = this.getView().byId("unitIdSelect");
                if (oComboBox && typeof oComboBox.getSelectedKey === "function") {
                    selectedUnitId = oComboBox.getSelectedKey();
                }
            }

            // 3. Fallback to local model (value help)
            if (!selectedUnitId) {
                const oLocal = this.getView().getModel("local");
                selectedUnitId = oLocal ? oLocal.getProperty("/unitId") : null;
            }

            if (!selectedUnitId) {
                console.warn("onUnitChange: no unit selected.");
                return;
            }

            const oUnitsModel = this.getView().getModel("units");
            const aUnits = oUnitsModel ? oUnitsModel.getData() : [];
            const oSelectedUnit = (aUnits || []).find(u => u.unitId === selectedUnitId);

            if (oSelectedUnit) {
                const projectId = oSelectedUnit.project?.projectId || oSelectedUnit.projectId;
                const projectDescription = oSelectedUnit.project?.projectDescription || oSelectedUnit.projectDescription;

                if (projectId) {
                    const oLocalModel = this.getView().getModel("local");
                    oLocalModel.setProperty("/projectId", projectId);
                    oLocalModel.setProperty("/projectDescription", projectDescription);

                    // Recreate original final price calculation: sum Conditions.amount
                    try {
                        const conditionsRes = await fetch(`/odata/v4/real-estate/Conditions?$filter=unit_unitId eq '${selectedUnitId}'`);
                        const conditions = await conditionsRes.json();
                        const aConditions = conditions.value || [];

                        const finalPrice = (aConditions || []).reduce((sum, c) => {
                            const amt = Number(c.amount) || 0;
                            return sum + amt;
                        }, 0);

                        oLocalModel.setProperty("/finalPrice", finalPrice);
                    } catch (err) {
                        console.error("Failed to calculate final price:", err);
                    }
                } else {
                    console.warn("No project info on selected unit.");
                }
            } else {
                console.warn("Selected unit not found in units model.");
            }
        },

        /* ----------------------------
    Price plan change (with clearing paymentPlanId if no match)
 ---------------------------- */
        onPricePlanChange: function (oEvent) {
            const pricePlanYears = parseInt(oEvent.getParameter("value"));
            const projectId = this.getView().byId("projectIdInput").getValue();
            const oPlansModel = this.getView().getModel("paymentPlans");
            const aPlans = oPlansModel ? oPlansModel.getData() : [];

            const oSelectedPlan = (aPlans || []).find(p =>
                p.planYears === pricePlanYears &&
                Array.isArray(p.assignedProjects) &&
                p.assignedProjects.some(ap => ap.project?.projectId === projectId)
            );

            if (oSelectedPlan) {
                this.getView().byId("paymentPlanIdInput").setValue(oSelectedPlan.paymentPlanId);
            } else {
                // 🔹 New: Clear paymentPlanId if no matching plan found
                this.getView().byId("paymentPlanIdInput").setValue("");
            }
        },


        /* ----------------------------
           Simulate (with reordered validation for price plan years)
        ---------------------------- */
        onSimulate: async function () {
            debugger;

            // Read unitId & finalPrice from local model (value-help flow)
            const oLocal = this.getView().getModel("local");
            const unitId = oLocal ? oLocal.getProperty("/unitId") : null;
            const finalPrice = oLocal ? Number(oLocal.getProperty("/finalPrice")) : NaN;

            const projectId = this.getView().byId("projectIdInput").getValue();
            const paymentPlanId = this.getView().byId("paymentPlanIdInput").getValue();
            const pricePlanYears = parseInt(this.getView().byId("pricePlanInput").getValue());
            const leadId = this.getView().byId("leadIdInput").getValue();
            const userId = "currentUser";

            // Basic field check (unitId required)
            if (!unitId) {
                MessageBox.error("Please select a unit.");
                return;
            }

            // 🔹 New: Validate if pricePlanYears exists for the selected project (first, since paymentPlanId depends on it)
            const oPlansModel = this.getView().getModel("paymentPlans");
            const aPlans = oPlansModel ? oPlansModel.getData() : [];
            const matchingPlan = aPlans.find(p =>
                p.planYears === pricePlanYears &&
                Array.isArray(p.assignedProjects) &&
                p.assignedProjects.some(ap => ap.project?.projectId === projectId)
            );

            if (!matchingPlan) {
                MessageBox.error("No payment plan exists for the selected years and project. Please enter a valid number of years.");
                return;
            }

            // Now check paymentPlanId (should be set via onPricePlanChange if years are valid)
            if (!paymentPlanId) {
                MessageBox.error("Payment Plan ID is not set. Please ensure the years are valid.");
                return;
            }

            // Now check finalPrice (calculated via unit selection)
            if (!finalPrice || isNaN(finalPrice)) {
                MessageBox.error("Please fill all required fields (Final Price).");
                return;
            }

            try {
                // Fetch payment plan schedule
                const scheduleRes = await fetch(`/odata/v4/real-estate/PaymentPlanSchedules?$filter=paymentPlan_paymentPlanId eq '${paymentPlanId}'&$expand=conditionType,basePrice,frequency`);
                const scheduleData = await scheduleRes.json();
                const aSchedules = scheduleData.value || [];

                // Fetch unit conditions for base prices
                const conditionsRes = await fetch(`/odata/v4/real-estate/Conditions?$filter=unit_unitId eq '${unitId}'`);
                const conditions = await conditionsRes.json();
                const aConditions = conditions.value || [];

                // Generate simulation schedule
                const simulationSchedule = [];
                const today = new Date();

                aSchedules.forEach(schedule => {
                    const basePriceCode = schedule.basePrice?.code;
                    const condition = aConditions.find(c => c.code === basePriceCode);
                    const baseAmount = condition ? Number(condition.amount) : 0;
                    const amount = (baseAmount * schedule.percentage) / 100;
                    const interval = this._getFrequencyInterval(schedule.frequency?.description);  // Get months per installment

                    // 🔹 Updated: Maintenance now repeated like installments with correct due dates
                    if (schedule.conditionType?.description === "Maintenance") {
                        for (let i = 0; i < (schedule.numberOfInstallments || 1); i++) {
                            const monthsToAdd = schedule.dueInMonth + i * interval;
                            const dueDate = new Date(today.getTime() + monthsToAdd * 30 * 24 * 60 * 60 * 1000);
                            simulationSchedule.push({
                                conditionType: schedule.conditionType.description,
                                dueDate: dueDate.toISOString().split('T')[0],
                                amount: 0,
                                maintenance: (amount / Math.max(1, schedule.numberOfInstallments))  // Divide amount across installments
                            });
                        }
                    } else {
                        // Installments (with corrected due dates)
                        for (let i = 0; i < (schedule.numberOfInstallments || 1); i++) {
                            const monthsToAdd = schedule.dueInMonth + i * interval;
                            const dueDate = new Date(today.getTime() + monthsToAdd * 30 * 24 * 60 * 60 * 1000);
                            simulationSchedule.push({
                                conditionType: schedule.conditionType?.description || "Installment",
                                dueDate: dueDate.toISOString().split('T')[0],
                                amount: (amount / Math.max(1, schedule.numberOfInstallments)),
                                maintenance: 0
                            });
                        }
                    }
                });

                // Update simulation output model
                this.getView().setModel(new JSONModel(simulationSchedule), "simulationOutput");

                // Refresh table binding if exists
                const oTable = this.getView().byId("simulationTable");
                if (oTable && oTable.getBinding("items")) {
                    oTable.getBinding("items").refresh();
                }

                // Auto-generate simulationId and set it to local input too
                const simulationId = this._generateId();
                this.getView().byId("simulationIdInput").setValue(simulationId);
                oLocal.setProperty("/simulationId", simulationId);

            } catch (err) {
                MessageBox.error("Simulation failed: " + (err.message || err));
            }
        },


        // 🔹 Helper: Map frequency description to months per installment
        _getFrequencyInterval: function (frequencyDesc) {
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



        /* ----------------------------
           Save simulation (reads unitId from local)
        ---------------------------- */
        onSaveSimulation: async function () {
            const simulationId = this.getView().byId("simulationIdInput").getValue();

            // unitId from local model
            const oLocal = this.getView().getModel("local");
            const unitId = oLocal ? oLocal.getProperty("/unitId") : null;

            const projectId = this.getView().byId("projectIdInput").getValue();
            const paymentPlanId = this.getView().byId("paymentPlanIdInput").getValue();
            const pricePlanYears = parseInt(this.getView().byId("pricePlanInput").getValue());
            const leadId = this.getView().byId("leadIdInput").getValue();
            const finalPrice = Number(oLocal ? oLocal.getProperty("/finalPrice") : NaN);
            const userId = "currentUser";

            const schedule = this.getView().getModel("simulationOutput").getData();

            try {
                const payload = {
                    simulationId,
                    unitId,
                    projectId,
                    pricePlanYears,
                    leadId,
                    finalPrice,
                    userId,
                    schedule: (schedule || []).map(s => ({
                        conditionType: s.conditionType,
                        dueDate: s.dueDate,
                        amount: s.amount,
                        maintenance: s.maintenance
                    }))
                };

                const res = await fetch("/odata/v4/real-estate/PaymentPlanSimulations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Failed to save simulation");
                MessageToast.show("Simulation saved successfully!");
            } catch (err) {
                MessageBox.error("Error: " + (err.message || err));
            }
        },

        _generateId: function () {
            this._idCounter += 1;
            localStorage.setItem("simulationIdCounter", this._idCounter);
            const paddedNumber = ("00000" + this._idCounter).slice(-5);  // Pad to 5 digits
            return "PPS" + paddedNumber;
        },
    });
});
