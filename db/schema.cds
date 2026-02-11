namespace real.estate;

using {managed} from '@sap/cds/common';

// entity CompanyCodes {
//     key companyCodeId          : String(4);
//         companyCodeDescription : String(60);
// }

entity Buildings {
        companyCodeId          : String(4);
        companyCodeDescription : String(60);
        project                : Association to Projects;
        projectId              : String(8);
        projectDescription     : String(60);
    key buildingId             : String(8);
        buildingDescription    : String(60);
        buildingOldCode        : String(8);

        location               : String(60);
        validFrom              : Date;
        validTo                : Date;
        businessArea           : Integer;
        profitCenter           : Integer;
        functionalArea         : Integer;

        units                  : Association to many Units
                                     on units.building = $self;
}

entity Projects : managed {
        companyCodeId          : String(4);
        companyCodeDescription : String(60);

    key projectId              : String(8);
        projectDescription     : String(60);

        validFrom              : Date;
        validTo                : Date;

        location               : String(40);
        businessArea           : Integer;
        profitCenter           : Integer;
        functionalArea         : Integer;

        supplementaryText      : String(255);

        buildings              : Composition of many Buildings
                                     on buildings.project = $self;

        paymentPlanProjects    : Association to many PaymentPlanProjects
                                     on paymentPlanProjects.project = $self;

}

entity Units : managed {
    companyCodeId            : String(4);
    companyCodeDescription   : String(60);

    project                  : Association to Projects;
    projectId                : String(8);
    projectDescription       : String(60);

    building                 : Association to Buildings;
    buildingId               : String(8);
    buildingOldCode          : String(20);
    buildingDescription      : String(60);  // <-- ADD THIS FIELD HERE

    key unitId               : String(8);
    unitOldCode              : String(20);
    unitDescription          : String(60);

    unitTypeCode             : String(4);
    unitTypeDescription      : String(60);

    usageTypeCode            : String(4);
    usageTypeDescription     : String(60);

    unitStatusCode           : String(4);
    unitStatusDescription    : String(60);

    floorCode                : String(4);
    floorDescription         : String(60);

    zone                     : String(60);
    salesPhase               : String(60);

    finishingSpexCode        : String(4);
    finishingSpexDescription : String(60);

    unitDeliveryDate         : Date;

    profitCenter             : Integer;
    functionalArea           : Integer;

    supplementaryText        : String(255);

    // Removed: savedSimulationId : String;  // No longer needed, as simulations are now a composition

    measurements             : Composition of many Measurements
                                   on measurements.unit = $self;
    conditions               : Composition of many Conditions
                                   on conditions.unit = $self;
    simulations              : Composition of many PaymentPlanSimulations
                                   on simulations.unit = $self;  // Added to allow many simulations per unit
    svgElementId             : String(100);  // ID of the SVG element corresponding to this unit
}
entity PaymentPlanSimulations : managed {
    key simulationId       : String;
        // Removed: unitId : String(8);  // Redundant with composition association
        projectId          : String(8);
        projectDescription : String(60);
        buildingId         : String(8);
        pricePlanYears     : Integer;
        leadId             : String(36);
        finalPrice         : Decimal(15, 2);
        userId             : String(100);
        createdOn          : Timestamp;
        createdBy          : String(100);

        unit               : Association to Units;
        project            : Association to Projects;
        building           : Association to Buildings;
        paymentPlan        : Association to PaymentPlans;

        schedule           : Composition of many PaymentPlanSimulationSchedules
                                 on schedule.simulation = $self;
}
entity Measurements : managed {
    key ID          : UUID;
        unit        : Association to Units;
        code        : String(20);
        description : String(60);
        quantity    : Decimal(15, 2);
        uom         : String(10);
}

entity Conditions : managed {
    key ID            : UUID;
        unit          : Association to Units;
        code          : String(20);
        description   : String(60);
        amount        : Decimal(15, 2);
        currency      : String(3);
        numberOfYears : Integer;

}


entity PaymentPlans : managed {
    key paymentPlanId    : UUID;
        description      : String(60);
        companyCodeId    : String(4);
        planYears        : Integer;
        validFrom        : Date;
        validTo          : Date;
        planStatus       : String(1);

        // Composition of schedule items
        schedule         : Composition of many PaymentPlanSchedules
                               on schedule.paymentPlan = $self;

        // Assigned projects
        assignedProjects : Composition of many PaymentPlanProjects
                               on assignedProjects.paymentPlan = $self;
}

entity PaymentPlanSchedules : managed {
    key ID                   : UUID;

        paymentPlan          : Association to PaymentPlans;

        conditionType        : Association to ConditionTypes;
        basePrice            : Association to BasePrices;
        calculationMethod    : Association to CalculationMethods;
        frequency            : Association to Frequencies;


        percentage           : Decimal(5, 2);
        dueInMonth           : Integer;
        numberOfInstallments : Integer;
        numberOfYears        : Integer;
}

entity PaymentPlanProjects : managed {
    key ID          : UUID;
        paymentPlan : Association to PaymentPlans;
        project     : Association to Projects;
}

entity ConditionTypes {
    key code        : String(4);
        description : String(60);
}

entity BasePrices {
    key code        : String(4);
        description : String(60);
}

entity CalculationMethods {
    key code        : String(4);
        description : String(60);
}

entity Frequencies {
    key code        : String(4);
        description : String(60);
}


entity EOI : managed {
    key eoiId           : String(8);
        eoiType         : String(40);
        status          : String(30);
        date            : Date;
        companyCode     : String(10);
        projectId       : String(8);
        launch          : String(50);
        projectPhase    : String(50);
        salesOffice     : String(50);
        unitType        : String(50);
        totalEoiValue   : Decimal(15, 2);
        amountInArabic  : String(255);
        collectedAmount : Decimal(15, 2);
        remainingAmount : Decimal(15, 2);
        leadId          : String(36);
        nationality     : String(50);
        passportId      : String(30);
        nationalId      : String(30);
        mobile1         : String(20);
        mobile2         : String(20);
        customerId      : String(36);
        creationDate    : DateTime;
        brokerId        : String(36);
        pcId            : String(36);
        teamLeadId      : String(36);
        managerId       : String(36);
        validatedOn     : DateTime;
        validatedBy     : String(60);

        paymentDetails  : Composition of many PaymentDetails
                              on paymentDetails.eoi = $self;
}

entity PaymentDetails : managed {
    key ID                  : UUID;
        eoi                 : Association to EOI;
        receiptType         : String(40);
        receiptStatus       : String(30);
        paymentMethod       : String(30);
        amount              : Decimal(15, 2);
        houseBank           : String(40);
        bankAccount         : String(40);
        dueDate             : Date;
        transferNumber      : String(40);
        checkNo             : String(30);
        customerBank        : String(60);
        customerBankAccount : String(40);
        branch              : String(40);
        collectedAmount     : Decimal(15, 2);
        arValidated         : Boolean default false;
        rejectionReason     : String(255);
}

entity Reservations : managed {
    key reservationId      : UUID;
        companyCodeId      : String(4);
        oldReservationId   : String(20);
        eoiId              : String(20);
        salesType          : String(20);
        description        : String(100);
        validFrom          : Date;
        status             : String(20);
        customerType       : String(20);
        currency           : String(3);
        afterSales         : String(20);

        /* --- Unit Details --- */
        project            : Association to Projects;
        building           : Association to Buildings;
        unit               : Association to Units;
        bua                : Decimal(15, 2);
        phase              : String(20);
        pricePlanYears     : Integer;
        reservationType:String(20);
        unitType:String(20);
        reservationStatus:String(20);
        /* --- Partners --- */
        partners           : Composition of many ReservationPartners
                                 on partners.reservation = $self;

        /* --- Conditions --- */
        conditions         : Composition of many ReservationConditions
                                 on conditions.reservation = $self;

        /* --- Payment Plan --- */
        paymentPlan        : Association to PaymentPlans;
        planYears          : Integer;
        unitPrice          : Decimal(15, 2);
        planCurrency       : String(3);

        /* --- Cancellation --- */
        requestType        : String(30);
        reason             : String(100);
        cancellationDate   : Date;
        cancellationStatus : String(20);
        rejectionReason    : String(100);
        cancellationFees   : Decimal(15, 2);

        /* --- Payment Details --- */
        payments           : Composition of many ReservationPayments
                                 on payments.reservation = $self;
}

/* --- Partner Table --- */
entity ReservationPartners : managed {
    key ID              : UUID;
        reservation     : Association to Reservations;
        customerCode    : String(20);
        customerName    : String(60);
        customerAddress : String(120);
        validFrom       : Date;
}

/* --- Conditions Table --- */
entity ReservationConditions : managed {
    key ID          : UUID;

    reservation     : Association to Reservations;  // Association to parent reservation
    conditionType   : Association to ConditionTypes;  // Association for code validation (e.g., ZZ01)

    dueDate         : Date;  // Due date for the condition

    // Type-specific amounts (replaces general 'amount' for better separation)
    downPaymentAmount     : Decimal(15,2);  // Amount specifically for down payment
    installmentAmount     : Decimal(15,2);  // Amount for installments
    maintenanceAmount     : Decimal(15,2);  // Amount for maintenance

    // Descriptions (optional, for UI display or notes)
    downPaymentDescription     : String(255);
    installmentDescription     : String(255);
    maintenanceDescription     : String(255);
}


/* --- Payment Details Table --- */
entity ReservationPayments : managed {
    key ID                  : UUID;
        reservation         : Association to Reservations;
        receiptType         : String(20);
        receiptStatus       : String(20);
        paymentMethod       : String(30);
        amount              : Decimal(15, 2);
        houseBank           : String(30);
        bankAccount         : String(30);
        dueDate             : Date;
        transferNumber      : String(30);
        checkNumber         : String(30);
        customerBank        : String(30);
        customerBankAccount : String(30);
        branch              : String(30);
        collectedAmount     : Decimal(15, 2);
        arValidated         : Boolean;
        rejectionReason     : String(100);
}




entity PaymentPlanSimulationSchedules : managed {
    key ID            : UUID;
        simulation    : Association to PaymentPlanSimulations;
        conditionType : String(40);
        dueDate       : Date;
        amount        : Decimal(15, 2);
        maintenance   : Decimal(15, 2);
}
