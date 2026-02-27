using real.estate as my from '../db/schema';

service RealEstateService {
    // entity CompanyCodes                   as projection on my.CompanyCodes;
    entity Buildings                      as projection on my.Buildings;
    entity Units                          as projection on my.Units;
    entity Projects                       as projection on my.Projects;
    entity Measurements                   as projection on my.Measurements;
    entity Conditions                     as projection on my.Conditions;
    entity PaymentPlans                   as projection on my.PaymentPlans;
    entity PaymentPlanSchedules           as projection on my.PaymentPlanSchedules;
    entity PaymentPlanProjects            as projection on my.PaymentPlanProjects;
    entity ConditionTypes                 as projection on my.ConditionTypes;
    entity Frequencies                    as projection on my.Frequencies;
    entity CalculationMethods             as projection on my.CalculationMethods;
    entity BasePrices                     as projection on my.BasePrices;

    entity EOI                            as projection on my.EOI;
    entity PaymentDetails                 as projection on my.PaymentDetails;
    entity Reservations                   as projection on my.Reservations;
    entity ReservationPartners            as projection on my.ReservationPartners;
    entity ReservationConditions          as projection on my.ReservationConditions;
    entity ReservationPayments            as projection on my.ReservationPayments;
    entity MasterplanLayouts              as projection on my.MasterplanLayouts;
    entity MasterplanVectors              as projection on my.MasterplanVectors;
    entity MasterplanMarkers              as projection on my.MasterplanMarkers;
    entity PaymentPlanSimulations         as projection on my.PaymentPlanSimulations;
    entity PaymentPlanSimulationSchedules as projection on my.PaymentPlanSimulationSchedules;

    entity RealEstateContracts {
        key REContract        : String;
            CompanyCode       : String;
            Responsible       : String;
            REContractType    : String;
            ContractStartDate : Date;
    }

    action CreateREContract(
    CompanyCode        : String,
    Responsible        : String,
    REContractType     : String,
    ContractStartDate  : Date
  ) returns RealEstateContracts;

    type SvgConversionResult {
        svgContent : LargeString;
    }

    type MasterplanVectorHeader {
        planKey  : String(255);
        fileName : String(255);
    }

    type MasterplanVectorResult {
        planKey    : String(255);
        fileName   : String(255);
        svgContent : LargeString;
    }

    type MasterplanMarkerInput {
        unitId : String(8);
        xNorm  : Decimal(9, 6);
        yNorm  : Decimal(9, 6);
        color  : String(10);
        size   : Decimal(9, 3);
        reservationPartnerId : UUID;
    }

     action ConvertMasterplanToSvg(
        fileName   : String,
        mimeType   : String,
        base64Data : LargeString
    ) returns SvgConversionResult;

    action SaveMyMasterplanLayout(
        planKey    : String(255),
        scope      : String(20),
        customerId : String(36),
        reservationPartnerId : UUID,
        markers    : many MasterplanMarkerInput
    ) returns UUID;

    action GetMyMasterplanLayout(
        planKey    : String(255),
        scope      : String(20),
        customerId : String(36),
        reservationPartnerId : UUID
    ) returns many MasterplanMarkerInput;

    action SaveMyMasterplanVector(
        planKey    : String(255),
        fileName   : String(255),
        svgContent : LargeString,
        scope      : String(20),
        customerId : String(36)
    ) returns UUID;

    action ListMyMasterplanVectors(
        scope      : String(20),
        customerId : String(36)
    ) returns many MasterplanVectorHeader;

    action GetMyMasterplanVector(
        planKey    : String(255),
        scope      : String(20),
        customerId : String(36)
    ) returns MasterplanVectorResult;
}
