sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/m/DatePicker",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/ui/model/json/JSONModel",
    "sap/m/Title",
    "sap/m/IconTabBar",
    "sap/m/IconTabFilter",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/HBox"
], function (
    Controller, MessageBox, Dialog, Input, Button, Label, Text, VBox,
    DatePicker, Table, Column, ColumnListItem, JSONModel, Title, IconTabBar, IconTabFilter, SimpleForm, HBox
) {
    "use strict";

    return Controller.extend("dboperations.controller.EOI", {

        onInit: function () {
            this._loadEOIs();
        },

        _loadEOIs: function () {
            const oModel = new JSONModel();
            fetch("/odata/v4/real-estate/EOI?$expand=paymentDetails")
                .then(res => res.json())
                .then(data => {
                    oModel.setData({ EOI: data.value || [] });
                    this.getView().byId("eoiTable").setModel(oModel);
                })
                .catch(err => {
                    console.error("Error loading EOIs:", err);
                    MessageBox.error("Error loading EOIs: " + err.message);
                });
        },

        /* --------------------------- ADD / EDIT --------------------------- */
        onNavigateToAddEOI: function () {
            // New dialog every time → avoids stale bindings and wrong mode
            const oData = {
                eoiType: "",
                status: "",
                date: "",
                companyCode: "",
                projectId: "",
                totalEoiValue: 0,
                collectedAmount: 0,
                remainingAmount: 0,
                nationality: "",
                mobile1: "",
                customerId: "",
                validatedBy: "",
                validatedOn: "",
                paymentDetails: []
            };
            this._openAddEditDialog(oData, false);
        },

        onEditEOI: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) return MessageBox.warning("No EOI selected.");
            const oData = Object.assign({}, oCtx.getObject());
            this._openAddEditDialog(oData, true);
        },

        _openAddEditDialog: function (oData, isEdit) {
            // Always destroy any previous dialog instance
            if (this._oAddDialog) {
                this._oAddDialog.destroy();
                this._oAddDialog = null;
            }

            const oModel = new JSONModel(oData);

            this._oAddDialog = new Dialog({
                title: isEdit ? "Edit EOI" : "Add EOI",
                contentWidth: "100%",
                resizable: true,
                draggable: true,
                content: new VBox({ items: this._createAddEditForm() }),
                beginButton: new Button({
                    text: "Save",
                    type: "Emphasized",
                    press: this.onSaveEOI.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: () => this._oAddDialog.close()
                })
            });

            this._oAddDialog.setModel(oModel);
            this.getView().addDependent(this._oAddDialog);
            this._oAddDialog.open();
        },

        _createAddEditForm: function () {
            return [
                new Label({ text: "EOI Type" }), new Input({ value: "{/eoiType}" }),
                new Label({ text: "Status" }), new Input({ value: "{/status}" }),
                new Label({ text: "Date" }), new DatePicker({ value: "{/date}", valueFormat: "yyyy-MM-dd" }),
                new Label({ text: "Company Code" }), new Input({ value: "{/companyCode}" }),
                new Label({ text: "Project ID" }), new Input({ value: "{/projectId}" }),
                new Label({ text: "Total EOI Value" }), new Input({ value: "{/totalEoiValue}", type: "Number" }),
                new Label({ text: "Collected Amount" }), new Input({ value: "{/collectedAmount}", type: "Number" }),
                new Label({ text: "Remaining Amount" }), new Input({ value: "{/remainingAmount}", type: "Number" }),
                new Label({ text: "Customer ID" }), new Input({ value: "{/customerId}" }),
                new Label({ text: "Nationality" }), new Input({ value: "{/nationality}" }),
                new Label({ text: "Mobile 1" }), new Input({ value: "{/mobile1}" }),
                new Label({ text: "Validated By" }), new Input({ value: "{/validatedBy}" }),
                new Label({ text: "Validated On" }), new DatePicker({ value: "{/validatedOn}", valueFormat: "yyyy-MM-dd" }),

                new Title({ text: "Payment Details", level: "H3" }),
                new Button({ text: "Add Payment", press: this.onAddPaymentRow.bind(this) }),
                new Table({
                    id: "paymentDetailsTable",
                    items: "{/paymentDetails}",
                    columns: [
                        new Column({ header: new Label({ text: "Receipt Type" }) }),
                        new Column({ header: new Label({ text: "Status" }) }),
                        new Column({ header: new Label({ text: "Payment Method" }) }),
                        new Column({ header: new Label({ text: "Amount" }) }),
                        new Column({ header: new Label({ text: "Due Date" }) }),
                        new Column({ header: new Label({ text: "House Bank" }) }),
                        new Column({ header: new Label({ text: "Collected Amount" }) })
                    ],
                    items: {
                        path: "/paymentDetails",
                        template: new ColumnListItem({
                            cells: [
                                new Input({ value: "{receiptType}" }),
                                new Input({ value: "{receiptStatus}" }),
                                new Input({ value: "{paymentMethod}" }),
                                new Input({ value: "{amount}", type: "Number" }),
                                new DatePicker({ value: "{dueDate}", valueFormat: "yyyy-MM-dd" }),
                                new Input({ value: "{houseBank}" }),
                                new Input({ value: "{collectedAmount}", type: "Number" })
                            ]
                        })
                    }
                })
            ];
        },

        /* --------------------------- SAVE --------------------------- */
        onSaveEOI: function () {
            const oData = this._oAddDialog.getModel().getData();
            const isEdit = !!oData.eoiId && oData.eoiId.trim() !== "";

            // if create, generate new id
            const eoiId = isEdit ? oData.eoiId : Date.now().toString().slice(-8);

            const payload = {
                eoiId,
                eoiType: oData.eoiType,
                status: oData.status,
                date: oData.date || null,
                companyCode: oData.companyCode,
                projectId: oData.projectId,
                totalEoiValue: parseFloat(oData.totalEoiValue) || 0,
                collectedAmount: parseFloat(oData.collectedAmount) || 0,
                remainingAmount: parseFloat(oData.remainingAmount) || 0,
                nationality: oData.nationality,
                mobile1: oData.mobile1,
                customerId: oData.customerId,
                validatedBy: oData.validatedBy,
                validatedOn: oData.validatedOn || null,
                paymentDetails: oData.paymentDetails || []
            };

            const method = isEdit ? "PATCH" : "POST";
            const url = isEdit
                ? `/odata/v4/real-estate/EOI(eoiId='${encodeURIComponent(eoiId)}')`
                : "/odata/v4/real-estate/EOI";


            fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(async (r) => {
                    if (!r.ok) {
                        const txt = await r.text().catch(() => "");
                        throw new Error(txt || "Save failed");
                    }
                    return r.text().then(txt => txt ? JSON.parse(txt) : {});
                })
                .then(() => {
                    this._loadEOIs();
                    MessageBox.success(isEdit ? "EOI updated successfully!" : "EOI created successfully!");
                    this._oAddDialog.close();
                })
                .catch(err => {
                    console.error("Save error:", err);
                    MessageBox.error("Save failed: " + err.message);
                });
        },

        onDetails: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) return MessageBox.warning("No EOI selected.");

            const oData = oCtx.getObject();
            const oModel = new JSONModel(oData);

            if (this._oDetailsDialog) {
                this._oDetailsDialog.destroy();
                this._oDetailsDialog = null;
            }

            this._oDetailsDialog = new Dialog({
                title: "EOI Details",
                contentWidth: "900px",
                resizable: true,
                draggable: true,
                content: [
                    new IconTabBar({
                        items: [
                            new IconTabFilter({
                                text: "General Data",
                                icon: "sap-icon://home",
                                content: new SimpleForm({
                                    editable: false,
                                    content: [
                                        new Label({ text: "EOI ID" }), new Text({ text: "{/eoiId}" }),
                                        new Label({ text: "EOI Type" }), new Text({ text: "{/eoiType}" }),
                                        new Label({ text: "Status" }), new Text({ text: "{/status}" }),
                                        new Label({ text: "Date" }), new Text({ text: "{/date}" }),
                                        new Label({ text: "Company Code" }), new Text({ text: "{/companyCode}" }),
                                        new Label({ text: "Project ID" }), new Text({ text: "{/projectId}" }),
                                        new Label({ text: "Total Value" }), new Text({ text: "{/totalEoiValue}" }),
                                        new Label({ text: "Collected Amount" }), new Text({ text: "{/collectedAmount}" }),
                                        new Label({ text: "Remaining Amount" }), new Text({ text: "{/remainingAmount}" })
                                    ]
                                })
                            }),
                            new IconTabFilter({
                                text: "Payment Details",
                                icon: "sap-icon://money-bills",
                                content: [
                                    new Table({
                                        columns: [
                                            new Column({ header: new Label({ text: "Receipt Type" }) }),
                                            new Column({ header: new Label({ text: "Status" }) }),
                                            new Column({ header: new Label({ text: "Payment Method" }) }),
                                            new Column({ header: new Label({ text: "Amount" }) }),
                                            new Column({ header: new Label({ text: "Due Date" }) }),
                                            new Column({ header: new Label({ text: "House Bank" }) }),
                                            new Column({ header: new Label({ text: "Collected Amount" }) })
                                        ],
                                        items: {
                                            path: "/paymentDetails",
                                            template: new ColumnListItem({
                                                cells: [
                                                    new Text({ text: "{receiptType}" }),
                                                    new Text({ text: "{receiptStatus}" }),
                                                    new Text({ text: "{paymentMethod}" }),
                                                    new Text({ text: "{amount}" }),
                                                    new Text({ text: "{dueDate}" }),
                                                    new Text({ text: "{houseBank}" }),
                                                    new Text({ text: "{collectedAmount}" })
                                                ]
                                            })
                                        }
                                    })
                                ]
                            })
                        ]
                    })
                ],
                endButton: new Button({
                    text: "Close",
                    press: () => this._oDetailsDialog.close()
                })
            });

            this._oDetailsDialog.setModel(oModel);
            this.getView().addDependent(this._oDetailsDialog);
            this._oDetailsDialog.open();
        },

        onAddReservationFromEOI: async function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) {
                sap.m.MessageToast.show("No EOI selected.");
                return;
            }

            const oEOI = oCtx.getObject();

            // 🔹 Default data for the reservation
            const oNewReservationModel = new sap.ui.model.json.JSONModel({
                reservationId: "",
                companyCodeId: oEOI.companyCode || "",
                oldReservationId: "",
                eoiId: oEOI.eoiId || "",
                description: `Reservation for EOI ${oEOI.eoiId}`,
                salesType: "",
                validFrom: new Date().toISOString().split("T")[0],
                customerType: "",
                currency: "",
                afterSales: "",
                status: "Draft",

                // 🔹 Reference fields
                project_projectId: oEOI.projectId || "",
                building_buildingId: "",
                unit_unitId: "",
                paymentPlan_paymentPlanId: "",

                // 🔹 Financial and misc fields
                bua: 0,
                phase: "",
                pricePlanYears: 0,
                planYears: 0,
                unitPrice: 0,
                planCurrency: "",
                requestType: "",
                reason: "",
                cancellationDate: "",
                cancellationStatus: "",
                rejectionReason: "",
                cancellationFees: 0,

                payments: [],
                partners: [],
                conditions: []
            });

            if (!this._oAddReservationDialog) {
                this._oAddReservationDialog = new sap.m.Dialog({
                    title: "Add Reservation from EOI",
                    contentWidth: "700px",
                    contentHeight: "80%",
                    resizable: true,
                    draggable: true,
                    class: "sapUiSizeCompact",
                    content: [
                        new sap.m.ScrollContainer({
                            height: "100%",
                            vertical: true,
                            focusable: true,
                            content: [
                                new sap.ui.layout.form.SimpleForm({
                                    editable: true,
                                    layout: "ResponsiveGridLayout",
                                    labelSpanL: 4,
                                    columnsL: 2,
                                    content: [
                                        new sap.m.Label({ text: "EOI ID" }),
                                        new sap.m.Text({ text: "{/eoiId}" }),

                                        new sap.m.Label({ text: "Company Code" }),
                                        new sap.m.Text({ text: "{/companyCodeId}" }),

                                        new sap.m.Label({ text: "Project ID" }),
                                        new sap.m.Text({ text: "{/project_projectId}" }),

                                        new sap.m.Label({ text: "Description" }),
                                        new sap.m.Input({ value: "{/description}" }),

                                        new sap.m.Label({ text: "Sales Type" }),
                                        new sap.m.Input({ value: "{/salesType}" }),

                                        new sap.m.Label({ text: "Valid From" }),
                                        new sap.m.DatePicker({
                                            value: "{/validFrom}",
                                            displayFormat: "long",
                                            valueFormat: "yyyy-MM-dd",
                                            showClearIcon: true
                                        }),

                                        new sap.m.Label({ text: "Currency" }),
                                        new sap.m.Input({ value: "{/currency}" }),

                                        new sap.m.Label({ text: "Customer Type" }),
                                        new sap.m.Input({ value: "{/customerType}" }),

                                        new sap.m.Label({ text: "After Sales" }),
                                        new sap.m.Input({ value: "{/afterSales}" }),

                                        new sap.m.Label({ text: "Phase" }),
                                        new sap.m.Input({ value: "{/phase}" }),

                                        new sap.m.Label({ text: "Unit Price" }),
                                        new sap.m.Input({ value: "{/unitPrice}" }),

                                        new sap.m.Label({ text: "BUA" }),
                                        new sap.m.Input({ value: "{/bua}" }),

                                        new sap.m.Label({ text: "Plan Years" }),
                                        new sap.m.Input({ value: "{/planYears}" }),

                                        new sap.m.Label({ text: "Price Plan Years" }),
                                        new sap.m.Input({ value: "{/pricePlanYears}" }),

                                        new sap.m.Label({ text: "Plan Currency" }),
                                        new sap.m.Input({ value: "{/planCurrency}" }),

                                        new sap.m.Label({ text: "Request Type" }),
                                        new sap.m.Input({ value: "{/requestType}" }),

                                        new sap.m.Label({ text: "Reason" }),
                                        new sap.m.Input({ value: "{/reason}" }),

                                        new sap.m.Label({ text: "Cancellation Date" }),
                                        new sap.m.DatePicker({
                                            value: "{/cancellationDate}",
                                            displayFormat: "long",
                                            valueFormat: "yyyy-MM-dd",
                                            showClearIcon: true
                                        }),

                                        new sap.m.Label({ text: "Cancellation Status" }),
                                        new sap.m.Input({ value: "{/cancellationStatus}" }),

                                        new sap.m.Label({ text: "Cancellation Fees" }),
                                        new sap.m.Input({ value: "{/cancellationFees}" })
                                    ]
                                })
                            ]
                        })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Save",
                        type: "Emphasized",
                        press: async function () {
                            const oData = this._oAddReservationDialog.getModel().getData();

                            try {
                                const res = await fetch("/odata/v4/real-estate/Reservations", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(oData)
                                });

                                if (!res.ok) {
                                    const err = await res.json();
                                    throw new Error(err.error?.message || "Failed to create reservation");
                                }

                                sap.m.MessageToast.show("Reservation created successfully!");
                                this._oAddReservationDialog.close();
                            } catch (err) {
                                console.error("❌ Error creating reservation from EOI:", err);
                                sap.m.MessageBox.error("Error: " + err.message);
                            }
                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            this._oAddReservationDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oAddReservationDialog);
            }

            this._oAddReservationDialog.setModel(oNewReservationModel);
            this._oAddReservationDialog.open();
        },

        /* --------------------------- PAYMENT ROWS --------------------------- */
        onAddPaymentRow: function () {
            const oModel = this._oAddDialog.getModel();
            const a = oModel.getProperty("/paymentDetails") || [];
            a.push({
                receiptType: "", receiptStatus: "", paymentMethod: "",
                amount: 0, dueDate: "", houseBank: "", collectedAmount: 0
            });
            oModel.setProperty("/paymentDetails", a);
            oModel.refresh();
        },

        /* --------------------------- DELETE --------------------------- */
        onDelete: function (oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();
            if (!oCtx) return;
            const sEoiId = oCtx.getObject().eoiId;

            MessageBox.confirm(`Delete EOI ${sEoiId}?`, {
                onClose: (sAction) => {
                    if (sAction !== MessageBox.Action.OK) return;
                    fetch(`/odata/v4/real-estate/EOI(eoiId='${encodeURIComponent(sEoiId)}')`, {
                        method: "DELETE"
                    })
                        .then(() => this._loadEOIs())
                        .then(() => MessageBox.success("EOI deleted successfully!"))
                        .catch(e => MessageBox.error(e.message));
                }
            });
        }

    });
});
