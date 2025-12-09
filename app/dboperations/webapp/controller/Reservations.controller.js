sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("dboperations.controller.Reservations", {

        onInit: function () {
            this.oModel = this.getView().getModel();
            this._loadReservations();
        },
        _loadReservations: function () {
            fetch("/odata/v4/real-estate/Reservations?$expand=payments,partners,conditions,project,building,unit")
                .then(res => res.json())
                .then(data => {
                    this.getView().setModel(new JSONModel(data.value || []), "reservations");
                })
                .catch(err => console.error("Failed to load reservations:", err));
        },
        onShowReservationDetails: async function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("reservations");
            if (!oCtx) return;
            const sReservationId = oCtx.getProperty("reservationId");

            try {
                const res = await fetch(
                    `/odata/v4/real-estate/Reservations(reservationId='${sReservationId}')?$expand=payments,partners,conditions,project,building,unit`
                );
                if (!res.ok) throw new Error("Failed to load reservation details");
                const oData = await res.json();

                // ✅ Normalize structure
                const oReservation = oData.value ? oData.value[0] : oData;
                const oNormalized = {
                    ...oReservation,

                    // ✅ Flatten associated objects for easy display
                    projectName: oReservation.project?.name || "",
                    projectId: oReservation.project?.projectId || "",
                    buildingName: oReservation.building?.name || "",
                    buildingId: oReservation.building?.buildingId || "",
                    unitNumber: oReservation.unit?.unitNumber || "",
                    unitId: oReservation.unit?.unitId || "",

                    // ✅ Initialize arrays to avoid binding errors
                    payments: oReservation.payments || [],
                    partners: oReservation.partners || [],
                    conditions: oReservation.conditions || []
                };

                const oDialogModel = new JSONModel(oNormalized);

                // ✅ Create dialog once
                if (!this._oDetailsDialog) {
                    this._oDetailsDialog = new sap.m.Dialog({
                        title: "Reservation Details",
                        contentWidth: "90%",
                        resizable: true,
                        draggable: true,
                        content: [
                            new sap.m.IconTabBar({
                                items: [
                                    // 🟢 General Info Tab
                                    new sap.m.IconTabFilter({
                                        text: "General Info",
                                        content: [
                                            new sap.ui.layout.form.SimpleForm({
                                                editable: false,
                                                layout: "ResponsiveGridLayout",
                                                content: [
                                                    new sap.m.Label({ text: "Reservation ID" }),
                                                    new sap.m.Text({ text: "{/reservationId}" }),
                                                    new sap.m.Label({ text: "Company Code" }),
                                                    new sap.m.Text({ text: "{/companyCodeId}" }),
                                                    new sap.m.Label({ text: "Old Reservation ID" }),
                                                    new sap.m.Text({ text: "{/oldReservationId}" }),
                                                    new sap.m.Label({ text: "EOI ID" }),
                                                    new sap.m.Text({ text: "{/eoiId}" }),
                                                    new sap.m.Label({ text: "Sales Type" }),
                                                    new sap.m.Text({ text: "{/salesType}" }),
                                                    new sap.m.Label({ text: "Description" }),
                                                    new sap.m.Text({ text: "{/description}" }),
                                                    new sap.m.Label({ text: "Valid From" }),
                                                    new sap.m.Text({ text: "{/validFrom}" }),
                                                    new sap.m.Label({ text: "Status" }),
                                                    new sap.m.Text({ text: "{/status}" }),
                                                    new sap.m.Label({ text: "Customer Type" }),
                                                    new sap.m.Text({ text: "{/customerType}" }),
                                                    new sap.m.Label({ text: "Currency" }),
                                                    new sap.m.Text({ text: "{/currency}" }),
                                                    new sap.m.Label({ text: "After Sales" }),
                                                    new sap.m.Text({ text: "{/afterSales}" })
                                                ]
                                            })
                                        ]
                                    }),

                                    // 🟢 Unit Info Tab
                                    new sap.m.IconTabFilter({
                                        text: "Unit Info",
                                        content: [
                                            new sap.ui.layout.form.SimpleForm({
                                                editable: false,
                                                layout: "ResponsiveGridLayout",
                                                content: [
                                                    new sap.m.Label({ text: "Project ID" }),
                                                    new sap.m.Text({ text: "{/projectId}" }),
                                                    new sap.m.Label({ text: "Project Name" }),
                                                    new sap.m.Text({ text: "{/projectName}" }),
                                                    new sap.m.Label({ text: "Building ID" }),
                                                    new sap.m.Text({ text: "{/buildingId}" }),
                                                    new sap.m.Label({ text: "Building Name" }),
                                                    new sap.m.Text({ text: "{/buildingName}" }),
                                                    new sap.m.Label({ text: "Unit ID" }),
                                                    new sap.m.Text({ text: "{/unitId}" }),
                                                    new sap.m.Label({ text: "Unit Number" }),
                                                    new sap.m.Text({ text: "{/unitNumber}" }),
                                                    new sap.m.Label({ text: "BUA" }),
                                                    new sap.m.Text({ text: "{/bua}" }),
                                                    new sap.m.Label({ text: "Phase" }),
                                                    new sap.m.Text({ text: "{/phase}" }),
                                                    new sap.m.Label({ text: "Price Plan Years" }),
                                                    new sap.m.Text({ text: "{/pricePlanYears}" })
                                                ]
                                            })
                                        ]
                                    }),

                                    // 🟢 Payments Tab
                                    new sap.m.IconTabFilter({
                                        text: "Payments",
                                        content: [
                                            new sap.m.Table({
                                                columns: [
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Receipt Type" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Status" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Payment Method" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Amount" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "House Bank" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Due Date" }) })
                                                ],
                                                items: {
                                                    path: "/payments",
                                                    template: new sap.m.ColumnListItem({
                                                        cells: [
                                                            new sap.m.Text({ text: "{receiptType}" }),
                                                            new sap.m.Text({ text: "{receiptStatus}" }),
                                                            new sap.m.Text({ text: "{paymentMethod}" }),
                                                            new sap.m.Text({ text: "{amount}" }),
                                                            new sap.m.Text({ text: "{houseBank}" }),
                                                            new sap.m.Text({ text: "{dueDate}" })
                                                        ]
                                                    })
                                                }
                                            })
                                        ]
                                    }),

                                    // 🟢 Partners Tab
                                    new sap.m.IconTabFilter({
                                        text: "Partners",
                                        content: [
                                            new sap.m.Table({
                                                columns: [
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Customer Code" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Name" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Address" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Valid From" }) })
                                                ],
                                                items: {
                                                    path: "/partners",
                                                    template: new sap.m.ColumnListItem({
                                                        cells: [
                                                            new sap.m.Text({ text: "{customerCode}" }),
                                                            new sap.m.Text({ text: "{customerName}" }),
                                                            new sap.m.Text({ text: "{customerAddress}" }),
                                                            new sap.m.Text({ text: "{validFrom}" })
                                                        ]
                                                    })
                                                }
                                            })
                                        ]
                                    }),

                                    // 🟢 Conditions Tab
                                    new sap.m.IconTabFilter({
                                        text: "Conditions",
                                        content: [
                                            new sap.m.Table({
                                                columns: [
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Type" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Amount" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Currency" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Frequency" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Valid From" }) }),
                                                    new sap.m.Column({ header: new sap.m.Label({ text: "Valid To" }) })
                                                ],
                                                items: {
                                                    path: "/conditions",
                                                    template: new sap.m.ColumnListItem({
                                                        cells: [
                                                            new sap.m.Text({ text: "{conditionType}" }),
                                                            new sap.m.Text({ text: "{amount}" }),
                                                            new sap.m.Text({ text: "{currency}" }),
                                                            new sap.m.Text({ text: "{frequency}" }),
                                                            new sap.m.Text({ text: "{validFrom}" }),
                                                            new sap.m.Text({ text: "{validTo}" })
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
                            press: function () { this._oDetailsDialog.close(); }.bind(this)
                        })
                    });

                    this.getView().addDependent(this._oDetailsDialog);
                }

                // ✅ Set normalized model
                this._oDetailsDialog.setModel(oDialogModel);
                this._oDetailsDialog.open();

            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },
        onAddReservation: function () { this._openReservationDialog({}); },
        onEditReservation: async function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("reservations");
            const sReservationId = oCtx.getProperty("reservationId");

            try {
                const res = await fetch(`/odata/v4/real-estate/Reservations(reservationId='${sReservationId}')?$expand=payments,partners,conditions,project,building,unit`);
                if (!res.ok) throw new Error("Failed to load reservation for edit");
                const oData = await res.json();
                const oReservation = oData.value ? oData.value[0] : oData;
                this._openReservationDialog(oReservation);
            } catch (err) {
                MessageBox.error("Error: " + err.message);
            }
        },
        _openReservationDialog: function (oReservation) {
            if (!this._oAddDialog) {
                this._oAddDialog = this.getView().byId("reservationDialog");
            }

            const oModel = new sap.ui.model.json.JSONModel({
                // General Data
                reservationId: oReservation.reservationId || "",
                companyCodeId: oReservation.companyCodeId || "",
                oldReservationId: oReservation.oldReservationId || "",
                eoiId: oReservation.eoiId || "",
                salesType: oReservation.salesType || "",
                description: oReservation.description || "",
                validFrom: oReservation.validFrom || "",
                status: oReservation.status || "",
                customerType: oReservation.customerType || "",
                currency: oReservation.currency || "",
                afterSales: oReservation.afterSales || "",
                // Unit Details
                project: oReservation.project || null,
                building: oReservation.building || null,
                unit: oReservation.unit || null,
                bua: oReservation.bua || 0,
                phase: oReservation.phase || "",
                pricePlanYears: oReservation.pricePlanYears || 0,

                // Payment Plan
                paymentPlan: oReservation.paymentPlan || null,
                planYears: oReservation.planYears || 0,
                unitPrice: oReservation.unitPrice || 0,
                planCurrency: oReservation.planCurrency || "",

                // Cancellation
                requestType: oReservation.requestType || "",
                reason: oReservation.reason || "",
                cancellationDate: oReservation.cancellationDate || "",
                cancellationStatus: oReservation.cancellationStatus || "",
                rejectionReason: oReservation.rejectionReason || "",
                cancellationFees: oReservation.cancellationFees || 0,

                // Associations / Compositions
                payments: oReservation.payments || [],
                partners: oReservation.partners || [],
                conditions: oReservation.conditions || []
            });

            this._oAddDialog.setModel(oModel, "local");
            this._oAddDialog.open();
        },
        onSaveReservation: async function () {
            const oDialog = this.byId("reservationDialog");
            const oLocalModel = oDialog.getModel("local");
            const oData = oLocalModel.getData();

            try {
                // 🔹 Flatten nested association fields (for safety)
                const payload = {
                    reservationId: oData.reservationId || undefined,
                    companyCodeId: oData.companyCodeId,
                    oldReservationId: oData.oldReservationId,
                    eoiId: oData.eoiId,
                    description: oData.description,
                    salesType: oData.salesType,
                    validFrom: oData.validFrom,
                    customerType: oData.customerType,
                    currency: oData.currency,
                    afterSales: oData.afterSales,
                    status: oData.status,

                    // ✅ Flattened association keys (matching CDS)
                    project_projectId: oData.project_projectId,
                    building_buildingId: oData.building_buildingId,
                    unit_unitId: oData.unit_unitId,
                    paymentPlan_paymentPlanId: oData.paymentPlan_paymentPlanId,

                    // Other fields
                    bua: oData.bua,
                    phase: oData.phase,
                    pricePlanYears: oData.pricePlanYears,
                    planYears: oData.planYears,
                    unitPrice: oData.unitPrice,
                    planCurrency: oData.planCurrency,

                    requestType: oData.requestType,
                    reason: oData.reason,
                    cancellationDate: oData.cancellationDate,
                    cancellationStatus: oData.cancellationStatus,
                    rejectionReason: oData.rejectionReason,
                    cancellationFees: oData.cancellationFees,

                    // Child collections
                    payments: oData.payments || [],
                    partners: oData.partners || [],
                    conditions: oData.conditions || []
                };

                // 🔹 POST or PUT depending on whether we have an ID
                const sMethod = payload.reservationId ? "PUT" : "POST";
                const sUrl = payload.reservationId
                    ? `/odata/v4/real-estate/Reservations(reservationId='${payload.reservationId}')`
                    : `/odata/v4/real-estate/Reservations`;

                const res = await fetch(sUrl, {
                    method: sMethod,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error?.message || "Failed to save reservation");
                }

                sap.m.MessageToast.show("Reservation saved successfully!");
                oDialog.close();

                // Refresh table
                const oModel = this.getView().getModel("reservations");
                oModel.refresh();

            } catch (e) {
                console.error("Error saving reservation:", e);
                sap.m.MessageBox.error("Failed to save reservation: " + e.message);
            }
        },
        onCancelReservation: function () { this._oAddDialog.close(); },
        onDeleteReservation: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext("reservations");
            const oData = oCtx.getObject();

            MessageBox.confirm(`Delete reservation ${oData.reservationId}?`, {
                onClose: async (sAction) => {
                    if (sAction === "OK") {
                        try {
                            const res = await fetch(`/odata/v4/real-estate/Reservations('${oData.reservationId}')`, { method: "DELETE" });
                            if (!res.ok) throw new Error("Delete failed");
                            MessageToast.show("Deleted successfully");
                            this._loadReservations();
                        } catch (err) { MessageBox.error(err.message); }
                    }
                }
            });
        },
        // Payment rows
        onAddPaymentRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aPayments = oModel.getProperty("/payments");
            aPayments.push({});
            oModel.refresh();
        },
        onDeletePaymentRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aPayments = oModel.getProperty("/payments");
            aPayments.pop();
            oModel.refresh();
        },
        // Partners rows
        onAddPartnerRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aPartners = oModel.getProperty("/partners");
            aPartners.push({});
            oModel.refresh();
        },
        onDeletePartnerRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aPartners = oModel.getProperty("/partners");
            aPartners.pop();
            oModel.refresh();
        },
        // Conditions rows
        onAddConditionRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aConditions = oModel.getProperty("/conditions");
            aConditions.push({});
            oModel.refresh();
        },
        onDeleteConditionRow: function () {
            const oModel = this._oAddDialog.getModel("local");
            const aConditions = oModel.getProperty("/conditions");
            aConditions.pop();
            oModel.refresh();
        }

    });
});
