using real.estate as my from '../db/schema';
using { API_RECONTRACT_0001 as external } from './external/API_RECONTRACT_0001';

service RealEstateService {
    entity Buildings                 as projection on my.Buildings;
    entity Units                     as projection on my.Units;
    entity Projects                  as projection on my.Projects;
    entity Measurements              as projection on my.Measurements;
    entity Conditions                as projection on my.Conditions;
    entity PaymentPlans              as projection on my.PaymentPlans;
    entity PaymentPlanSchedules      as projection on my.PaymentPlanSchedules;
    entity PaymentPlanProjects       as projection on my.PaymentPlanProjects;
    entity ConditionTypes       as projection on my.ConditionTypes;
    entity Frequencies          as projection on my.Frequencies;
    entity CalculationMethods   as projection on my.CalculationMethods;
    entity BasePrices   as projection on my.BasePrices;

    entity EOI                       as projection on my.EOI;
    entity PaymentDetails            as projection on my.PaymentDetails;
    entity Reservations              as projection on my.Reservations;
    entity ReservationPartners       as projection on my.ReservationPartners;
    entity ReservationConditions     as projection on my.ReservationConditions;
    entity ReservationPayments       as projection on my.ReservationPayments;
    entity PaymentPlanSimulations     as projection on my.PaymentPlanSimulations;
    entity PaymentPlanSimulationSchedules as projection on my.PaymentPlanSimulationSchedules;
    entity RealEstateContracts as projection on external.A_REContract;
}
