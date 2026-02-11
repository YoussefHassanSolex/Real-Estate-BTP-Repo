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
    "sap/m/ColumnListItem",
    "sap/m/Popover"
], function (
    Controller, MessageBox, Dialog, Button, Text, JSONModel, Title, SimpleForm, Table, Column, ColumnListItem, Popover
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
                selectedUnit: null,
                loading: true
            });
            this.getView().setModel(oModel, "view");

            // Load units data
            this._loadUnits();
        },

        _onRouteMatched: function () {
            // Reset on navigation
            this.getView().getModel("view").setProperty("/svgContent", "");
            this.getView().getModel("view").setProperty("/selectedUnit", null);
            this.getView().getModel("view").setProperty("/placedMarkers", []);
        },

        _loadUnits: function () {
            fetch("/odata/v4/real-estate/Units?$expand=measurements,conditions&$filter=unitStatusDescription eq 'Open'")
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
                    this.getView().getModel("view").setProperty("/loading", false);

                    // Attach dragstart event to list items
                    setTimeout(function() {
                        var oList = this.getView().byId("unitsList");
                        oList.getItems().forEach(function(oItem) {
                            var domRef = oItem.getDomRef();
                            if (domRef) {
                                domRef.draggable = true;
                                domRef.addEventListener("dragstart", this.onDragStart.bind(this));
                            }
                        }.bind(this));
                    }.bind(this), 100);
                })
                .catch(err => {
                    console.error("Error fetching units", err);
                });
        },

        onFileChange: function (oEvent) {
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
                // Ensure SVG fills the container exactly for accurate coordinate transformation
                svgContent = svgContent.replace(/width="[^"]*" height="[^"]*"/, 'width="100%" height="100%"');
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

                // Filter to get only shape elements (rect, circle, path, etc.) excluding the root svg and g
                var shapeElements = Array.from(allElements).filter(element => {
                    var tag = element.tagName.toLowerCase();
                    return tag !== 'svg' && tag !== 'g' && (tag === 'rect' || tag === 'circle' || tag === 'ellipse' || tag === 'line' || tag === 'polyline' || tag === 'polygon' || tag === 'path' || tag === 'text');
                });
                console.log("Shape elements:", shapeElements.length);

                // Disable pointer events on existing shapes to allow drop on SVG
                shapeElements.forEach((element) => {
                    element.style.pointerEvents = "none";
                });

                // Find the <g> element
                var gElement = svgElement.querySelector("g");

                // Enable drop on SVG container
                svgContainer.getDomRef().addEventListener("dragover", this.onDragOver.bind(this));
                svgContainer.getDomRef().addEventListener("drop", this.onDrop.bind(this));

                // Render existing markers
                var gElement = svgElement.querySelector("g");
                this._renderMarkers(svgElement, gElement);

            }.bind(this), 100); // Reduced timeout
        },



        _renderMarkers: function (svgElement, gElement) {
            // Remove existing markers
            var existingMarkers = svgElement.querySelectorAll(".unit-marker");
            existingMarkers.forEach(function (marker) {
                marker.remove();
            });

            var aMarkers = this.getView().getModel("view").getProperty("/placedMarkers") || [];
            aMarkers.forEach(function (oMarker) {
                var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", oMarker.x);
                circle.setAttribute("cy", oMarker.y);
                circle.setAttribute("r", oMarker.size);
                circle.setAttribute("fill", "red");
                circle.setAttribute("stroke", "black");
                circle.setAttribute("stroke-width", "1");
                circle.classList.add("unit-marker");
                circle.style.cursor = "pointer";

                // Hover effects
                circle.addEventListener("mouseover", function () {
                    this.setAttribute("fill", "darkred");
                });
                circle.addEventListener("mouseout", function () {
                    this.setAttribute("fill", "red");
                });

                // Click for unit options
                circle.addEventListener("click", function (event) {
                    this._showUnitOptions(oMarker.unit, event);
                }.bind(this));

                // Append to gElement since coordinates are in g element's coordinate system
                if (gElement) {
                    gElement.appendChild(circle);
                } else {
                    svgElement.appendChild(circle);
                }
            }.bind(this));
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
        },

        onDragStart: function (oEvent) {
            console.log("Drag start event fired");
            var oTarget = oEvent.target;
            var oItem = sap.ui.getCore().byId(oTarget.id);
            if (oItem && oItem.getBindingContext) {
                var oContext = oItem.getBindingContext("view");
                if (oContext) {
                    var oUnit = oContext.getObject();
                    console.log("Dragging unit:", oUnit.unitId);
                    oEvent.dataTransfer.setData("application/json", JSON.stringify(oUnit));

                    // Create a small drag image (circle like the marker)
                    var dragImage = document.createElement('div');
                    dragImage.style.width = '10px';
                    dragImage.style.height = '10px';
                    dragImage.style.backgroundColor = 'red';
                    dragImage.style.borderRadius = '50%';
                    dragImage.style.border = '1px solid black';
                    document.body.appendChild(dragImage);
                    oEvent.dataTransfer.setDragImage(dragImage, 5, 5);
                    // Remove the temporary element after a short delay
                    setTimeout(function() {
                        document.body.removeChild(dragImage);
                    }, 0);
                }
            }
        },

        onDragOver: function (oEvent) {
            oEvent.preventDefault();
        },

        onDrop: function (oEvent) {
            console.log("Drop event fired");
            oEvent.preventDefault();
            var svgContainer = oEvent.currentTarget;
            var svgElement = svgContainer.querySelector("svg");

            if (!svgElement) {
                console.log("SVG element not found");
                return;
            }

            // Get mouse position relative to SVG element
            var rect = svgElement.getBoundingClientRect();
            var mouseX = oEvent.clientX - rect.left;
            var mouseY = oEvent.clientY - rect.top;

            // Map to viewBox coordinates (assuming SVG fills container)
            if (!svgElement.viewBox) {
                console.log("SVG has no viewBox");
                return;
            }
            var viewBox = svgElement.viewBox.baseVal;
            var scaleX = viewBox.width / rect.width;
            var scaleY = viewBox.height / rect.height;
            var vx = mouseX * scaleX;
            var vy = mouseY * scaleY;

            // Clamp to viewBox
            vx = Math.max(0, Math.min(viewBox.width, vx));
            vy = Math.max(0, Math.min(viewBox.height, vy));

            // Transform to g element's coordinate system
            // g transform: translate(0,468) scale(0.1,-0.1)
            // Inverse: scale(10,-10) translate(0,-468)
            var gx = vx * 10;
            var gy = (vy - 468) * (-10);

            console.log("Drop coordinates (viewBox):", vx, vy);

            var data = oEvent.dataTransfer.getData("application/json");
            if (data) {
                var oUnit = JSON.parse(data);
                console.log("Dropped unit:", oUnit.unitId);
                var aMarkers = this.getView().getModel("view").getProperty("/placedMarkers") || [];
                aMarkers.push({
                    x: gx,
                    y: gy,
                    size: 50,
                    unit: oUnit
                });
                this.getView().getModel("view").setProperty("/placedMarkers", aMarkers);
                console.log("Total markers:", aMarkers.length);
                var gElement = svgElement.querySelector("g");
                this._renderMarkers(svgElement, gElement);
            } else {
                console.log("No data in dataTransfer");
            }
        },

        _showUnitOptions: function (unit, event) {
            // Get the clicked marker element
            var oMarker = event.target;

            var oPopover = new Popover({
                title: "Unit Options",
                placement: "Bottom",
                content: [
                    new sap.m.HBox({
                        wrap: "Wrap",
                        items: [
                            new sap.m.Button({
                                icon: "sap-icon://information",
                                text: "Details",
                                press: function () {
                                    this._showUnitDetails(unit);
                                    oPopover.close();
                                }.bind(this)
                            }),
                            new sap.m.Button({
                                icon: "sap-icon://add-document",
                                text: "Create Reservation",
                                press: function () {
                                    this._navigateToCreateReservation(unit);
                                    oPopover.close();
                                }.bind(this)
                            })
                        ]
                    })
                ]
            });

            // Open popover by the clicked marker
            oPopover.openBy(oMarker);
        },

        _navigateToCreateReservation: function (unit) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var reservationData = {
                mode: "create",
                unit_unitId: unit.unitId,
                project_projectId: unit.projectId,
                buildingId: unit.buildingId,
                bua: unit.bua,
                unitPrice: unit.originalPrice,
                unitType: unit.unitTypeDescription,
                description: unit.unitDescription || "",
                unitConditions: unit.unitConditions || []
            };
            var sData = encodeURIComponent(JSON.stringify(reservationData));
            oRouter.navTo("CreateReservation", { reservationData: sData });
        },


    });
});
