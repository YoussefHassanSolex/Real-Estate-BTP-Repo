sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/model/json/JSONModel",
    "sap/m/Title",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem"
], function (
    Controller, MessageBox, Dialog, Button, Text, JSONModel, Title, SimpleForm, Table, Column, ColumnListItem
) {
    "use strict";

    return Controller.extend("dboperations.controller.Masterplan", {
        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("Masterplan")
                .attachPatternMatched(this._onRouteMatched, this);

            var oModel = new sap.ui.model.json.JSONModel({
                svgContent: "",
                units: [],
                selectedUnit: null
            });
            this.getView().setModel(oModel, "view");

            // Load units data
            this._loadUnits();
        },

        _onRouteMatched: function () {
            // Reset on navigation
            this.getView().getModel("view").setProperty("/svgContent", "");
            this.getView().getModel("view").setProperty("/selectedUnit", null);
        },

        _loadUnits: function () {
            fetch("/odata/v4/real-estate/Units?$expand=measurements,conditions")
                .then(response => response.json())
                .then(data => {
                    // Enrich units similar to Units controller
                    const enrichedUnits = data.value.map(unit => {
                        var formatNumber = function (value) {
                            if (value === null || value === undefined || value === '') return '';
                            var numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
                            return isNaN(numValue) ? String(value) : numValue.toLocaleString('en-US');
                        };

                        let buaMeasurement = unit.measurements?.find(m =>
                            m.code && m.code.trim().toUpperCase() === "BUA"
                        );
                        let bua = buaMeasurement ? Number(buaMeasurement.quantity) : null;
                        let originalPrice = unit.conditions?.[0]?.amount || null;

                        return {
                            ...unit,
                            bua: formatNumber(bua),
                            originalPrice: formatNumber(originalPrice),
                            profitCenter: formatNumber(unit.profitCenter),
                            functionalArea: formatNumber(unit.functionalArea)
                        };
                    });

                    this.getView().getModel("view").setProperty("/units", enrichedUnits);
                })
                .catch(err => {
                    console.error("Error fetching units", err);
                });
        },

        onFileChange: function (oEvent) {
            debugger
            var oFileUploader = oEvent.getSource();
            var aFiles = oFileUploader.oFileUpload.files;

            if (aFiles.length === 0) return;

            var oFile = aFiles[0];
            if (!oFile) return;

            // Update status
            this.getView().byId("uploadStatus").setText("Loading SVG file...");

            var reader = new FileReader();
            reader.onload = function (e) {
                var svgContent = e.target.result;
                this.getView().getModel("view").setProperty("/svgContent", svgContent);
console.log(svgContent);

                // Update status
                this.getView().byId("uploadStatus").setText("SVG loaded successfully. Click on units to view details.");

                // Parse SVG and attach click handlers
                this._attachSvgClickHandlers(svgContent);
            }.bind(this);

            reader.onerror = function () {
                this.getView().byId("uploadStatus").setText("Error loading SVG file.");
            }.bind(this);

            reader.readAsText(oFile);
        },

        onTypeMissmatch: function (oEvent) {
            MessageBox.error("Please select a valid SVG file.");
        },

        _attachSvgClickHandlers: function (svgContent) {
            debugger
            // Use a timeout to ensure DOM is updated
            setTimeout(function () {
                var svgContainer = this.getView().byId("svgContainer");
                if (!svgContainer) {
                    console.log("SVG container not found");
                    return;
                }

                // Clear existing content
                svgContainer.getDomRef().innerHTML = svgContent;

                var svgElement = svgContainer.getDomRef().querySelector("svg");
                if (!svgElement) {
                    console.log("SVG element not found in container");
                    return;
                }

                var units = this.getView().getModel("view").getProperty("/units");
                console.log("Units loaded:", units.length);
                console.log("SVG element:", svgElement);

                // Get all elements in the SVG
                var allElements = svgElement.querySelectorAll('*');
                console.log("SVG elements:", allElements.length);

                // Filter to get only shape elements (rect, circle, path, etc.) excluding the root svg
                var shapeElements = Array.from(allElements).filter(element => {
                    var tag = element.tagName.toLowerCase();
                    return tag !== 'svg' && (tag === 'rect' || tag === 'circle' || tag === 'ellipse' || tag === 'line' || tag === 'polyline' || tag === 'polygon' || tag === 'path' || tag === 'text' || tag === 'g');
                });
                console.log("Shape elements:", shapeElements.length);

                // Attach click handlers to shape elements
                shapeElements.forEach((element, index) => {
                    var unitIndex = index % units.length;
                    var unit = units[unitIndex];
                    element.style.cursor = "pointer";
                    element.style.fill = "lightblue"; // Visual feedback
                    element.setAttribute("title", unit.unitId); // Show unit ID on hover
                    element.addEventListener("mouseover", function () {
                        this.style.fill = "blue"; // Change color on hover
                    });
                    element.addEventListener("mouseout", function () {
                        this.style.fill = "lightblue"; // Revert color on mouse out
                    });
                    element.addEventListener("click", function (event) {
                        event.stopPropagation();
                        console.log("Clicked on SVG element for unit:", unit.unitId);
                        this._showUnitDetails(unit);
                    }.bind(this));
                });

                // Add a global click handler to the SVG for testing
                svgElement.addEventListener("click", function (event) {
//                     debugger
//                     console.log("SVG clicked at:", event.clientX, event.clientY);
// alert(`SVG clicked at: ${event.clientX}, ${event.clientY}`);
                });

            }.bind(this), 100); // Reduced timeout
        },

        _showUnitDetails: function (unit) {
            var oDialogModel = new sap.ui.model.json.JSONModel(unit);

            if (!this._oDetailsDialog) {
                this._oDetailsDialog = new sap.m.Dialog({
                    title: "Unit Details",
                    contentWidth: "100%",
                    resizable: true,
                    draggable: true,
                    content: [
                        new sap.m.IconTabBar({
                            expandable: true,
                            items: [
                                new sap.m.IconTabFilter({
                                    text: "General Data",
                                    icon: "sap-icon://project-definition",
                                    content: [
                                        new sap.ui.layout.form.SimpleForm({
                                            editable: false,
                                            layout: "ResponsiveGridLayout",
                                            labelSpanL: 3,
                                            columnsL: 2,
                                            content: [
                                                new sap.m.Label({ text: "Unit ID" }),
                                                new sap.m.Text({ text: "{/unitId}" }),
                                                new sap.m.Label({ text: "Unit Description" }),
                                                new sap.m.Text({ text: "{/unitDescription}" }),
                                                new sap.m.Label({ text: "Project ID" }),
                                                new sap.m.Text({ text: "{/projectId}" }),
                                                new sap.m.Label({ text: "Building ID" }),
                                                new sap.m.Text({ text: "{/buildingId}" }),
                                                new sap.m.Label({ text: "Unit Type" }),
                                                new sap.m.Text({ text: "{/unitTypeDescription}" }),
                                                new sap.m.Label({ text: "Unit Status" }),
                                                new sap.m.Text({ text: "{/unitStatusDescription}" }),
                                                new sap.m.Label({ text: "Built Up Area" }),
                                                new sap.m.Text({ text: "{/bua}" }),
                                                new sap.m.Label({ text: "Original Price" }),
                                                new sap.m.Text({ text: "{/originalPrice}" })
                                            ]
                                        })
                                    ]
                                }),
                                new sap.m.IconTabFilter({
                                    text: "Measurements",
                                    icon: "sap-icon://measure",
                                    content: [
                                        new sap.m.Table({
                                            columns: [
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Code" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Quantity" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "UOM" }) })
                                            ],
                                            items: {
                                                path: "/measurements",
                                                template: new sap.m.ColumnListItem({
                                                    cells: [
                                                        new sap.m.Text({ text: "{code}" }),
                                                        new sap.m.Text({ text: "{description}" }),
                                                        new sap.m.Text({ text: "{quantity}" }),
                                                        new sap.m.Text({ text: "{uom}" })
                                                    ]
                                                })
                                            }
                                        })
                                    ]
                                }),
                                new sap.m.IconTabFilter({
                                    text: "Conditions",
                                    icon: "sap-icon://list",
                                    content: [
                                        new sap.m.Table({
                                            columns: [
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Code" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Description" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Amount" }) }),
                                                new sap.m.Column({ header: new sap.m.Label({ text: "Currency" }) })
                                            ],
                                            items: {
                                                path: "/conditions",
                                                template: new sap.m.ColumnListItem({
                                                    cells: [
                                                        new sap.m.Text({ text: "{code}" }),
                                                        new sap.m.Text({ text: "{description}" }),
                                                        new sap.m.Text({ text: "{amount}" }),
                                                        new sap.m.Text({ text: "{currency}" })
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
                        type: "Emphasized",
                        press: function () {
                            this._oDetailsDialog.close();
                        }.bind(this)
                    })
                });

                this.getView().addDependent(this._oDetailsDialog);
            }

            this._oDetailsDialog.setModel(oDialogModel);
            this._oDetailsDialog.open();
        }
    });
});
