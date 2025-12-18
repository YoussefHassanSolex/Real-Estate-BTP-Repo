sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("dboperations.controller.DBOperations", {
        onInit() { },
        onNavigateToProjects() {
            this.getOwnerComponent().getRouter().navTo("Projects");
        },
        onNavigateToBuildings() {
            this.getOwnerComponent().getRouter().navTo("Buildings");
        },
        onNavigateToUnits() {
            this.getOwnerComponent().getRouter().navTo("Units");
        },
          onNavigateToPaymentPlans() {
            this.getOwnerComponent().getRouter().navTo("PaymentPlans");
        },
           onNavigateToPaymentPlanSchedules() {
            this.getOwnerComponent().getRouter().navTo("PaymentPlanSchedules");
        },
           onNavigateToPaymentPlanProjects() {
            this.getOwnerComponent().getRouter().navTo("PaymentPlanProjects");
        },
           onNavigateToReservations() {
            this.getOwnerComponent().getRouter().navTo("Reservations");
        },
            onNavigateToEOI() {
            this.getOwnerComponent().getRouter().navTo("EOI");
        },
        //     onNavigateToPaymentPlanSimulations() {
        //     this.getOwnerComponent().getRouter().navTo("PaymentPlanSimulations");
        // },
            onNavigateToConditionTypes() {
            this.getOwnerComponent().getRouter().navTo("ConditionTypes");
        },
           onNavigateToCalculationMethods() {
            this.getOwnerComponent().getRouter().navTo("CalculationMethods");
        },
          onNavigateToFrequencies() {
            this.getOwnerComponent().getRouter().navTo("Frequencies");
        },
          onNavigateToMeasurements() {
            this.getOwnerComponent().getRouter().navTo("Measurements");
        },
          onNavigateToConditions() {
            this.getOwnerComponent().getRouter().navTo("Conditions");
        },
          onNavigateToBasePrices() {
            this.getOwnerComponent().getRouter().navTo("BasePrices");
        },
    });
});