sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
], (Controller, MessageBox, MessageToast, JSONModel, SelectDialog, StandardListItem) => {
    "use strict";
    return Controller.extend("dboperations.controller.CreateReservation", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("CreateReservation")
                .attachPatternMatched(this._onRouteMatched, this);
            this._oPaymentPlansModel = new JSONModel([]);
            this.getView().setModel(this._oPaymentPlansModel, "paymentPlans");
            this._loadPartners()

        },
        formatDateToYMD: function (oDate) {
            if (!oDate) {
                return null;
            }

            const year = oDate.getFullYear();
            const month = String(oDate.getMonth() + 1).padStart(2, "0");
            const day = String(oDate.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        },
        _parseFormattedNumber: function (sValue) {
            if (typeof sValue === 'number') {
                return sValue;
            }
            if (typeof sValue === 'string') {
                // Remove commas and parse
                return Number(sValue.replace(/,/g, '')) || 0;
            }
            return 0;
        },
        _loadPartners: async function () {
            fetch("/odata/v4/real-estate/ReservationPartners")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "partnersList");
                })
                .catch(err => console.error("Failed to load Partners list:", err));
        },
        _loadPaymentPlansForReservation: async function () {
            try {
                const plansRes = await fetch(
                    "/odata/v4/real-estate/PaymentPlans?$expand=assignedProjects($expand=project)"
                );
                if (!plansRes.ok) {
                    throw new Error(
                        `Failed to fetch payment plans: ${plansRes.status}`
                    );
                }
                const plans = await plansRes.json();
                this._oPaymentPlansModel.setData(plans.value || []);
              
            } catch (err) {
                console.error("Failed to load payment plans for reservation:", err);
                MessageBox.error("Unable to load payment plans. Please try again.");
            }
        },

        _populateAvailableYears: function (projectId) {
            const aPlans = this._oPaymentPlansModel.getData();
            if (!aPlans || aPlans.length === 0) {
                console.warn("No payment plans available for populating years.");
                return;
            }
            const filteredPlans = aPlans.filter(
                (p) =>
                    Array.isArray(p.assignedProjects) &&
                    p.assignedProjects.some((ap) => ap.project?.projectId === projectId)
            );
            const uniqueYears = [
                ...new Set(filteredPlans.map((p) => p.planYears)),
            ].sort((a, b) => a - b);
            const oModel = this.getView().getModel("local");
            oModel.setProperty(
                "/availableYears",
                uniqueYears.map((year) => ({ year: year, text: `${year} Years` }))
            );
            oModel.refresh();
        },

        _loadPartners: async function () {
            fetch("/odata/v4/real-estate/ReservationPartners")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "partnersList");

                })
                .catch(err => console.error("Failed to load Partners list:", err));
        },
        _onRouteMatched: async function (oEvent) {
            this._resetReservationForm();

            var sData = oEvent.getParameter("arguments").reservationData;
            if (!sData) {
                return;
            }
            var oReservation = JSON.parse(decodeURIComponent(sData));

            // Load payment plans first (await to ensure data is available)
            await this._loadPaymentPlansForReservation();

            var bIsEdit = oReservation.mode === "edit";
            var oModel = new sap.ui.model.json.JSONModel({
                availableYears: [], // For populating select items
                selectedPricePlanYears: "",
                selectedSimulationId: "",
                selectedSimulationFinalPrice: oReservation.unitPrice || 0,

                mode: oReservation.mode || "create",
                maintenanceEditable: !bIsEdit, // Disable maintenance editing in edit mode
                isEditMode: bIsEdit,
                title: bIsEdit ? `Edit Reservation - ${oReservation.description || ''}` : "Create Reservation",
                reservationId: bIsEdit ? oReservation.reservationId : "",
                bua: oReservation.bua,
                companyCodeId: oReservation.companyCodeId,
                oldReservationId: oReservation.oldReservationId,
                eoiId: oReservation.eoiId,
                salesType: oReservation.salesType,
                description: oReservation.description,
                validFrom: oReservation.validFrom
                    ? oReservation.validFrom
                    : this.formatDateToYMD(new Date()),
                status: oReservation.status === "O" ? "Open" : oReservation.status || "Open",
                customerType: oReservation.customerType,
                currency: oReservation.currency,
                afterSales: oReservation.afterSales,
                project_projectId: oReservation.project_projectId,
                unit_unitId: oReservation.unit_unitId,
                building_buildingId: oReservation.buildingId,
                unitPrice: oReservation.unitPrice,
                planCurrency: oReservation.planCurrency,
                reservationStatus: "",
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
                paymentPlan_paymentPlanId: oReservation.paymentPlan_paymentPlanId,
                simulations: oReservation.simulations || [],
                unitConditions: oReservation.unitConditions,
                selectedPricePlanYears: "",
                selectedSimulationId: "",
                enableImportExport: false, // Switch to enable/disable import/export buttons
                // result
                conditions: bIsEdit ? oReservation.conditions || [] : [],
                partners: bIsEdit ? oReservation.partners || [] : [],
                payments: bIsEdit ? oReservation.payments || [] : []
            });

            this.getView().setModel(oModel, "local");
            // Populate partner details in edit mode
            if (bIsEdit) {
                const aPartners = oModel.getProperty("/partners") || [];
                const oPartnersListModel = this.getView().getModel("partnersList");
                if (oPartnersListModel) {
                    const aPartnersList = oPartnersListModel.getData();
                    aPartners.forEach((partner) => {
                        if (partner.customerCode) {
                            const oPartnerData = aPartnersList.find(p => p.customerCode === partner.customerCode);
                            if (oPartnerData) {
                                partner.customerName = oPartnerData.customerName || "";
                                partner.customerAddress = oPartnerData.customerAddress || "";
                                if (oPartnerData.validFrom) {
                                    const oDate = new Date(oPartnerData.validFrom);
                                    partner.validFrom = oDate.getFullYear() + "-" +
                                        String(oDate.getMonth() + 1).padStart(2, '0') + "-" +
                                        String(oDate.getDate()).padStart(2, '0');
                                } else {
                                    partner.validFrom = "";
                                }
                            }
                        }
                    });
                    oModel.setProperty("/partners", aPartners);
                    oModel.refresh();
                }
            }
            // Populate available years after model is set and plans are loaded (if unitConditions exist)
            if (oReservation.project_projectId) {
                this._populateAvailableYears(oReservation.project_projectId);
            }

            // For edit mode, load simulations from the unit
            if (bIsEdit && oReservation.unit_unitId) {
                try {
                    const unitRes = await fetch(`/odata/v4/real-estate/Units(unitId='${oReservation.unit_unitId}')?$expand=simulations`);
                    if (unitRes.ok) {
                        const unit = await unitRes.json();
                        let aConditions = unit.unitConditions || [];
                        // Ensure the current pricePlanYears is in the simulations for the Select
                        if (oReservation.pricePlanYears !== undefined && oReservation.pricePlanYears !== null && !aConditions.some(cond => cond.pricePlanYears === String(oReservation.pricePlanYears))) {
                            aConditions.push({
                                ID: `edit-${oReservation.pricePlanYears}`,
                                pricePlanYears: String(oReservation.pricePlanYears),
                                // paymentPlan_paymentPlanId: oReservation.paymentPlan_paymentPlanId || ""
                            });
                        }
                        // Ensure all simulations have pricePlanYears as string
                        aConditions.forEach(sim => {
                            sim.pricePlanYears = String(sim.pricePlanYears);
                        });

                        // Remove duplicates based on pricePlanYears
                        const uniqueSimulations = aConditions.filter((sim, index, self) =>
                            index === self.findIndex(s => s.pricePlanYears === sim.pricePlanYears)
                        );
                        oModel.setProperty("/simulations", uniqueSimulations);
                        oModel.refresh();
                        this.getView().byId("_IDGenSelect2").updateItems();
                        oModel.setProperty("/selectedPricePlanYears", String(oReservation.pricePlanYears));
                        this.getView().byId("_IDGenSelect2").invalidate();
                        setTimeout(() => {
                            this.getView().byId("_IDGenSelect2").setSelectedKey(String(oReservation.pricePlanYears));
                        }, 0);
                        // Don't load conditions from simulation in edit mode - keep existing DB conditions
                        // this._resolveSimulationByYears(Number(oReservation.pricePlanYears));
                    } else {
                        console.error("Failed to load simulations for edit, status:", unitRes.status);
                    }
                } catch (err) {
                    console.error("Failed to load simulations for edit", err);
                }
            } else if (oReservation.unitConditions?.length) {
                const iDefaultYears = oReservation.unitConditions[0].pricePlanYears;
                oModel.setProperty("/selectedPricePlanYears", iDefaultYears);
                oModel.updateBindings(true);
                await this._resolveSimulationByYears(Number(iDefaultYears));
            }

            // For edit mode, ensure conditions have installment as conditionType
            if (bIsEdit) {
                const aConditions = oModel.getProperty("/conditions") || [];
                aConditions.forEach((condition, index) => {
                    condition.installment =
                        condition.conditionType === "Maintenance"
                            ? ""
                            : condition.conditionType || "Installment";
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
                oModel.setProperty("/conditions", aConditions);

                // FIX: Calculate unitPrice from conditions if it's 0
                const currentUnitPrice = oModel.getProperty("/unitPrice") || 0;
                if (currentUnitPrice === 0 && aConditions.length > 0) {
                    const total = aConditions.reduce(
                        (sum, c) => sum + (this._parseFormattedNumber(c.amount) || 0),
                        0
                    );
                    oModel.setProperty("/unitPrice", total);
                }
            }
            if (bIsEdit) {
    const aConditions = oModel.getProperty("/conditions") || [];
    aConditions.forEach((condition, index) => {
        condition.installment = condition.conditionType === "Maintenance" ? "" : condition.conditionType || "Installment";
        condition.previousDueDate = condition.dueDate; // Add this
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
    oModel.setProperty("/conditions", aConditions);
}
        },
        onOpenPricePlanValueHelpReservation: function () {
            const projectId = this.getView()
                .getModel("local")
                .getProperty("/project_projectId");
            const aPlans = this._oPaymentPlansModel.getData();
            const filteredPlans = aPlans.filter(
                (p) =>
                    Array.isArray(p.assignedProjects) &&
                    p.assignedProjects.some((ap) => ap.project?.projectId === projectId)
            );

            if (!this._oPricePlanValueHelp) {
                this._oPricePlanValueHelp = new SelectDialog({
                    title: "Select Payment Plan Year",
                    items: {
                        path: "filteredPlans>/",
                        template: new StandardListItem({
                            title: "{filteredPlans>planYears} Years",
                            description: "{filteredPlans>description}",
                        }),
                    },
                    confirm: function (oEvent) {
                        const oSelectedItem = oEvent.getParameter("selectedItem");
                        if (oSelectedItem) {
                            const oContext =
                                oSelectedItem.getBindingContext("filteredPlans");
                            const oPlan = oContext.getObject();
                            const selectedYear = oPlan.planYears;
                            this.getView()
                                .byId("_IDGenSelect2")
                                .setSelectedKey(selectedYear);
                            this.onPricePlanYearsChange({
                                getSource: () => ({ getSelectedKey: () => selectedYear }),
                            }); // Trigger change
                        }
                    }.bind(this),
                });
                this.getView().addDependent(this._oPricePlanValueHelp);
            }

            this._oPricePlanValueHelp.setModel(
                new JSONModel(filteredPlans),
                "filteredPlans"
            );
            this._oPricePlanValueHelp.open();
        },
        onPricePlanYearsChange: async function (oEvent) {
            const iYears = Number(oEvent.getSource().getSelectedKey());
            const oModel = this.getView().getModel("local");
            oModel.setProperty("/pricePlanYears", iYears);
            oModel.setProperty("/planYears", iYears);

            const bIsEdit = oModel.getProperty("/isEditMode");

            if (bIsEdit) {
                // In edit mode, always run on-the-fly simulation on change to update conditions
                await this._simulateConditionsForReservation(iYears);
            } else {
                // In create mode, try to resolve from existing simulations first
                await this._resolveSimulationByYears(iYears);
                // If no conditions were set (no matching simulation), run on-the-fly simulation
                const aConditions = oModel.getProperty("/conditions") || [];
                if (aConditions.length === 0) {
                    await this._simulateConditionsForReservation(iYears);
                }
            }
        },
        _simulateConditionsForReservation: async function (pricePlanYears) {
            const oModel = this.getView().getModel("local");
            const unitId = oModel.getProperty("/unit_unitId");
            const projectId = oModel.getProperty("/project_projectId");

            if (!unitId) {
                MessageBox.error("Unit ID is missing.");
                return;
            }

            let matchingPlan = null; // Ensure declared at function level

            try {
                // Fetch and filter unit conditions
                const conditionsRes = await fetch(
                    `/odata/v4/real-estate/Conditions?$filter=unit_unitId eq '${unitId}'`
                );
                if (!conditionsRes.ok) {
                    throw new Error(
                        `Failed to fetch conditions: ${conditionsRes.status}`
                    );
                }
                const conditions = await conditionsRes.json();
                const aConditions = conditions.value || [];
                const filteredConditions = aConditions.filter(
                    (c) => c.numberOfYears === pricePlanYears
                );

                if (filteredConditions.length === 0) {
                    throw new Error(`No conditions found for ${pricePlanYears} years.`);
                }

                const finalPrice = filteredConditions.reduce(
                    (sum, c) => sum + Number(c.amount || 0),
                    0
                );
                let simulationSchedule = [];

                if (pricePlanYears === 0) {
                    // Cash: Single installment
                    const today = new Date();
                    simulationSchedule.push({
                        installment: "Cash Payment",
                        conditionType: "Cash",
                        dueDate: today.toISOString().split("T")[0],
                        amount: Math.round(finalPrice * 100) / 100,
                        maintenance: 0,
                    });
                } else {
                    // Find matching plan
                    const aPlans = this._oPaymentPlansModel.getData();
                    matchingPlan = aPlans.find(
                        (p) =>
                            p.planYears === pricePlanYears &&
                            Array.isArray(p.assignedProjects) &&
                            p.assignedProjects.some(
                                (ap) => ap.project?.projectId === projectId
                            )
                    );
              

                    if (!matchingPlan) {
                        throw new Error(
                            `No payment plan found for ${pricePlanYears} years.`
                        );
                    }

                    // ADDED: Extra check and log to ensure matchingPlan is defined
                    if (!matchingPlan || !matchingPlan.paymentPlanId) {
                        throw new Error(
                            "Matching plan is invalid or missing paymentPlanId."
                        );
                    }

                    // Fetch schedules
                    const scheduleRes = await fetch(
                        `/odata/v4/real-estate/PaymentPlanSchedules?$filter=paymentPlan_paymentPlanId eq '${matchingPlan.paymentPlanId}'&$expand=conditionType,basePrice,frequency`
                    );
                    if (!scheduleRes.ok) {
                        throw new Error(
                            `Failed to fetch schedules: ${scheduleRes.status}`
                        );
                    }
                    const scheduleData = await scheduleRes.json();
                    const aSchedules = scheduleData.value || [];
                    const today = new Date();

                    aSchedules.forEach((schedule) => {
                        const basePriceCode = schedule.basePrice?.code;
                        // Use the first filtered condition for base amount
                        const condition = filteredConditions[0];
                        const baseAmount = condition ? this._parseFormattedNumber(condition.amount) : 0;
                        const amount = (baseAmount * schedule.percentage) / 100;
                        const interval = this._getFrequencyIntervalPPS(
                            schedule.frequency?.code
                        );

                        if (schedule.conditionType?.code === "ZZ03") {
                            for (let i = 0; i < (schedule.numberOfInstallments || 1); i++) {
                                const monthsToAdd = schedule.dueInMonth + i * interval;
                                const dueDate = new Date(
                                    today.getTime() + monthsToAdd * 30 * 24 * 60 * 60 * 1000
                                );
                                simulationSchedule.push({
                                    installment: "",
                                    conditionType: "Maintenance",
                                    dueDate: dueDate.toISOString().split("T")[0],
                                    amount: 0,
                                    maintenance:
                                        Math.round(
                                            (amount / Math.max(1, schedule.numberOfInstallments)) *
                                            100
                                        ) / 100,
                                });
                            }
                        } else {
                            let conditionType = "";
                            switch (schedule.conditionType?.code) {
                                case "ZZ01":
                                    conditionType = "Down Payment";
                                    break;
                                case "ZZ02":
                                    conditionType = "Installment";
                                    break;
                                case "ZZ03":
                                    conditionType = "Maintenance";
                                    break;
                                default:
                                    conditionType = "Installment";
                            }

                            for (let i = 0; i < (schedule.numberOfInstallments || 1); i++) {
                                const monthsToAdd = schedule.dueInMonth + i * interval;
                                const dueDate = new Date(
                                    today.getTime() + monthsToAdd * 30 * 24 * 60 * 60 * 1000
                                );
                                simulationSchedule.push({
                                    installment: conditionType,
                                    conditionType: conditionType,
                                    dueDate: dueDate.toISOString().split("T")[0],
                                    amount:
                                        Math.round(
                                            (amount / Math.max(1, schedule.numberOfInstallments)) *
                                            100
                                        ) / 100,
                                    maintenance: 0,
                                });
                            }
                        }
                    });
                }

                // Sort and set to conditions
                // simulationSchedule.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
                // oModel.setProperty(
                //     "/conditions",
                //     simulationSchedule.map((s) => ({
                //         ID: this._generateUUID(),
                //         installment: s.installment,
                //         conditionType: s.conditionType,
                //         dueDate: s.dueDate,
                //         amount: s.amount,
                //         maintenance: s.maintenance,
                //     }))
                // );
const mergedConditions = this._mergeConditionsByDueDate(simulationSchedule);
mergedConditions.forEach(c => {
    c.previousDueDate = c.dueDate;
    // Format numbers with comma separators - handle both numbers and strings
    if (typeof c.amount === 'number') {
        c.amount = c.amount.toLocaleString('en-US');
    } else if (typeof c.amount === 'string' && !c.amount.includes(',')) {
        const numValue = parseFloat(c.amount.replace(/,/g, ''));
        if (!isNaN(numValue)) {
            c.amount = numValue.toLocaleString('en-US');
        }
    }
    if (typeof c.maintenance === 'number') {
        c.maintenance = c.maintenance.toLocaleString('en-US');
    } else if (typeof c.maintenance === 'string' && !c.maintenance.includes(',')) {
        const numValue = parseFloat(c.maintenance.replace(/,/g, ''));
        if (!isNaN(numValue)) {
            c.maintenance = c.maintenance.toLocaleString('en-US');
        }
    }
});
oModel.setProperty("/conditions", mergedConditions);
                oModel.setProperty("/conditions", mergedConditions);

                oModel.setProperty("/selectedSimulationFinalPrice", finalPrice);
                oModel.setProperty(
                    "/paymentPlan_paymentPlanId",
                    matchingPlan?.paymentPlanId || ""
                ); // Safe access
                oModel.setProperty("/unitPrice", finalPrice);
                oModel.refresh(); // Force model refresh
              
            } catch (err) {
                console.error("Simulation error:", err); // Debug log
                MessageBox.error("Simulation failed: " + (err.message || err));
                // ADDED: In case of error, don't clear conditions in edit mode
                const bIsEdit = oModel.getProperty("/isEditMode");
                if (!bIsEdit) {
                    oModel.setProperty("/conditions", []);
                }
            }
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
    .filter((s) => s.conditionType !== "Total")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((s, index) => ({
        ID: this._generateUUID(),
        installment: s.conditionType === "Maintenance" ? "" : s.conditionType,
        conditionType: s.conditionType,
        dueDate: s.dueDate,
        amount: typeof s.amount === 'number' ? s.amount.toLocaleString('en-US') : (typeof s.amount === 'string' && !s.amount.includes(',') ? parseFloat(s.amount.replace(/,/g, '')) : s.amount).toLocaleString('en-US'),
        maintenance: typeof s.maintenance === 'number' ? s.maintenance.toLocaleString('en-US') : (typeof s.maintenance === 'string' && !s.maintenance.includes(',') ? parseFloat(s.maintenance.replace(/,/g, '')) : s.maintenance).toLocaleString('en-US'),
        previousDueDate: s.dueDate, // Add this
    }));
oModel.setProperty("/conditions", aConditions);

        },
        _mergeConditionsByDueDate: function (aConditions) {
            const mByDate = {};

            aConditions.forEach(c => {
                const sDate = c.dueDate;

                if (!mByDate[sDate]) {
                    mByDate[sDate] = {
                        ID: this._generateUUID(),
                        installment: c.installment || "Installment",
                        conditionType: c.conditionType,
                        dueDate: sDate,
                        amount: 0,
                        maintenance: 0
                    };
                }

                if (c.amount && c.amount > 0) {
                    mByDate[sDate].amount += c.amount;
                    mByDate[sDate].installment = c.installment || "Installment";
                    mByDate[sDate].conditionType = c.conditionType;
                }

                if (c.maintenance && c.maintenance > 0) {
                    mByDate[sDate].maintenance += c.maintenance;
                }
            });

            return Object.values(mByDate)
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        }
        ,
        _resolveSimulationByYears: async function (iYears) {
            const oModel = this.getView().getModel("local");
            const aCond = oModel.getProperty("/unitConditions") || [];

            const oSelectedSim = aCond.find(
                (cond) => Number(cond.pricePlanYears) === iYears
            );

            if (!oSelectedSim) {
                // For edit mode, don't clear conditions if no sim found; keep existing pre-loaded conditions
                if (!oModel.getProperty("/isEditMode")) {
                    oModel.setProperty("/conditions", []);
                }
                return;
            }

            oModel.setProperty("/selectedPricePlanYears", String(iYears));
            oModel.setProperty("/selectedSimulationId", oSelectedSim.simulationId);
            oModel.setProperty(
                "/selectedSimulationFinalPrice",
                oSelectedSim.finalPrice
            );

            oModel.setProperty(
                "/paymentPlan_paymentPlanId",
                oSelectedSim.paymentPlan_paymentPlanId
            );
         
            await this._loadConditionsFromSimulation(oSelectedSim.simulationId);
        },
        _getFrequencyIntervalPPS: function (frequencyCode) {
            if (!frequencyCode) return 12;
            switch (frequencyCode) {
                case "Z01":
                    return 1;
                case "Z02":
                    return 3;
                case "Z03":
                    return 6;
                case "Z04":
                    return 12;
                default:
                    return 12;
            }
        },
        _reserveUnit: async function (sUnitId) {
            if (!sUnitId) return;

            const res = await fetch(
                `/odata/v4/real-estate/Units(unitId='${sUnitId}')`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        unitStatusDescription: "Reserved",
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to update unit status");
            }
        },
        _generateUUID: function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (c) {
                    const r = (Math.random() * 16) | 0,
                        v = c === "x" ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                }
            );
        },
        onSaveReservation: async function () {
            const oModel = this.getView().getModel("local");
            const oData = oModel.getData();
            const bIsEdit = oData.mode === "edit";
            
            // Validate that condition amounts equal unit price in edit mode
            if (bIsEdit) {
                const totalConditionAmount = oData.conditions.reduce(
                    (sum, c) => sum + (this._parseFormattedNumber(c.amount) || 0),
                    0
                );
                const unitPrice = Number(oData.unitPrice) || 0;

                if (Math.abs(totalConditionAmount - unitPrice) > 0.01) { // Allow small floating-point tolerance
                    MessageBox.error(`The total amount of conditions (${totalConditionAmount.toFixed(2)}) must equal the unit price (${unitPrice.toFixed(2)}). Please adjust the condition amounts.`);
                    return;
                }
            }
            // Show loading indicator
            this.getView().setBusy(true);
            // For edit mode, use existing reservationId; for create, generate new one
            const reservationId = bIsEdit
                ? oData.reservationId
                : this._generateUUID();

            const transformedConditions = oData.conditions.map((c, index) => ({
                ID: c.ID || this._generateUUID(),
                installment: c.installment || "Installment",
                conditionType: c.conditionType || c.installment,
                dueDate: c.dueDate
                    ? new Date(c.dueDate).toISOString().split("T")[0]
                    : null,
                amount: this._parseFormattedNumber(c.amount) ?? 0,
                maintenance: this._parseFormattedNumber(c.maintenance) ?? 0,
                reservation_reservationId: reservationId,
            }));


            // Fixed: Transform partners to match ReservationPartners entity
            const transformedPartners = oData.partners.map((p) => ({
                ID: p.ID || this._generateUUID(),
                customerCode: p.customerCode || "",
                customerName: p.customerName || "",
                customerAddress: p.customerAddress || "",
                validFrom: p.validFrom
                    ? new Date(p.validFrom).toISOString().split("T")[0]
                    : null,
            }));

            // Fixed: Transform payments to match ReservationPayments entity
            const transformedPayments = oData.payments.map((p) => ({
                ID: p.ID || this._generateUUID(),
                receiptType: p.receiptType || "",
                receiptStatus: p.receiptStatus || "",
                paymentMethod: p.paymentMethod || "",
                amount: p.amount || 0,
                houseBank: p.houseBank || "",
                bankAccount: p.bankAccount || "",
                dueDate: p.dueDate
                    ? new Date(p.dueDate).toISOString().split("T")[0]
                    : null,
                transferNumber: p.transferNumber || "",
                checkNumber: p.checkNumber || "",
                customerBank: p.customerBank || "",
                customerBankAccount: p.customerBankAccount || "",
                branch: p.branch || "",
                collectedAmount: p.collectedAmount || 0,
                arValidated: p.arValidated || false,
                rejectionReason: p.rejectionReason || "",
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
                reservationStatus: oData.reservationStatus || "",
                validFrom: oData.validFrom
                    ? new Date(oData.validFrom).toISOString().split("T")[0]
                    : null,
                status: oData.status || "O", // Default to 'O' (Open)
                customerType: oData.customerType || "",
                currency: oData.currency || "",
                afterSales: oData.afterSales || "",
                project_projectId: oData.project_projectId || "", // Association
                building_buildingId: oData.building_buildingId || "",
                unit_unitId: oData.unit_unitId || "",
                bua: oData.bua || 0,
                reservationType: oData.reservationType,
                unitType: oData.unitType,
                phase: oData.phase || "",
                paymentPlan_paymentPlanId: oData.paymentPlan_paymentPlanId || "",
                unitPrice: this._parseFormattedNumber(oData.unitPrice) || 0,
                planCurrency: oData.planCurrency || "",
                requestType: oData.requestType || "",
                reason: oData.reason || "",
                cancellationDate: oData.cancellationDate
                    ? new Date(oData.cancellationDate).toISOString().split("T")[0]
                    : null,
                cancellationStatus: oData.cancellationStatus || "",
                rejectionReason: oData.rejectionReason || "",
                cancellationFees: oData.cancellationFees || 0,
                partners: transformedPartners, // Composition
                conditions: transformedConditions, // Composition
                payments: transformedPayments, // Composition
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
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(
                        `Failed to ${bIsEdit ? "update" : "create"} reservation: ${res.status
                        } - ${errorText}`
                    );
                }

                await this._reserveUnit(oData.unit_unitId);

                // Save simulation to unit for future edits (only for create mode)
                if (!bIsEdit) {
                    await this._saveSimulationToUnit(oData);
                }

                /* 3️⃣ Success + Navigate */
                MessageToast.show("Reservation created. Unit is now reserved.");
                MessageToast.show(
                    `Reservation ${bIsEdit ? "updated" : "created"} successfully!`
                );
                this._resetReservationForm();
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Reservations");
            } catch (err) {
                console.error("Save error:", err);
                MessageBox.error(err.message);
            } finally {
                // Hide loading indicator
                this.getView().setBusy(false);
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
        onCustomerCodeChange: function (oEvent) {
            const oSelect = oEvent.getSource();
            const sSelectedCode = oSelect.getSelectedKey();

            if (!sSelectedCode) {
                console.log("No code selected");
                return;
            }
            if (!sSelectedCode) {
                return;
            }

            const oPartnersModel = this.getView().getModel("partnersList");
            const aPartners = oPartnersModel.getData();
            const oSelectedPartner = aPartners.find(partner =>
                partner.customerCode === sSelectedCode
            );

            if (!oSelectedPartner) {
                console.warn("No partner found for code:", sSelectedCode);
                return;
            }

            const oContext = oSelect.getBindingContext("local");
            const sRowPath = oContext.getPath(); // e.g. "/partners/2"

            const oLocalModel = this.getView().getModel("local");

            oLocalModel.setProperty(sRowPath + "/customerName", oSelectedPartner.customerName || "");
            oLocalModel.setProperty(sRowPath + "/customerAddress", oSelectedPartner.customerAddress || "");

            let sValidFrom = "";
            if (oSelectedPartner.validFrom) {
                const oDate = new Date(oSelectedPartner.validFrom);
                sValidFrom = oDate.getFullYear() + "-" +
                    String(oDate.getMonth() + 1).padStart(2, '0') + "-" +
                    String(oDate.getDate()).padStart(2, '0');
            }
            oLocalModel.setProperty(sRowPath + "/validFrom", sValidFrom);
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
        },
         onDueDateChange: function (oEvent) {
            const oDatePicker = oEvent.getSource();
            const sDueDate = oDatePicker.getValue();
            const oModel = this.getView().getModel("local");
            const iPricePlanYears = oModel.getProperty("/selectedPricePlanYears");
            const sValidFrom = oModel.getProperty("/validFrom");

            if (!sDueDate || !iPricePlanYears || !sValidFrom) {
                return; // No validation if date, years, or valid from not set
            }

            const oDueDate = new Date(sDueDate);
            const oValidFrom = new Date(sValidFrom);
            const iDueYear = oDueDate.getFullYear();
            const iStartYear = oValidFrom.getFullYear();

            if (iDueYear < iStartYear) {
                MessageBox.error(`Due date year must be ${iStartYear} or later based on the valid from date.`);
                // Reset the date picker to empty or previous value
                oDatePicker.setValue("");
                return;
            }
        },
         onCancelReservation: function () {
            const oModel = this.getView().getModel("local");
            const bIsEdit = oModel.getProperty("/isEditMode");
            this.getView().getModel("local").setData({}); // Clear form
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            if (bIsEdit) {
                oRouter.navTo("Reservations"); // Navigate back to reservations in edit mode
            } else {
                oRouter.navTo("Units"); // Navigate back to units in create mode
            }
        },
        _saveSimulationToUnit: async function (oData) {
            const simulationId = this._generateUUID();
            const schedule = oData.conditions.map((c) => ({
                ID: this._generateUUID(),
                conditionType: c.conditionType || c.installment,
                dueDate: c.dueDate,
                amount: this._parseFormattedNumber(c.amount),
                maintenance: this._parseFormattedNumber(c.maintenance),
                simulation_simulationId: simulationId,
            }));

            const simulationPayload = {
                simulationId: simulationId,
                pricePlanYears: oData.pricePlanYears,
                finalPrice: this._parseFormattedNumber(oData.selectedSimulationFinalPrice) || 0,
                paymentPlan_paymentPlanId: oData.paymentPlan_paymentPlanId,
                unit_unitId: oData.unit_unitId,
                schedule: schedule,
            };

            try {
                const res = await fetch(
                    "/odata/v4/real-estate/PaymentPlanSimulations",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(simulationPayload),
                    }
                );

                if (!res.ok) {
                    console.error("Failed to save simulation to unit");
                } else {
                    console.log("Simulation saved to unit successfully");
                }
            } catch (err) {
                console.error("Error saving simulation:", err);
            }
        },
        // Updated: Export conditions to XLSX (with XLSX check)
        onExportConditions: function () {
            if (typeof XLSX === "undefined") {
                MessageBox.error("XLSX library is not loaded. Please refresh the page and try again.");
                return;
            }

            const oModel = this.getView().getModel("local");
            const aConditions = oModel.getProperty("/conditions") || [];
            if (aConditions.length === 0) {
                MessageToast.show("No conditions to export.");
                return;
            }

            // Prepare data for XLSX
            const aExportData = aConditions.map(condition => ({
                installment: condition.installment || "",
                "due date": condition.dueDate || "",
                amount: condition.amount || 0,
                maintenance: condition.maintenance || 0
            }));

            // Create XLSX workbook and sheet
            const ws = XLSX.utils.json_to_sheet(aExportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Conditions");

            // Download as XLSX
            XLSX.writeFile(wb, "Conditions.xlsx");
            MessageToast.show("Conditions exported as XLSX.");
        },

        // Updated: Import conditions from XLSX (with XLSX check)
        onImportConditions: function () {
            if (typeof XLSX === "undefined") {
                MessageBox.error("XLSX library is not loaded. Please refresh the page and try again.");
                return;
            }
debugger
            const oModel = this.getView().getModel("local");
            const aOriginalConditions = oModel.getProperty("/conditions") || [];
            const originalTotalAmount = aOriginalConditions.reduce((sum, c) => sum + (this._parseFormattedNumber(c.amount) || 0), 0);

            // Create file uploader (restricted to .xlsx)
            var oFileUploader = new sap.ui.unified.FileUploader({
                width: "100%",
                fileType: ["xlsx"],  // Only .xlsx allowed
                sameFilenameAllowed: true,
                change: (oEvent) => {
                    const oFile = oEvent.getParameter("files")[0];
                    if (!oFile) return;
debugger
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: "array" });
                            const sheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[sheetName];
                            const jsonData = XLSX.utils.sheet_to_json(worksheet);

                            // Validate and map data
                            let newTotalAmount = 0;
                            const iPricePlanYears = oModel.getProperty("/selectedPricePlanYears");
                            const sValidFrom = oModel.getProperty("/validFrom");
                            const unitPrice = this._parseFormattedNumber(oModel.getProperty("/unitPrice")) || 0;
                            const aUpdatedConditions = aOriginalConditions.map((original, index) => {
                                const imported = jsonData[index];
                                if (!imported) return original;  // If no row in Excel, keep original

                                let dueDate = imported["due date"];
                                const amount = this._parseFormattedNumber(imported.amount) || 0;
                                const maintenance = original.maintenance; // Maintenance cannot be edited with import

                                // Convert Excel serial date if it's a number
                                if (typeof dueDate === 'number') {
                                    dueDate = this.excelSerialToDate(dueDate);
                                }

                                // Validate due date format
                                if (dueDate && isNaN(new Date(dueDate).getTime())) {
                                    throw new Error(`Invalid due date in row ${index + 1}`);
                                }

                                // Validate due date range
                                if (dueDate && iPricePlanYears && sValidFrom) {
                                    const oDueDate = new Date(dueDate);
                                    const oValidFrom = new Date(sValidFrom);
                                    const iDueYear = oDueDate.getFullYear();
                                    const iStartYear = oValidFrom.getFullYear();

                                    if (iDueYear < iStartYear) {
                                        throw new Error(`Due date year in row ${index + 1} must be ${iStartYear} or later based on the valid from date.`);
                                    }
                                }

                                newTotalAmount += amount;

                                return {
                                    ...original,
                                    dueDate: dueDate || original.dueDate,
                                    amount: amount,
                                    maintenance: maintenance
                                };
                            });

                            // Merge conditions for consistent validation
                            const mergedConditions = this._mergeConditionsByDueDate(aUpdatedConditions);

                            // Validate total amount matches unit price (ignoring maintenance)
                            if (Math.abs(newTotalAmount - unitPrice) > 0.01) {  // Allow small floating-point tolerance
                                throw new Error(`Total Amount (${newTotalAmount}) does not match unit price (${unitPrice}). Import canceled.`);
                            }

                            // Validate that all installments are equal (no installment greater than others)
                            const installmentAmounts = mergedConditions
                                .filter(c => c.conditionType === "Installment" && c.amount > 0)
                                .map(c => c.amount);
                            if (installmentAmounts.length > 1) {
                                const firstAmount = installmentAmounts[0];
                                const allEqual = installmentAmounts.every(amount => Math.abs(amount - firstAmount) < 0.01);
                                if (!allEqual) {
                                    throw new Error("All installments must be equal. No installment should be greater than others.");
                                }
                            }

                            // Update model
                            const formattedConditions = aUpdatedConditions.map(c => {
                                let formattedAmount = c.amount;
                                let formattedMaintenance = c.maintenance;
                                
                                if (typeof c.amount === 'number') {
                                    formattedAmount = c.amount.toLocaleString('en-US');
                                } else if (typeof c.amount === 'string' && !c.amount.includes(',')) {
                                    const numValue = parseFloat(c.amount.replace(/,/g, ''));
                                    if (!isNaN(numValue)) {
                                        formattedAmount = numValue.toLocaleString('en-US');
                                    }
                                }
                                
                                if (typeof c.maintenance === 'number') {
                                    formattedMaintenance = c.maintenance.toLocaleString('en-US');
                                } else if (typeof c.maintenance === 'string' && !c.maintenance.includes(',')) {
                                    const numValue = parseFloat(c.maintenance.replace(/,/g, ''));
                                    if (!isNaN(numValue)) {
                                        formattedMaintenance = numValue.toLocaleString('en-US');
                                    }
                                }
                                
                                return {
                                    ...c,
                                    amount: formattedAmount,
                                    maintenance: formattedMaintenance
                                };
                            });
                            oModel.setProperty("/conditions", formattedConditions);
                            oModel.refresh();
                            MessageToast.show("Conditions imported successfully.");
                            oImportDialog.close();  // Close dialog on success
                        } catch (error) {
                            MessageBox.error("Import failed: " + error.message);
                        }
                    };
                    reader.readAsArrayBuffer(oFile);
                }
            });

            // Create dialog content
            var oDialogContent = new sap.m.VBox({ items: [oFileUploader] });
debugger
            // Create and open dialog
            var oImportDialog = new sap.m.Dialog({
                title: "Import Conditions from XLSX",
                contentWidth: "400px",
                contentHeight: "auto",
                content: [oDialogContent],
                buttons: [
                    new sap.m.Button({
                        text: "Close",
                        press: function () {
                            oImportDialog.close();
                        }
                    })
                ],
                afterClose: function () {
                    oImportDialog.destroy();  // Clean up
                }
            });

            oImportDialog.open();
        },
        excelSerialToDate: function (serial) {
            // Excel serial date starts from 1900-01-01 as day 1
            // JavaScript Date starts from 1970-01-01
            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            const daysSinceEpoch = serial - 1; // Subtract 1 because Excel considers 1900-01-01 as day 1
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            const date = new Date(excelEpoch.getTime() + daysSinceEpoch * millisecondsPerDay);

            // Format to YYYY-MM-DD
            return this.formatDateToYMD(date);
        },
   onDueDateChange: function (oEvent) {
    const oDatePicker = oEvent.getSource();
    const sDueDate = oDatePicker.getValue();
    const oModel = this.getView().getModel("local");
    const iPricePlanYears = oModel.getProperty("/selectedPricePlanYears");
    const sValidFrom = oModel.getProperty("/validFrom");

    if (!sDueDate || !iPricePlanYears || !sValidFrom) {
        return; // No validation if date, years, or valid from not set
    }

    const oDueDate = new Date(sDueDate);
    const oValidFrom = new Date(sValidFrom);
    const iDueYear = oDueDate.getFullYear();
    const iStartYear = oValidFrom.getFullYear();

    if (iDueYear < iStartYear) {
        MessageBox.error(`Due date year must be ${iStartYear} or later based on the valid from date.`);
        // Reset the date picker to the previous value
        const oContext = oDatePicker.getBindingContext("local");
        const sPath = oContext.getPath();
        const previousDueDate = oModel.getProperty(sPath + "/previousDueDate");
        oDatePicker.setValue(previousDueDate || "");
        return;
    }

    // Get the index of the changed condition
    const oContext = oDatePicker.getBindingContext("local");
    const sPath = oContext.getPath();
    const iIndex = parseInt(sPath.split("/").pop());
    const aConditions = oModel.getProperty("/conditions");

    // Set the new due date for the changed condition
    aConditions[iIndex].dueDate = sDueDate;
    aConditions[iIndex].previousDueDate = sDueDate;

    // Shift all subsequent due dates by one month each
    for (let i = iIndex + 1; i < aConditions.length; i++) {
        const previousDueDate = new Date(aConditions[i - 1].dueDate);
        const newDueDate = new Date(previousDueDate);
        newDueDate.setMonth(newDueDate.getMonth() + 1); // Add one month
        aConditions[i].dueDate = this.formatDateToYMD(newDueDate);
        aConditions[i].previousDueDate = aConditions[i].dueDate; // Update previousDueDate
    }

    oModel.refresh();
},

    });
});
