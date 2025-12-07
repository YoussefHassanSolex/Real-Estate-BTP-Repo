sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("dboperations.controller.PaymentPlans", {

        onInit: function () {
            this.oModel = this.getView().getModel();
            this._loadPlans();
            this._loadDropdownData(); // 🔹 Load dropdown master data
                        this._idCounter = parseInt(localStorage.getItem("simulationIdCounter")) || 0;

        },

        // 🔹 Load dropdown master data for value help dialogs
        _loadDropdownData: async function () {
            try {
                const urls = [
                    "/odata/v4/real-estate/ConditionTypes",
                    "/odata/v4/real-estate/BasePrices",
                    "/odata/v4/real-estate/CalculationMethods",
                    "/odata/v4/real-estate/Frequencies",
                    "/odata/v4/real-estate/Projects"
                ];

                // Fetch all with individual error handling
                const results = await Promise.allSettled(urls.map(async (u) => {
                    try {
                        const res = await fetch(u);
                        if (!res.ok) throw new Error(`HTTP ${res.status} for ${u}`);
                        return await res.json();
                    } catch (err) {
                        console.error(`❌ Failed to fetch ${u}:`, err);
                        return { value: [] }; // Return empty array on failure
                    }
                }));

                const [ct, bp, cm, fr, pr] = results.map(r => r.status === 'fulfilled' ? r.value : { value: [] });

                const oDropdowns = new JSONModel({
                    conditionTypes: (ct.value || []).map(i => ({
                        code: i.code || i.conditionTypeId || i.id,
                        description: i.description || i.conditionTypeDescription
                    })),

                    basePrices: (bp.value || []).map(i => ({
                        code: i.code || i.basePriceId || i.id,
                        description: i.description || i.basePriceDescription
                    })),

                    calculationMethods: (cm.value || []).map(i => ({
                        code: i.code || i.calculationMethodId || i.id,
                        description: i.description || i.calculationMethodDescription
                    })),

                    frequencies: (fr.value || []).map(i => ({
                        code: i.code || i.frequencyId || i.id,
                        description: i.description || i.frequencyDescription
                    })),

                    projects: (pr.value || []).map(i => ({
                        code: i.projectId,
                        description: i.projectDescription
                    })),

                    planStatuses: [
                        { code: "A", description: "Approved" },
                        { code: "I", description: "Initial" }
                    ]

                });

                this.getView().setModel(oDropdowns, "dropdowns");
                console.log("✅ Dropdown data loaded", oDropdowns.getData());
                console.log("RAW ConditionTypes:", ct);
                console.log("RAW BasePrices:", bp);
                console.log("RAW CalcMethods:", cm);
                console.log("RAW Frequencies:", fr);
                console.log("RAW Projects:", pr);

            } catch (err) {
                console.error("❌ Overall error loading dropdown data:", err);
                MessageBox.error("Failed to load dropdown data. Check console for details.");
            }
        },

        // Load all payment plans
        _loadPlans: function () {
            // 🔹 Fixed: Deep expand associations in schedule and assignedProjects
            fetch("/odata/v4/real-estate/PaymentPlans?$expand=schedule($expand=conditionType,basePrice,calculationMethod,frequency),assignedProjects($expand=project)")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "plans");
                })
                .catch(err => console.error("Failed to load plans:", err));
        },

        // Show plan details dialog
        onShowPlanDetails: async function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("plans");
            if (!oCtx) return;
            const sPlanId = oCtx.getProperty("paymentPlanId");

            try {
                // 🔹 Fixed: Deep expand associations in schedule and assignedProjects
                const res = await fetch(
                    `/odata/v4/real-estate/PaymentPlans(paymentPlanId='${sPlanId}')?$expand=schedule($expand=conditionType,basePrice,calculationMethod,frequency),assignedProjects($expand=project)`
                );
                if (!res.ok) throw new Error("Failed to load plan details");
                const oData = await res.json();
                const oPlan = oData.value ? oData.value[0] : oData;
                const oDialogModel = new JSONModel(oPlan);

                if (!this._oDetailsDialog) {
                    this._oDetailsDialog = new sap.m.Dialog({
                        title: "Payment Plan Details",
                        contentWidth: "90%",
                        resizable: true,
                        draggable: true,
                        content: [
                            new sap.m.IconTabBar({
                                items: [
                                    new sap.m.IconTabFilter({
                                        text: "General Info",
                                        content: [
                                            new sap.ui.layout.form.SimpleForm({
                                                editable: false,
                                                content: [
                                                    new sap.m.Label({ text: "Payment Plan ID" }),
                                                    new sap.m.Text({ text: "{/paymentPlanId}" }),
                                                    new sap.m.Label({ text: "Description" }),
                                                    new sap.m.Text({ text: "{/description}" }),
                                                    new sap.m.Label({ text: "Company Code" }),
                                                    new sap.m.Text({ text: "{/companyCodeId}" }),
                                                    new sap.m.Label({ text: "Years" }),
                                                    new sap.m.Text({ text: "{/planYears}" }),
                                                    new sap.m.Label({ text: "Valid From" }),
                                                    new sap.m.Text({ text: "{/validFrom}" }),
                                                    new sap.m.Label({ text: "Valid To" }),
                                                    new sap.m.Text({ text: "{/validTo}" }),
                                                    new sap.m.Label({ text: "Status" }),
                                                    new sap.m.Text({ text: "{/planStatus}" })
                                                ]
                                            })
                                        ]
                                    }),
                                    new sap.m.IconTabFilter({
                                        text: "Schedules",
                                        content: [
                                            new sap.m.Table({
                                                columns: [
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Condition Type" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Base Price" }) }),
                                                    // new sap.m.Column({ header: new sap.m.Label({ text: "Calculation Method" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Frequency" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "%" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Due (Months)" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Installments" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Years" }) })
                                                ],
                                                items: {
                                                    path: "/schedule",
                                                    template: new sap.m.ColumnListItem({
                                                        cells: [
                                                            new sap.m.Text({ text: "{conditionType/description}" }),
                                                            new sap.m.Text({ text: "{basePrice/description}" }),
                                                            // new sap.m.Text({ text: "{calculationMethod/description}" }),
                                                            new sap.m.Text({ text: "{frequency/description}" }),
                                                            new sap.m.Text({ text: "{percentage}" }),
                                                            new sap.m.Text({ text: "{dueInMonth}" }),
                                                            new sap.m.Text({ text: "{numberOfInstallments}" }),
                                                            new sap.m.Text({ text: "{numberOfYears}" })
                                                        ]
                                                    })
                                                }
                                            })
                                        ]
                                    }),
                                    new sap.m.IconTabFilter({
                                        text: "Assigned Projects",
                                        content: [
                                            new sap.m.Table({
                                                columns: [
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Project ID" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) })
                                                ],
                                                items: {
                                                    path: "/assignedProjects",
                                                    template: new sap.m.ColumnListItem({
                                                        cells: [
                                                            new sap.m.Text({ text: "{project/projectId}" }),
                                                            new sap.m.Text({ text: "{project/projectDescription}" })
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
                            press: function () {
                                this._oDetailsDialog.close();
                            }.bind(this)
                        })
                    });

                    this.getView().addDependent(this._oDetailsDialog);
                }

                this._oDetailsDialog.setModel(oDialogModel);
                this._oDetailsDialog.open();

            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },

        // Add / Edit
        onAddPlan: function () {
            this._openPlanDialog({});
        },

        onEditPlan: async function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("plans");
            const sPlanId = oCtx.getProperty("paymentPlanId");

            try {
                // 🔹 Fixed: Deep expand associations in schedule and assignedProjects
                const res = await fetch(`/odata/v4/real-estate/PaymentPlans(paymentPlanId='${sPlanId}')?$expand=schedule($expand=conditionType,basePrice,calculationMethod,frequency),assignedProjects($expand=project)`);
                if (!res.ok) throw new Error("Failed to load payment plan for edit");
                const oData = await res.json();
                const oPlan = oData.value ? oData.value[0] : oData;
                this._openPlanDialog(oPlan);
            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },

        // Dialog
        _openPlanDialog: function (oPlan) {
            if (!this._oAddDialog) {
                this._oAddDialog = this.getView().byId("planDialog");
            }

            // 🔹 Fixed: Map schedules to include expanded associations as objects for binding
            const schedules = (oPlan.schedule || []).map(item => ({
                conditionType: item.conditionType ? { code: item.conditionType.code, description: item.conditionType.description } : {},
                basePrice: item.basePrice ? { code: item.basePrice.code, description: item.basePrice.description } : {},
                calculationMethod: item.calculationMethod ? { code: item.calculationMethod.code, description: item.calculationMethod.description } : {},
                frequency: item.frequency ? { code: item.frequency.code, description: item.frequency.description } : {},
                percentage: item.percentage || 0,
                dueInMonth: item.dueInMonth || 0,
                numberOfInstallments: item.numberOfInstallments || 0,
                numberOfYears: item.numberOfYears || 0
            }));

            const oModel = new JSONModel({
                paymentPlanId: oPlan.paymentPlanId || "",
                description: oPlan.description || "",
                companyCodeId: oPlan.companyCodeId || "",
                planYears: oPlan.planYears || 0,
                validFrom: oPlan.validFrom || "",
                validTo: oPlan.validTo || "",
                planStatus: oPlan.planStatus || "",
                schedules: schedules,
                projects: (oPlan.assignedProjects || []).map(p => ({
                    projectId: p.project?.projectId || "",
                    projectDescription: p.project?.projectDescription || ""
                }))
            });

            this._oAddDialog.setModel(oModel, "local");
            this._oAddDialog.open();
        },

   onSavePlan: async function () {
    const oDialog = this._oAddDialog;
    const oModel = oDialog.getModel("local");
    const oData = oModel.getData();

    // Validation: Required fields
    if (!oData.validFrom) {
        MessageBox.error("Valid From is required.");
        return;
    }
    if (!oData.validTo) {
        MessageBox.error("Valid To is required.");
        return;
    }

    // Validation: Date parsing and order
    const validFromDate = new Date(oData.validFrom);
    const validToDate = new Date(oData.validTo);
    if (isNaN(validFromDate.getTime()) || isNaN(validToDate.getTime())) {
        MessageBox.error("Valid From and Valid To must be valid dates.");
        return;
    }
    if (validToDate < validFromDate) {
        MessageBox.error("Valid To cannot be earlier than Valid From.");
        return;
    }

    // Validation: Date span must match plan years
    // const planYears = parseInt(oData.planYears) || 0;
    // const expectedValidTo = new Date(validFromDate);
    // expectedValidTo.setFullYear(expectedValidTo.getFullYear() + planYears);
    // if (validToDate < expectedValidTo) {
    //     MessageBox.error(`Valid To must be at least ${planYears} years after Valid From. Expected: ${expectedValidTo.toISOString().split('T')[0]} or later.`);
    //     return;
    // }

    try {
        // 🔹 Fixed: Map schedules to send foreign keys (not objects)
        const schedules = (oData.schedules || []).map(item => ({
            conditionType_code: item.conditionType?.code || "",  // Send foreign key
            basePrice_code: item.basePrice?.code || "",
            calculationMethod_code: item.calculationMethod?.code || "",
            frequency_code: item.frequency?.code || "",
            percentage: item.percentage || 0,
            dueInMonth: item.dueInMonth || 0,
            numberOfInstallments: item.numberOfInstallments || 0,
            numberOfYears: item.numberOfYears || 0
        }));

        // 🔹 Fixed: Map projects to send foreign key
        const assignedProjects = (oData.projects || []).map(p => ({
            project_projectId: p.projectId || ""  // Send foreign key
        }));

        const payload = {
            paymentPlanId: oData.paymentPlanId || this._generateId(),
            description: oData.description,
            companyCodeId: oData.companyCodeId,
            planYears: oData.planYears,
            validFrom: oData.validFrom,
            validTo: oData.validTo,
            planStatus: oData.planStatus,
            schedule: schedules,
            assignedProjects: assignedProjects
        };

        const method = oData.paymentPlanId ? "PUT" : "POST";
        const url = oData.paymentPlanId
            ? `/odata/v4/real-estate/PaymentPlans(paymentPlanId='${oData.paymentPlanId}')`
            : `/odata/v4/real-estate/PaymentPlans`;

        // Debug logs
        console.log("Schedules payload:", schedules);
        console.log("Assigned projects payload:", assignedProjects);

        // Validation: Total percentage must be 100
        const totalPercentage = (oData.schedules || []).reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
        if (totalPercentage !== 100) {
            MessageBox.error(`Total percentage must be 100. Current: ${totalPercentage}`);
            return;  // Prevent save
        }

        // Validation: Total years in schedules must equal plan years
        // const totalYears = (oData.schedules || []).reduce((sum, s) => sum + (parseInt(s.numberOfYears) || 0), 0);
        // if (totalYears !== planYears) {
        //     MessageBox.error(`Total years in schedules must equal plan years (${planYears}). Current: ${totalYears}`);
        //     return;  // Prevent save
        // }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save payment plan");
        MessageToast.show("Payment plan saved successfully!");
        oDialog.close();
        this._loadPlans();

    } catch (err) {
        MessageBox.error("Error: " + err.message);
    }
},



        onCancelPlan: function () {
            this._oAddDialog.close();
        },

        // Add / delete rows
        onAddScheduleRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aSchedules = oModel.getProperty("/schedules");
            aSchedules.push({});
            oModel.refresh();
        },

        onDeleteScheduleRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aSchedules = oModel.getProperty("/schedules");
            aSchedules.pop();
            oModel.refresh();
        },

        onAddProjectRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aProjects = oModel.getProperty("/projects");
            aProjects.push({});
            oModel.refresh();
        },

        onDeleteProjectRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aProjects = oModel.getProperty("/projects");
            aProjects.pop();
            oModel.refresh();
        },

           _generateId: function () {
            this._idCounter += 1;
            localStorage.setItem("simulationIdCounter", this._idCounter);
            const paddedNumber = ("00000" + this._idCounter).slice(-5);  // Pad to 5 digits
            return "PP" + paddedNumber;
        },

        onDeletePlan: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("plans");
            const oData = oCtx.getObject();

            MessageBox.confirm(`Delete plan ${oData.paymentPlanId}?`, {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        try {
                            const res = await fetch(`/odata/v4/real-estate/PaymentPlans('${oData.paymentPlanId}')`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Delete failed");
                            MessageToast.show("Deleted successfully");
                            this._loadPlans();
                        } catch (err) {
                            MessageBox.error(err.message);
                        }
                    }
                }
            });
        },

        // 🔹 Handles selection confirmation in Value Help Dialog
        _onValueHelpConfirm: function (oEvt, sCodeField, sDescField, fnSelectCallback) {
            const oSelectedItem = oEvt.getParameter("selectedItem");
            if (oSelectedItem) {
                const oCtx = oSelectedItem.getBindingContext("dropdowns"); // Specify model name
                if (oCtx) {
                    const oSelected = oCtx.getObject();
                    fnSelectCallback({
                        code: oSelected[sCodeField],
                        description: oSelected[sDescField]
                    });
                }
            }
        },

        // ----------------------------
        // Plan Status
        // ----------------------------
        onOpenPlanStatusVHD: function (oEvent) {
            var oDialog = new sap.m.SelectDialog({
                title: "Select Plan Status",
                items: {
                    path: "dropdowns>/planStatuses",
                    template: new sap.m.StandardListItem({
                        title: "{dropdowns>description}",
                        description: "{dropdowns>code}",
                        type: "Active"
                    })
                },
                liveChange: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    oEvent.getParameter("itemsBinding").filter([
                        new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue)
                    ]);
                },
                confirm: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        var data = oSelectedItem.getBindingContext("dropdowns").getObject();
                        // Set the code directly into the local model's planStatus
                        var oLocalModel = this.getView().byId("planDialog").getModel("local");
                        oLocalModel.setProperty("/planStatus", data.code);  // e.g., "A"
                    }
                }.bind(this)
            });

            oDialog.setModel(this.getView().getModel("dropdowns"), "dropdowns");
            oDialog.open();
        },

        // ----------------------------
        // Condition Type
        // ----------------------------
        onOpenConditionTypeVHD: function (oEvent) {
            var oInput = oEvent.getSource();
            var oContext = oInput.getBindingContext("local"); // row context
            this._openValueHelpDialog(
                "Condition Type",
                "dropdowns>/conditionTypes",
                oContext,
                "conditionType"
            );
        },

        // ----------------------------
        // Base Price
        // ----------------------------
        onOpenBasePriceVHD: function (oEvent) {
            var oInput = oEvent.getSource();
            var oContext = oInput.getBindingContext("local");
            this._openValueHelpDialog(
                "Base Price",
                "dropdowns>/basePrices",
                oContext,
                "basePrice"
            );
        },


        // ----------------------------
        // Frequency (Custom to trigger calculation on selection)
        // ----------------------------
        onOpenFrequencyVHD: function (oEvent) {
            var oInput = oEvent.getSource();
            var oContext = oInput.getBindingContext("local");

            var oDialog = new sap.m.SelectDialog({
                title: "Select Frequency",
                items: {
                    path: "dropdowns>/frequencies",
                    template: new sap.m.StandardListItem({
                        title: "{dropdowns>description}",
                        description: "{dropdowns>code}",
                        type: "Active"
                    })
                },
                liveChange: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    oEvent.getParameter("itemsBinding").filter([
                        new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue)
                    ]);
                },
                confirm: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        var selectedContext = oSelectedItem.getBindingContext("dropdowns");
                        var data = selectedContext.getObject();
                        // Set the frequency object into the row
                        oContext.setProperty("frequency", data);
                        // Trigger calculation if years are entered
                        var years = parseInt(oContext.getProperty("numberOfYears")) || 0;
                        if (years > 0) {
                            this._calculateInstallments(oContext);
                        }
                    }
                }.bind(this)
            });

            oDialog.setModel(this.getView().getModel("dropdowns"), "dropdowns");
            oDialog.open();
        },

        // ----------------------------
        // Project
        // ----------------------------
        onOpenProjectVHD: function (oEvent) {
            var oInput = oEvent.getSource();
            var oContext = oInput.getBindingContext("local"); // row context

            var oDialog = new sap.m.SelectDialog({
                title: "Select Project",
                items: {
                    path: "dropdowns>/projects",
                    template: new sap.m.StandardListItem({
                        title: "{dropdowns>description}",  // ✅ Fixed: Use 'description' (matches model)
                        description: "{dropdowns>code}",   // ✅ Fixed: Use 'code' (matches model)
                        type: "Active"
                    })
                },
                liveChange: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    oEvent.getParameter("itemsBinding").filter([
                        new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue)  // ✅ Fixed: Use 'description'
                    ]);
                },
                confirm: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        var data = oSelectedItem.getBindingContext("dropdowns").getObject();
                        oContext.setProperty("projectId", data.code);              // ✅ Fixed: Use 'code'
                        oContext.setProperty("projectDescription", data.description);  // ✅ Fixed: Use 'description'
                    }
                }
            });

            oDialog.setModel(this.getView().getModel("dropdowns"), "dropdowns");
            oDialog.open();
        },





        // ----------------------------
        // Generic Value Help Dialog
        // ----------------------------
        _openValueHelpDialog: function (title, path, oContext, field) {
            var that = this;

            var oDialog = new sap.m.SelectDialog({
                title: title,
                items: {
                    path: path,
                    template: new sap.m.StandardListItem({
                        title: "{dropdowns>description}",
                        description: "{dropdowns>code}",
                        type: "Active"
                    })
                },
                liveChange: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oBinding = oEvent.getParameter("itemsBinding");
                    oBinding.filter([
                        new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue)
                    ]);
                },
                confirm: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        var selectedContext = oSelectedItem.getBindingContext("dropdowns");
                        var data = selectedContext.getObject();
                        // set full object into the row
                        oContext.setProperty(field, data);
                    }
                }
            });

            // set model for the dialog
            oDialog.setModel(this.getView().getModel("dropdowns"), "dropdowns");
            oDialog.open();
        },
        // 🔹 New: Calculate installments when frequency is selected/changed (via VHD or manual input)
        onFrequencyChange: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("local");
            var years = parseInt(oContext.getProperty("numberOfYears")) || 0;

            // Only calculate if years are already entered
            if (years > 0) {
                this._calculateInstallments(oContext);
            }
        },

        // 🔹 Updated: Calculate installments when years are entered (only if frequency is selected)
        onYearsChange: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("local");
            var frequencyDesc = oContext.getProperty("frequency/description") || "";

            // Only calculate if a frequency is selected
            if (frequencyDesc) {
                this._calculateInstallments(oContext);
            }
        },

        // 🔹 Helper to calculate numberOfInstallments based on frequency and years
        _calculateInstallments: function (oContext) {
            var frequencyDesc = oContext.getProperty("frequency/description") || "";
            var years = parseInt(oContext.getProperty("numberOfYears")) || 0;
            var installments = 0;

            switch (frequencyDesc.toLowerCase()) {
                case "one time":
                    installments = 1;  // Always 1, regardless of years
                    break;
                case "monthly":
                    installments = 12 * years;
                    break;
                case "quarterly":
                    installments = 4 * years;
                    break;
                case "semi-annual":
                    installments = 2 * years;
                    break;
                case "annual":
                    installments = 1 * years;
                    break;
                default:
                    installments = 0;  // Default if no match
            }

            oContext.setProperty("numberOfInstallments", installments);
        },


    });
});