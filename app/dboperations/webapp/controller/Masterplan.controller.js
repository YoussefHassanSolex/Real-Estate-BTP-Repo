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
    "sap/m/Popover",
    "sap/m/List",
    "sap/m/StandardListItem"
], function (
    Controller, MessageBox, Dialog, Button, Text, JSONModel, Title, SimpleForm, Table, Column, ColumnListItem, Popover, List, StandardListItem
) {
    "use strict";
    var SAVED_VECTOR_STORAGE_KEY = "masterplan.selectedSavedVectorKey";

    return Controller.extend("dboperations.controller.Masterplan", {
        onInit: function () {
            this.getView().setBusyIndicatorDelay(0);
            this.getOwnerComponent().getRouter()
                .getRoute("Masterplan")
                .attachPatternMatched(this._onRouteMatched, this);

            var oModel = new sap.ui.model.json.JSONModel({
                svgContent: "",
                savedVectors: [],
                selectedSavedVectorKey: "",
                units: [],
                buildings: [],
                reservationPartners: [],
                selectedReservationPartnerId: "",
                selectedUnit: null,
                placedMarkers: [],
                loading: true,
                converting: false,
                layoutScope: "USER",
                currentPlanKey: "",
                uploadStatusText: "Please upload a masterplan file (SVG or any supported format) to view the plan",
                uploadStatusType: "Information"
            });
            var sPersistedKey = window.localStorage.getItem(SAVED_VECTOR_STORAGE_KEY) || "";
            oModel.setProperty("/selectedSavedVectorKey", sPersistedKey);
            this.getView().setModel(oModel, "view");

            // Load units data
            this._loadUnits();
            this._loadSavedVectors({ autoLoadSelected: true });
        },

        _onRouteMatched: function () {
            // Reset on navigation
            this.getView().getModel("view").setProperty("/svgContent", "");
            this.getView().getModel("view").setProperty("/selectedUnit", null);
            this.getView().getModel("view").setProperty("/placedMarkers", []);
            this.getView().getModel("view").setProperty("/currentPlanKey", "");
            this.getView().getModel("view").setProperty("/selectedSavedVectorKey", window.localStorage.getItem(SAVED_VECTOR_STORAGE_KEY) || "");
            if (this._persistTimer) {
                clearTimeout(this._persistTimer);
                this._persistTimer = null;
            }
            this._setConverting(false);
            this._loadSavedVectors({ autoLoadSelected: true });
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
                        var oStatusMeta = this._getStatusMeta(unit.unitStatusDescription);

                        return {
                            ...unit,
                            bua: formatNumber(bua),
                            originalPrice: formatNumber(originalPrice),
                            profitCenter: formatNumber(unit.profitCenter),
                            functionalArea: formatNumber(unit.functionalArea),
                            statusHighlight: oStatusMeta.highlight,
                            unitStatusColor: oStatusMeta.color
                        };
                    });

                    var oViewModel = this.getView().getModel("view");
                    oViewModel.setProperty("/units", enrichedUnits);
                    oViewModel.setProperty("/buildings", this._buildBuildingsFromUnits(enrichedUnits));
                    oViewModel.setProperty("/loading", false);

                    setTimeout(function() {
                        this._applyBuildingListItemStylingAndDnD();
                    }.bind(this), 100);
                })
                .catch(err => {
                    console.error("Error fetching units", err);
                    this.getView().getModel("view").setProperty("/loading", false);
                });
        },

        _getStatusMeta: function (sUnitStatusDescription) {
            var sStatus = String(sUnitStatusDescription || "").trim().toUpperCase();

            if (sStatus.includes("OPEN") || sStatus.includes("AVAILABLE")) {
                return { highlight: "Success", color: "#107E3E" };
            }
            if (sStatus.includes("RESERVED") || sStatus.includes("PENDING") || sStatus.includes("HOLD")) {
                return { highlight: "Warning", color: "#E9730C" };
            }
            if (sStatus.includes("SOLD") || sStatus.includes("CLOSED") || sStatus.includes("BOOKED")) {
                return { highlight: "Error", color: "#BB0000" };
            }

            return { highlight: "Information", color: "#0070F2" };
        },

        _isCreateReservationAllowed: function (oUnit) {
            var sStatus = String(oUnit && oUnit.unitStatusDescription || "").trim().toUpperCase();
            return !(sStatus.includes("RESERVED") || sStatus.includes("PENDING") || sStatus.includes("HOLD"));
        },

        _getBuildingStatusMeta: function (aUnits) {
            var hasAvailable = false;
            var hasReserved = false;
            var hasSold = false;

            (aUnits || []).forEach(function (oUnit) {
                var sStatus = String(oUnit && oUnit.unitStatusDescription || "").trim().toUpperCase();
                if (sStatus.includes("OPEN") || sStatus.includes("AVAILABLE")) {
                    hasAvailable = true;
                } else if (sStatus.includes("RESERVED") || sStatus.includes("PENDING") || sStatus.includes("HOLD")) {
                    hasReserved = true;
                } else if (sStatus.includes("SOLD") || sStatus.includes("CLOSED") || sStatus.includes("BOOKED")) {
                    hasSold = true;
                }
            });

            if (hasAvailable) {
                return { highlight: "Success", color: "#107E3E" };
            }
            if (hasReserved) {
                return { highlight: "Warning", color: "#E9730C" };
            }
            if (hasSold) {
                return { highlight: "Error", color: "#BB0000" };
            }

            return { highlight: "Information", color: "#0070F2" };
        },

        _buildBuildingsFromUnits: function (aUnits) {
            var mBuildings = {};
            (aUnits || []).forEach(function (oUnit) {
                var sBuildingId = oUnit && oUnit.buildingId ? String(oUnit.buildingId).trim() : "";
                if (!sBuildingId) {
                    return;
                }
                if (!mBuildings[sBuildingId]) {
                    mBuildings[sBuildingId] = {
                        buildingId: sBuildingId,
                        buildingDescription: oUnit.buildingDescription || "",
                        units: [],
                        unitCount: 0,
                        statusHighlight: "Information",
                        statusColor: "#0070F2"
                    };
                }
                mBuildings[sBuildingId].units.push(oUnit);
            });

            return Object.keys(mBuildings)
                .map(function (sKey) {
                    var oBuilding = mBuildings[sKey];
                    oBuilding.unitCount = oBuilding.units.length;
                    var oStatus = this._getBuildingStatusMeta(oBuilding.units);
                    oBuilding.statusHighlight = oStatus.highlight;
                    oBuilding.statusColor = oStatus.color;
                    return oBuilding;
                }.bind(this))
                .sort(function (a, b) {
                    return String(a.buildingId).localeCompare(String(b.buildingId));
                });
        },

        _getBuildingById: function (sBuildingId) {
            var aBuildings = this.getView().getModel("view").getProperty("/buildings") || [];
            return aBuildings.find(function (b) {
                return String(b.buildingId || "") === String(sBuildingId || "");
            });
        },

        _getUnitsForBuilding: function (sBuildingId) {
            var aUnits = this.getView().getModel("view").getProperty("/units") || [];
            return aUnits.filter(function (oUnit) {
                return String(oUnit.buildingId || "") === String(sBuildingId || "");
            });
        },

        _applyBuildingListItemStylingAndDnD: function () {
            var oList = this.getView().byId("buildingsList");
            if (!oList) {
                return;
            }

            oList.getItems().forEach(function (oItem) {
                var domRef = oItem.getDomRef();
                var oContext = oItem.getBindingContext("view");
                var oBuilding = oContext && oContext.getObject();
                var sColor = oBuilding && oBuilding.statusColor;
                if (!domRef) {
                    return;
                }

                domRef.draggable = true;
                this._boundOnUnitDragStart = this._boundOnUnitDragStart || this.onDragStart.bind(this);
                if (this._boundOnUnitDragStart) {
                    domRef.removeEventListener("dragstart", this._boundOnUnitDragStart);
                }
                domRef.addEventListener("dragstart", this._boundOnUnitDragStart);
                domRef.style.backgroundColor = sColor || "";
                domRef.style.color = sColor ? "#FFFFFF" : "";
                domRef.style.borderRadius = sColor ? "0.25rem" : "";
                domRef.querySelectorAll(".sapMText, .sapUiIcon").forEach(function (el) {
                    el.style.color = sColor ? "#FFFFFF" : "";
                });
            }.bind(this));
        },

        onBuildingsListUpdateFinished: function () {
            this._applyBuildingListItemStylingAndDnD();
        },


        _setUploadStatus: function (sText, sType) {
            var oViewModel = this.getView().getModel("view");
            oViewModel.setProperty("/uploadStatusText", sText || "");
            oViewModel.setProperty("/uploadStatusType", sType || "Information");
        },

        _loadSavedVectors: async function (mOptions) {
            mOptions = mOptions || {};
            try {
                var oResponse = await fetch("/odata/v4/real-estate/ListMyMasterplanVectors", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        scope: this._getLayoutScope(),
                        customerId: null
                    })
                });
                if (!oResponse.ok) {
                    throw new Error("Failed to load saved vectors.");
                }

                var oResult = await oResponse.json();
                var aVectors = Array.isArray(oResult && oResult.value) ? oResult.value : [];
                var aItems = [{ planKey: "", fileName: "Please select a vector" }].concat(aVectors);
                var oViewModel = this.getView().getModel("view");
                var sSelected = oViewModel.getProperty("/selectedSavedVectorKey") || "";
                var bExists = aItems.some(function (v) { return v.planKey === sSelected; });
                oViewModel.setProperty("/savedVectors", aItems);
                if (!bExists) {
                    oViewModel.setProperty("/selectedSavedVectorKey", "");
                    window.localStorage.setItem(SAVED_VECTOR_STORAGE_KEY, "");
                    return;
                }

                if (mOptions.autoLoadSelected && sSelected) {
                    await this._loadSavedVectorByKey(sSelected, {
                        persistSelection: false
                    });
                }
            } catch (error) {
                console.error("Error loading saved vectors:", error);
            }
        },

        _loadSavedVectorByKey: async function (sPlanKey, mOptions) {
            mOptions = mOptions || {};
            var bPersistSelection = mOptions.persistSelection !== false;
            if (!sPlanKey) {
                return;
            }

            if (bPersistSelection) {
                window.localStorage.setItem(SAVED_VECTOR_STORAGE_KEY, sPlanKey);
            }
            this._setUploadStatus("Loading saved vector...", "Information");
            this._setConverting(true);
            try {
                var oResponse = await fetch("/odata/v4/real-estate/GetMyMasterplanVector", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        planKey: sPlanKey,
                        scope: this._getLayoutScope(),
                        customerId: null
                    })
                });
                if (!oResponse.ok) {
                    throw new Error("Failed to load selected vector.");
                }

                var oRaw = await oResponse.json();
                var oResult = (oRaw && oRaw.value && typeof oRaw.value === "object") ? oRaw.value : oRaw;
                if (!oResult || !oResult.svgContent) {
                    throw new Error("Selected vector has no SVG content.");
                }

                var svgString = oResult.svgContent.replace(/width="[^"]*" height="[^"]*"/, 'width="100%" height="100%"');
                var oViewModel = this.getView().getModel("view");
                oViewModel.setProperty("/svgContent", svgString);
                oViewModel.setProperty("/currentPlanKey", sPlanKey);
                oViewModel.setProperty("/selectedSavedVectorKey", sPlanKey);
                oViewModel.setProperty("/placedMarkers", []);
                this._setUploadStatus("Loaded saved vector: " + (oResult.fileName || sPlanKey), "Success");
                this._attachSvgClickHandlers(svgString);
            } catch (error) {
                console.error("Error loading selected vector:", error);
                this._setUploadStatus("Error loading selected saved vector.", "Error");
                MessageBox.error("Error loading selected saved vector: " + error.message);
            } finally {
                this._setConverting(false);
            }
        },

        _saveCurrentVector: async function (sPlanKey, sFileName, sSvgContent) {
            if (!sPlanKey || !sSvgContent) {
                return;
            }
            try {
                var oResponse = await fetch("/odata/v4/real-estate/SaveMyMasterplanVector", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        planKey: sPlanKey,
                        fileName: sFileName || sPlanKey,
                        svgContent: sSvgContent,
                        scope: this._getLayoutScope(),
                        customerId: null
                    })
                });

                if (!oResponse.ok) {
                    throw new Error("Failed to save vector.");
                }

                await this._loadSavedVectors();
                this.getView().getModel("view").setProperty("/selectedSavedVectorKey", sPlanKey);
                window.localStorage.setItem(SAVED_VECTOR_STORAGE_KEY, sPlanKey);
            } catch (error) {
                console.error("Error saving vector:", error);
            }
        },

        onFileChange: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oFileUploader.oFileUpload.files;

            if (aFiles.length === 0) return;

            var oFile = aFiles[0];
            if (!oFile) return;

            var sFileName = oFile.name.toLowerCase();
            var sFileType = oFile.type || "";

            // Start fresh for each uploaded file
            this.getView().getModel("view").setProperty("/placedMarkers", []);
            this.getView().getModel("view").setProperty("/currentPlanKey", this._buildPlanKey(oFile.name));
            this.getView().getModel("view").setProperty("/selectedSavedVectorKey", this._buildPlanKey(oFile.name));
            window.localStorage.setItem(SAVED_VECTOR_STORAGE_KEY, this._buildPlanKey(oFile.name));
            
            // SVG files are loaded directly; all other files are vectorized via backend.
            var isSvg = sFileName.endsWith('.svg') || sFileType === "image/svg+xml";

            if (isSvg) {
                this._handleSvgFile(oFile);
            } else {
                this._handleVectorizerConversion(oFile);
            }
        },

        _handleSvgFile: function (oFile) {
            // Update status
            this._setUploadStatus("Loading SVG file...", "Information");

            var reader = new FileReader();
            reader.onload = async function (e) {
                var svgContent = e.target.result;
                // Ensure SVG fills the container exactly for accurate coordinate transformation
                svgContent = svgContent.replace(/width="[^"]*" height="[^"]*"/, 'width="100%" height="100%"');
                this.getView().getModel("view").setProperty("/svgContent", svgContent);
                console.log(svgContent);

                // Update status
                this._setUploadStatus("SVG loaded successfully. Click on buildings to view units.", "Success");

                // Parse SVG and attach click handlers
                this._attachSvgClickHandlers(svgContent);
                await this._saveCurrentVector(this._buildPlanKey(oFile.name), oFile.name, svgContent);
            }.bind(this);

            reader.onerror = function () {
                this._setUploadStatus("Error loading SVG file.", "Error");
            }.bind(this);

            reader.readAsText(oFile);
        },

        _handleVectorizerConversion: function (oFile) {
            this._setUploadStatus("Converting file to SVG with Vectorizer.ai... This may take a moment.", "Information");
            this._setConverting(true);

            var reader = new FileReader();
            reader.onload = async function (e) {
                try {
                    var sDataUrl = e.target.result || "";
                    var sBase64 = sDataUrl.split(",")[1];
                    if (!sBase64) {
                        throw new Error("Invalid file payload.");
                    }

                    var oResponse = await fetch("/odata/v4/real-estate/ConvertMasterplanToSvg", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            fileName: oFile.name,
                            mimeType: oFile.type || "application/octet-stream",
                            base64Data: sBase64
                        })
                    });

                    var oResult = await oResponse.json();
                    if (!oResponse.ok || !oResult || !oResult.svgContent) {
                        var sError = oResult && oResult.error && oResult.error.message ? oResult.error.message : "Vectorization failed.";
                        throw new Error(sError);
                    }

                    var svgString = oResult.svgContent.replace(/width="[^"]*" height="[^"]*"/, 'width="100%" height="100%"');
                    this.getView().getModel("view").setProperty("/svgContent", svgString);
                    this._setUploadStatus("File converted successfully. Click on buildings to view units.", "Success");
                    this._attachSvgClickHandlers(svgString);
                    await this._saveCurrentVector(this._buildPlanKey(oFile.name), oFile.name, svgString);
                } catch (error) {
                    console.error("Error converting file to SVG:", error);
                    this._setUploadStatus("Error converting file to SVG.", "Error");
                    MessageBox.error("Error converting file to SVG: " + error.message);
                } finally {
                    this._setConverting(false);
                }
            }.bind(this);

            reader.onerror = function () {
                this._setUploadStatus("Error reading uploaded file.", "Error");
                MessageBox.error("Error reading uploaded file.");
                this._setConverting(false);
            }.bind(this);

            reader.readAsDataURL(oFile);
        },

        onSavedVectorChange: async function (oEvent) {
            var sPlanKey = oEvent.getParameter("selectedItem")
                ? oEvent.getParameter("selectedItem").getKey()
                : oEvent.getParameter("selectedKey");
            if (!sPlanKey) {
                this.getView().getModel("view").setProperty("/svgContent", "");
                this.getView().getModel("view").setProperty("/currentPlanKey", "");
                this.getView().getModel("view").setProperty("/placedMarkers", []);
                this._setUploadStatus("Please select a vector or upload a masterplan file.", "Information");
                window.localStorage.setItem(SAVED_VECTOR_STORAGE_KEY, "");
                return;
            }

            await this._loadSavedVectorByKey(sPlanKey, { persistSelection: true });
        },

        onDeleteSavedVector: async function () {
            var oViewModel = this.getView().getModel("view");
            var sPlanKey = (oViewModel.getProperty("/selectedSavedVectorKey") || "").trim();
            if (!sPlanKey) {
                MessageBox.information("Please select a saved vector to delete.");
                return;
            }

            var bConfirmed = await new Promise(function (resolve) {
                MessageBox.confirm("Delete selected saved vector?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.CANCEL,
                    onClose: function (sAction) {
                        resolve(sAction === MessageBox.Action.OK);
                    }
                });
            });
            if (!bConfirmed) {
                return;
            }

            try {
                var oResponse = await fetch("/odata/v4/real-estate/DeleteMyMasterplanVector", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        planKey: sPlanKey,
                        scope: this._getLayoutScope(),
                        customerId: null
                    })
                });

                var oRaw = await oResponse.json();
                var bDeleted = oRaw && typeof oRaw === "object" && Object.prototype.hasOwnProperty.call(oRaw, "value")
                    ? !!oRaw.value
                    : !!oRaw;

                if (!oResponse.ok) {
                    var sError = oRaw && oRaw.error && oRaw.error.message ? oRaw.error.message : "Failed to delete vector.";
                    throw new Error(sError);
                }
                if (!bDeleted) {
                    throw new Error("Saved vector was not found.");
                }

                oViewModel.setProperty("/selectedSavedVectorKey", "");
                oViewModel.setProperty("/currentPlanKey", "");
                oViewModel.setProperty("/svgContent", "");
                oViewModel.setProperty("/placedMarkers", []);
                window.localStorage.setItem(SAVED_VECTOR_STORAGE_KEY, "");
                await this._loadSavedVectors();
                this._setUploadStatus("Saved vector deleted.", "Success");
            } catch (error) {
                console.error("Error deleting vector:", error);
                MessageBox.error("Error deleting saved vector: " + error.message);
            }
        },

        onTypeMissmatch: function (oEvent) {
            MessageBox.error("Please upload a valid file.");
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
                var oContainerDomRef = svgContainer.getDomRef();
                if (!this._boundOnDragOver) {
                    this._boundOnDragOver = this.onDragOver.bind(this);
                }
                if (!this._boundOnDrop) {
                    this._boundOnDrop = this.onDrop.bind(this);
                }
                oContainerDomRef.removeEventListener("dragover", this._boundOnDragOver);
                oContainerDomRef.removeEventListener("drop", this._boundOnDrop);
                oContainerDomRef.addEventListener("dragover", this._boundOnDragOver);
                oContainerDomRef.addEventListener("drop", this._boundOnDrop);

                // Load persisted markers for current plan and render
                this._loadMarkersForCurrentPlan(svgElement, gElement);

            }.bind(this), 100); // Reduced timeout
        },

        _setConverting: function (bConverting) {
            this.getView().getModel("view").setProperty("/converting", bConverting);
            this.getView().setBusy(!!bConverting);
        },

        _buildPlanKey: function (sFileName) {
            return String(sFileName || "").trim().toLowerCase();
        },

        _getLayoutScope: function () {
            return this.getView().getModel("view").getProperty("/layoutScope") || "USER";
        },

        _getSelectedReservationPartnerId: function () {
            var sId = this.getView().getModel("view").getProperty("/selectedReservationPartnerId");
            return sId ? String(sId).trim() : null;
        },

        _getCoordinateBounds: function (svgElement, gElement) {
            var target = gElement || svgElement;
            var fallback = { minX: 0, minY: 0, width: 1, height: 1 };
            if (!target) {
                return fallback;
            }

            try {
                if (target.getBBox) {
                    var b = target.getBBox();
                    if (b && isFinite(b.width) && isFinite(b.height) && b.width > 0 && b.height > 0) {
                        return { minX: b.x, minY: b.y, width: b.width, height: b.height };
                    }
                }
            } catch (e) {
                // Ignore and fallback below.
            }

            var vb = svgElement && svgElement.viewBox && svgElement.viewBox.baseVal;
            if (vb && isFinite(vb.width) && isFinite(vb.height) && vb.width > 0 && vb.height > 0) {
                return { minX: vb.x, minY: vb.y, width: vb.width, height: vb.height };
            }

            return fallback;
        },

        _toNormalizedPoint: function (x, y, oBounds) {
            var width = oBounds && oBounds.width ? oBounds.width : 1;
            var height = oBounds && oBounds.height ? oBounds.height : 1;
            var minX = oBounds && isFinite(oBounds.minX) ? oBounds.minX : 0;
            var minY = oBounds && isFinite(oBounds.minY) ? oBounds.minY : 0;
            return {
                xNorm: Math.max(0, Math.min(1, (x - minX) / width)),
                yNorm: Math.max(0, Math.min(1, (y - minY) / height))
            };
        },

        _fromNormalizedPoint: function (xNorm, yNorm, oBounds) {
            var width = oBounds && oBounds.width ? oBounds.width : 1;
            var height = oBounds && oBounds.height ? oBounds.height : 1;
            var minX = oBounds && isFinite(oBounds.minX) ? oBounds.minX : 0;
            var minY = oBounds && isFinite(oBounds.minY) ? oBounds.minY : 0;
            return {
                x: minX + (Number(xNorm) || 0) * width,
                y: minY + (Number(yNorm) || 0) * height
            };
        },

        _schedulePersistMarkers: function (svgElement, gElement) {
            if (this._persistTimer) {
                clearTimeout(this._persistTimer);
            }
            this._persistTimer = setTimeout(function () {
                this._persistMarkersForCurrentPlan(svgElement, gElement);
            }.bind(this), 600);
        },

        _persistMarkersForCurrentPlan: async function (svgElement, gElement) {
            var oViewModel = this.getView().getModel("view");
            var sPlanKey = oViewModel.getProperty("/currentPlanKey");
            var sSelectedPartnerId = this._getSelectedReservationPartnerId();
            if (!sPlanKey || !svgElement) {
                return;
            }

            var oBounds = this._getCoordinateBounds(svgElement, gElement);
            var aMarkers = oViewModel.getProperty("/placedMarkers") || [];
            var aPayloadMarkers = aMarkers
                .map(function (oMarker) {
                    if (!oMarker || !oMarker.unit || !oMarker.unit.unitId) {
                        return null;
                    }
                    var sMarkerPartnerId = oMarker.reservationPartnerId ? String(oMarker.reservationPartnerId).trim() : null;
                    if ((sSelectedPartnerId || null) !== sMarkerPartnerId) {
                        return null;
                    }
                    var oNorm = this._toNormalizedPoint(Number(oMarker.x) || 0, Number(oMarker.y) || 0, oBounds);
                    return {
                        unitId: oMarker.unit.unitId,
                        xNorm: Number(oNorm.xNorm.toFixed(6)),
                        yNorm: Number(oNorm.yNorm.toFixed(6)),
                        color: (oMarker.unit && (oMarker.unit.unitStatusColor || this._getUnitStatusColor(oMarker.unit.unitStatusDescription))) || oMarker.color || "#FF0000",
                        size: Number(oMarker.size || 5),
                        reservationPartnerId: sSelectedPartnerId
                    };
                }.bind(this))
                .filter(Boolean);

            try {
                var oResponse = await fetch("/odata/v4/real-estate/SaveMyMasterplanLayout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        planKey: sPlanKey,
                        scope: this._getLayoutScope(),
                        customerId: null,
                        reservationPartnerId: this._getSelectedReservationPartnerId(),
                        markers: aPayloadMarkers
                    })
                });

                if (!oResponse.ok) {
                    var oError = await oResponse.json().catch(function () { return null; });
                    var sError = oError && oError.error && oError.error.message ? oError.error.message : "Failed to save marker layout.";
                    throw new Error(sError);
                }
            } catch (err) {
                console.error("Error saving masterplan markers:", err);
                this._setUploadStatus("Marker save failed. You can continue working and retry by changing markers.", "Warning");
            }
        },

        _loadMarkersForCurrentPlan: async function (svgElement, gElement) {
            var oViewModel = this.getView().getModel("view");
            var sPlanKey = oViewModel.getProperty("/currentPlanKey");
            if (!sPlanKey || !svgElement) {
                this._renderMarkers(svgElement, gElement);
                return;
            }

            try {
                var oResponse = await fetch("/odata/v4/real-estate/GetMyMasterplanLayout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        planKey: sPlanKey,
                        scope: this._getLayoutScope(),
                        customerId: null,
                        reservationPartnerId: this._getSelectedReservationPartnerId()
                    })
                });

                if (!oResponse.ok) {
                    throw new Error("Failed to load saved markers.");
                }

                var oData = await oResponse.json();
                var aSaved = Array.isArray(oData && oData.value) ? oData.value : [];
                var aUnits = oViewModel.getProperty("/units") || [];
                var oBounds = this._getCoordinateBounds(svgElement, gElement);

                var aMarkers = aSaved.map(function (oSaved) {
                    var oPos = this._fromNormalizedPoint(oSaved.xNorm, oSaved.yNorm, oBounds);
                    var oUnit = aUnits.find(function (u) {
                        return u.unitId === oSaved.unitId;
                    }) || { unitId: oSaved.unitId };
                    var sBuildingId = oUnit.buildingId || "";
                    var oBuilding = sBuildingId ? this._getBuildingById(sBuildingId) : null;
                    var aUnitsForBuilding = sBuildingId ? this._getUnitsForBuilding(sBuildingId) : [];
                    var oBuildingStatus = this._getBuildingStatusMeta(aUnitsForBuilding);
                    var sBuildingColor = (oBuilding && oBuilding.statusColor) || oBuildingStatus.color;
                    return {
                        x: oPos.x,
                        y: oPos.y,
                        size: Number(oSaved.size || 5),
                        color: sBuildingColor || (oUnit.unitStatusColor || this._getUnitStatusColor(oUnit.unitStatusDescription)) || "#FF0000",
                        reservationPartnerId: oSaved.reservationPartnerId || null,
                        buildingId: sBuildingId,
                        buildingDescription: (oBuilding && oBuilding.buildingDescription) || oUnit.buildingDescription || "",
                        unitCount: aUnitsForBuilding.length,
                        statusHighlight: oBuildingStatus.highlight,
                        unit: oUnit
                    };
                }.bind(this));

                oViewModel.setProperty("/placedMarkers", aMarkers);
                if (aMarkers.length > 0) {
                    this._setUploadStatus("Loaded " + aMarkers.length + " saved marker(s).", "Success");
                }
            } catch (err) {
                console.error("Error loading masterplan markers:", err);
            } finally {
                this._renderMarkers(svgElement, gElement);
            }
        },

        _getPointInElementCoordinates: function (clientX, clientY, svgElement, targetElement) {
            if (!svgElement || !targetElement || !targetElement.getScreenCTM || !svgElement.createSVGPoint) {
                return null;
            }

            var ctm = targetElement.getScreenCTM();
            if (!ctm) {
                return null;
            }

            var point = svgElement.createSVGPoint();
            point.x = clientX;
            point.y = clientY;
            var transformedPoint = point.matrixTransform(ctm.inverse());
            return { x: transformedPoint.x, y: transformedPoint.y };
        },

        _getOrCreateMarkerLayer: function (svgElement, gElement) {
            var markerLayer = svgElement.querySelector(".unit-marker-layer");
            if (!markerLayer) {
                markerLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
                markerLayer.classList.add("unit-marker-layer");
                svgElement.appendChild(markerLayer);
            }

            var transform = gElement ? gElement.getAttribute("transform") : null;
            if (transform) {
                markerLayer.setAttribute("transform", transform);
            } else {
                markerLayer.removeAttribute("transform");
            }

            markerLayer.setAttribute("opacity", "1");
            markerLayer.setAttribute("fill-opacity", "1");
            markerLayer.style.opacity = "1";
            markerLayer.style.mixBlendMode = "normal";
            return markerLayer;
        },

        _darkenColor: function (sHexColor, ratio) {
            if (!sHexColor || typeof sHexColor !== "string") {
                return "#CC0000";
            }

            var sHex = sHexColor.replace("#", "");
            if (sHex.length === 3) {
                sHex = sHex.split("").map(function (c) {
                    return c + c;
                }).join("");
            }

            if (sHex.length !== 6) {
                return "#CC0000";
            }

            var r = parseInt(sHex.substring(0, 2), 16);
            var g = parseInt(sHex.substring(2, 4), 16);
            var b = parseInt(sHex.substring(4, 6), 16);
            var factor = typeof ratio === "number" ? ratio : 0.8;

            r = Math.max(0, Math.min(255, Math.round(r * factor)));
            g = Math.max(0, Math.min(255, Math.round(g * factor)));
            b = Math.max(0, Math.min(255, Math.round(b * factor)));

            var toHex = function (value) {
                return value.toString(16).padStart(2, "0");
            };

            return "#" + toHex(r) + toHex(g) + toHex(b);
        },

        _getUnitStatusColor: function (sUnitStatusDescription) {
            return this._getStatusMeta(sUnitStatusDescription).color;
        },




        _renderMarkers: function (svgElement, gElement) {
            // Remove existing markers
            var existingMarkers = svgElement.querySelectorAll(".unit-marker");
            existingMarkers.forEach(function (marker) {
                marker.remove();
            });

            var markerLayer = this._getOrCreateMarkerLayer(svgElement, gElement);

            var aMarkers = this.getView().getModel("view").getProperty("/placedMarkers") || [];
            console.log("Rendering", aMarkers.length, "markers");

            aMarkers.forEach(function (oMarker, index) {
                var sBuildingId = oMarker && oMarker.buildingId ? oMarker.buildingId : (oMarker.unit && oMarker.unit.buildingId) || "Unknown";
                var sMarkerColor = oMarker.color || (oMarker.unit && (oMarker.unit.unitStatusColor || this._getUnitStatusColor(oMarker.unit.unitStatusDescription))) || "#FF0000";
                var sHoverColor = this._darkenColor(sMarkerColor, 0.8);
                var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", oMarker.x);
                circle.setAttribute("cy", oMarker.y);
                circle.setAttribute("r", Math.max(oMarker.size, 8)); // Ensure minimum visible size
                circle.setAttribute("fill", sMarkerColor);
                circle.setAttribute("stroke", "black");
                circle.setAttribute("stroke-width", "2");
                circle.setAttribute("opacity", "1");
                circle.setAttribute("fill-opacity", "1");
                circle.setAttribute("stroke-opacity", "1");
                circle.classList.add("unit-marker");
                circle.style.cursor = "pointer";
                circle.style.opacity = "1";
                circle.style.mixBlendMode = "normal";

                // Add building ID as title for debugging
                var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
                title.textContent = "Building: " + sBuildingId + " (x:" + oMarker.x.toFixed(2) + ", y:" + oMarker.y.toFixed(2) + ")";
                circle.appendChild(title);

                console.log("Marker", index, "- Building:", sBuildingId, "Position:", oMarker.x, oMarker.y, "Size:", oMarker.size);

                // Hover effects
                circle.addEventListener("mouseover", function () {
                    this.setAttribute("fill", sHoverColor);
                    this.setAttribute("r", Math.max(oMarker.size + 2, 10));
                });
                circle.addEventListener("mouseout", function () {
                    this.setAttribute("fill", sMarkerColor);
                    this.setAttribute("r", Math.max(oMarker.size, 8));
                });

                // Click for building units
                circle.addEventListener("click", function (event) {
                    this._showBuildingUnits(oMarker, event);
                }.bind(this));

                markerLayer.appendChild(circle);
                console.log("Appended marker to marker layer");
            }.bind(this));

            console.log("Finished rendering markers. Total markers in DOM:", svgElement.querySelectorAll(".unit-marker").length);
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
            var sControlId = (oEvent.currentTarget && oEvent.currentTarget.id) || (oEvent.target && oEvent.target.id);
            var oItem = sap.ui.getCore().byId(sControlId);
            if (oItem && oItem.getBindingContext) {
                var oContext = oItem.getBindingContext("view");
                if (oContext) {
                    var oBuilding = oContext.getObject();
                    if (!oBuilding || !oBuilding.buildingId) {
                        return;
                    }
                    console.log("Dragging building:", oBuilding.buildingId);
                    oEvent.dataTransfer.setData("application/json", JSON.stringify({
                        type: "building",
                        buildingId: oBuilding.buildingId
                    }));

                    // Create a small drag image (circle like the marker)
                    var dragImage = document.createElement('div');
                    dragImage.style.width = '10px';
                    dragImage.style.height = '10px';
                    dragImage.style.backgroundColor = oBuilding.statusColor || "#0070F2";
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

            var gElement = svgElement.querySelector("g");
            var targetElement = gElement || svgElement;
            var localPoint = this._getPointInElementCoordinates(oEvent.clientX, oEvent.clientY, svgElement, targetElement);

            if (!localPoint || isNaN(localPoint.x) || isNaN(localPoint.y)) {
                console.log("Could not compute drop coordinates");
                return;
            }

            var gx = localPoint.x;
            var gy = localPoint.y;
            console.log("Drop coordinates (local):", gx, gy);

            var data = oEvent.dataTransfer.getData("application/json");
            if (data) {
                var oPayload = JSON.parse(data);
                if (!oPayload) {
                    return;
                }

                if (oPayload.type === "building" || oPayload.buildingId) {
                    var sBuildingId = oPayload.buildingId || "";
                    var oBuilding = this._getBuildingById(sBuildingId);
                    if (!oBuilding) {
                        console.log("Building not found for drop:", sBuildingId);
                        return;
                    }

                    var aUnitsForBuilding = this._getUnitsForBuilding(oBuilding.buildingId);
                    var oRepresentativeUnit = aUnitsForBuilding[0] || null;
                    console.log("Dropped building:", oBuilding.buildingId);

                    var aMarkers = this.getView().getModel("view").getProperty("/placedMarkers") || [];
                    aMarkers.push({
                        x: gx,
                        y: gy,
                        size: 7,
                        color: oBuilding.statusColor || "#0070F2",
                        reservationPartnerId: this._getSelectedReservationPartnerId(),
                        buildingId: oBuilding.buildingId,
                        buildingDescription: oBuilding.buildingDescription || "",
                        unitCount: aUnitsForBuilding.length,
                        unit: oRepresentativeUnit
                    });
                    this.getView().getModel("view").setProperty("/placedMarkers", aMarkers);
                    console.log("Total markers:", aMarkers.length);
                    var gElement = svgElement.querySelector("g");
                    this._renderMarkers(svgElement, gElement);
                    this._schedulePersistMarkers(svgElement, gElement);
                    return;
                }

                if (oPayload.unitId) {
                    var oUnit = oPayload;
                    console.log("Dropped unit:", oUnit.unitId);
                    var aMarkersLegacy = this.getView().getModel("view").getProperty("/placedMarkers") || [];
                    aMarkersLegacy.push({
                        x: gx,
                        y: gy,
                        size: 5,
                        color: oUnit.unitStatusColor || this._getUnitStatusColor(oUnit.unitStatusDescription),
                        reservationPartnerId: this._getSelectedReservationPartnerId(),
                        unit: oUnit
                    });
                    this.getView().getModel("view").setProperty("/placedMarkers", aMarkersLegacy);
                    console.log("Total markers:", aMarkersLegacy.length);
                    var gElementLegacy = svgElement.querySelector("g");
                    this._renderMarkers(svgElement, gElementLegacy);
                    this._schedulePersistMarkers(svgElement, gElementLegacy);
                    return;
                }
            } else {
                console.log("No data in dataTransfer");
            }
        },

        _showBuildingUnits: function (oMarkerData, event) {
            var oMarker = event.target;
            var sBuildingId = oMarkerData.buildingId || (oMarkerData.unit && oMarkerData.unit.buildingId) || "";
            if (!sBuildingId) {
                return;
            }

            var aUnits = this._getUnitsForBuilding(sBuildingId);
            var oListModel = new sap.ui.model.json.JSONModel({ units: aUnits });
            var oUnitList = new List({
                updateFinished: function () {
                    this._applyUnitListItemStyling(oUnitList);
                }.bind(this),
                items: {
                    path: "/units",
                    template: new StandardListItem({
                        title: "{unitId}",
                        description: "{unitDescription}",
                        info: "{bua}",
                        infoState: "None",
                        type: "Active",
                        press: function (oEvent) {
                            var oUnit = oEvent.getSource().getBindingContext().getObject();
                            this._openUnitOptions(oUnit, oEvent.getSource());
                        }.bind(this)
                    })
                }
            });
            oUnitList.setModel(oListModel);

            var oPopover = new Popover({
                title: "Building " + sBuildingId + " Units",
                placement: "Bottom",
                contentWidth: "22rem",
                content: [oUnitList]
            });

            oPopover.openBy(oMarker);
        },

        _applyUnitListItemStyling: function (oList) {
            if (!oList) {
                return;
            }

            oList.getItems().forEach(function (oItem) {
                var domRef = oItem.getDomRef();
                var oContext = oItem.getBindingContext();
                var oUnit = oContext && oContext.getObject();
                var sColor = oUnit && (oUnit.unitStatusColor || this._getUnitStatusColor(oUnit.unitStatusDescription));
                if (!domRef) {
                    return;
                }

                domRef.style.backgroundColor = sColor || "";
                domRef.style.color = sColor ? "#FFFFFF" : "";
                domRef.style.borderRadius = sColor ? "0.25rem" : "";
                domRef.querySelectorAll(".sapMText, .sapUiIcon, .sapMLIBContent .sapMText").forEach(function (el) {
                    el.style.color = sColor ? "#FFFFFF" : "";
                });
            }.bind(this));
        },

        _openUnitOptions: function (oUnit, oAnchor) {
            if (!oUnit || !oAnchor) {
                return;
            }

            var aItems = [
                new sap.m.Button({
                    icon: "sap-icon://information",
                    text: "Details",
                    press: function () {
                        this._showUnitDetails(oUnit);
                        oPopover.close();
                    }.bind(this)
                })
            ];

            if (this._isCreateReservationAllowed(oUnit)) {
                aItems.push(
                    new sap.m.Button({
                        icon: "sap-icon://add-document",
                        text: "Create Reservation",
                        press: function () {
                            this._navigateToCreateReservation(oUnit);
                            oPopover.close();
                        }.bind(this)
                    })
                );
            }

            var oPopover = new Popover({
                title: "Unit Options",
                placement: "Bottom",
                content: [
                    new sap.m.HBox({
                        wrap: "Wrap",
                        items: aItems
                    })
                ]
            });

            oPopover.openBy(oAnchor);
        },

        _navigateToCreateReservation: function (unit) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var reservationData = {
                mode: "create",
                bua: unit.bua,
                companyCodeId: unit.companyCodeId,
                project_projectId: unit.projectId,
                buildingId: unit.buildingId,
                unit_unitId: unit.unitId,
                unitPrice: unit.originalPrice,
                unitStatusDescription: unit.unitStatusDescription,
                phase: unit.salesPhase,
                reservationType: unit.usageTypeDescription,
                unitType: unit.unitTypeDescription,
                currency: unit.conditions?.find(function (m) { return m.currency; })?.currency,
                description: unit.unitDescription || "",
                unitConditions: unit.unitConditions || []
            };
            var sData = encodeURIComponent(JSON.stringify(reservationData));
            oRouter.navTo("CreateReservation", { reservationData: sData });
        },


    });
});
