/* checksum : 7a6e29429919004dce021230e1948164 */
@cds.external : true
type API_RECONTRACT_0001.SAP__Message {
  code : String not null;
  message : String not null;
  target : String;
  additionalTargets : many String not null;
  transition : Boolean not null;
  @odata.Type : 'Edm.Byte'
  numericSeverity : Integer not null;
  longtextUrl : String;
};

@cds.external : true
@CodeList.CurrencyCodes.Url : '../../../../default/iwbep/common/0001/$metadata'
@CodeList.CurrencyCodes.CollectionPath : 'Currencies'
@CodeList.UnitsOfMeasure.Url : '../../../../default/iwbep/common/0001/$metadata'
@CodeList.UnitsOfMeasure.CollectionPath : 'UnitsOfMeasure'
@Common.ApplyMultiUnitBehaviorForSortingAndFiltering : true
@Capabilities.FilterFunctions : [
  'eq',
  'ne',
  'gt',
  'ge',
  'lt',
  'le',
  'and',
  'or',
  'contains',
  'startswith',
  'endswith',
  'any',
  'all'
]
@Capabilities.SupportedFormats : [ 'application/json', 'application/pdf' ]
@PDF.Features.DocumentDescriptionReference : '../../../../default/iwbep/common/0001/$metadata'
@PDF.Features.DocumentDescriptionCollection : 'MyDocumentDescriptions'
@PDF.Features.ArchiveFormat : true
@PDF.Features.Border : true
@PDF.Features.CoverPage : true
@PDF.Features.FitToPage : true
@PDF.Features.FontName : true
@PDF.Features.FontSize : true
@PDF.Features.HeaderFooter : true
@PDF.Features.IANATimezoneFormat : true
@PDF.Features.Margin : true
@PDF.Features.Padding : true
@PDF.Features.ResultSizeDefault : 20000
@PDF.Features.ResultSizeMaximum : 20000
@PDF.Features.Signature : true
@PDF.Features.TextDirectionLayout : true
@PDF.Features.Treeview : true
@PDF.Features.UploadToFileShare : true
@Capabilities.KeyAsSegmentSupported : true
@Capabilities.AsynchronousRequestsSupported : true
service API_RECONTRACT_0001 {};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Real Estate Contract'
@Common.SemanticKey : [ 'CompanyCode', 'RealEstateContract' ]
@Common.Messages : SAP__Messages
@Capabilities.NavigationRestrictions.RestrictedProperties : [
  {
    NavigationProperty: _REAdjustmentTermTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _REConditionTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _RENoticeTermAndRulesTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _RENoticeTermForObjTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _REObjAssgmtTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _REOrglAssgmtTermTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _REPartnerAssgmtTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _REPostingTermTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _REReminderRuleTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _RERenewalTermAndRulesTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _RERhythmTermTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _RESalesReportingTermTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _RESalesRuleFrqcyTermTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _RESalesRuleTermTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _REValuationConditionTP,
    InsertRestrictions: { Insertable: true }
  },
  {
    NavigationProperty: _REValuationTP,
    InsertRestrictions: { Insertable: true }
  }
]
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [
  '_REAdjustmentTermTP',
  '_REConditionTP',
  '_RENoticeTermAndRulesTP',
  '_RENoticeTermForObjTP',
  '_REObjAssgmtTP',
  '_REOrglAssgmtTermTP',
  '_REPartnerAssgmtTP',
  '_REPostingTermTP',
  '_REReminderDateTP',
  '_REReminderRuleTP',
  '_RERenewalTermAndRulesTP',
  '_RERhythmTermTP',
  '_RESalesReportingTermTP',
  '_RESalesRuleFrqcyTermTP',
  '_RESalesRuleTermTP',
  '_REValuationConditionTP',
  '_REValuationTP'
]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
@Capabilities.DeleteRestrictions.Deletable : false
entity API_RECONTRACT_0001.A_REContract {
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Company Code'
  @Common.Heading : 'CoCd'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BUKRS'
  CompanyCode : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Real Estate Contract'
  RealEstateContract : String(13) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  REStatusObject : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Real Estate Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object (FI)'
  REInternalFinNumber : String(8) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'How Created'
  @Common.Heading : 'Crtd'
  @Common.QuickInfo : 'How the Object Was Created'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECACREATIONTYPE'
  RECreationType : String(1) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Entered By'
  @Common.Heading : 'Entered'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERF'
  CreatedByUser : String(12) not null;
  @Common.Label : 'First Entered On'
  @Common.Heading : 'Entered On'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DERF'
  CreationDate : Date;
  @Common.Label : 'Time of Creation'
  @Common.Heading : 'Time'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TERF'
  CreationTime : Time not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Initial Entry Source'
  @Common.Heading : 'Src.In.Ent.'
  @Common.QuickInfo : 'Source of Initial Entry'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REHER'
  RESourceOfCreation : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Last Changed By'
  @Common.Heading : 'Last Change'
  @Common.QuickInfo : 'Employee ID'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RBEAR'
  LastChangedByUser : String(12) not null;
  @Common.Label : 'Last Edited On'
  @Common.Heading : 'LastEdit'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DBEAR'
  LastChangeDate : Date;
  @Common.Label : 'Last Edited At'
  @Common.Heading : 'LastEdit'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TBEAR'
  LastChangeTime : Time not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Editing Source'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RBHER'
  RESourceOfChange : String(10) not null;
  @Common.FieldControl : #Mandatory
  @Common.IsUpperCase : true
  @Common.Label : 'Person Responsible'
  @Common.Heading : 'Person Resp.'
  Responsible : String(12) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Change Authorization'
  @Common.Heading : 'Change Auth.'
  @Common.QuickInfo : 'User with Exclusive Change Authorization'
  REUserExclusive : String(12) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Authorization Group'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECAAUTHGRP'
  REAuthorizationGroup : String(40) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Contract Type'
  @Common.Heading : 'CTyp'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECNCONTRACTTYPE'
  REContractType : String(4) not null;
  @Common.Label : 'Contract Start Date'
  ContractStartDate : Date;
  @Core.Computed : true
  @Common.Label : 'Contract End Date'
  ContractEndDate : Date;
  @Common.Label : 'Contract Name'
  REContractName : String(80) not null;
  @Common.Label : 'Active From'
  REContractActivateDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Tenancy Law'
  RETenancyLaw : String(5) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Old Contract'
  @Common.QuickInfo : 'Number of Old Contract'
  REContractNumberOld : String(20) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Main Contract Company Code'
  @Common.QuickInfo : 'Company code of main contract'
  REMainContractCompanyCode : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Main Contract'
  @Common.Heading : 'Main Contr.'
  @Common.QuickInfo : 'Number of Real Estate Main Contract'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECNNUMBERCOLLECT'
  REMainContract : String(13) not null;
  @Common.IsCurrency : true
  @Common.IsUpperCase : true
  @Common.Label : 'Contract Currency'
  @Common.Heading : 'CCrcy'
  @Common.QuickInfo : 'Currency for Contract'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECNWAERS_CN'
  REContractCurrency : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Industry'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BU_IND_SECTOR'
  REIndustrySector : String(10) not null;
  @Common.Label : 'Relevant to Sales'
  @Common.Heading : 'SlsR'
  @Common.QuickInfo : 'Indicator: Relevant to Sales'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECNSALESRENTRELEVANT'
  REIsSalesRelevant : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Security Deposit Type'
  @Common.QuickInfo : 'Contract Security Deposit Type'
  REContractDepositType : String(4) not null;
  @Common.Label : 'Contract Conclusion'
  @Common.Heading : 'Contr.con.'
  @Common.QuickInfo : 'Date of Contract Conclusion'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECNDAT'
  REContractSignDate : Date;
  @Common.Label : 'Second Signature'
  @Common.QuickInfo : 'Date of Second Signature'
  REContract2SignDate : Date;
  @Common.Label : 'Cash Flow From'
  @Common.Heading : 'CashFlwFrm'
  @Common.QuickInfo : 'Cash Flow Generated Starting On'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCFSTARTFROM'
  REContractCashFlowDate : Date;
  @Common.Label : 'First Contract End'
  @Common.QuickInfo : 'Date of First Contract End'
  REContractFirstEndDate : Date;
  @Common.Label : 'Notice Per'
  @Common.QuickInfo : 'Contract Notice Per'
  REContractNoticeDate : Date;
  @Common.Label : 'Entry Date'
  @Common.Heading : 'Date Rec''d'
  @Common.QuickInfo : 'Date of receipt of notice'
  REContractNoticeInDate : Date;
  @Common.IsDigitSequence : true
  @Common.Label : 'Reason for Notice'
  @Common.Heading : 'RNo'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECNNTREASON'
  REContractNoticeReason : String(2) not null;
  @Common.Label : 'Notice Activated On'
  @Common.Heading : 'NoticeAct.'
  @Common.QuickInfo : 'Notice: Date of Activation'
  REContractNoticeActivationDate : Date;
  @Common.Label : 'CF Archived To'
  @Common.Heading : 'CF Arch.To'
  @Common.QuickInfo : 'Date Up to Which the Cash Flow Is Archived'
  RECashFlowArchivedToDate : Date;
  @Common.Label : 'CF Fixed Until'
  @Common.Heading : 'FixedUntil'
  @Common.QuickInfo : 'Date Until Which the Cash Flow Is Locked'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCFLOCKEDTO'
  RECashFlowLockedToDate : Date;
  @Common.Label : 'First Posting From'
  @Common.Heading : '1st Postg'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCFPOSTINGFROM'
  RECashFlowPostingFromDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'RE Business Entity'
  REBusinessEntity : String(8) not null;
  @Common.Label : 'Possession Date From'
  @Common.Heading : 'Poss. From'
  @Common.QuickInfo : 'Date From Which the Object Is Made Available for Use'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDPOSSDATEFROM'
  REPossessionStartDate : Date;
  @Common.Label : 'Possession Date To'
  @Common.Heading : 'Poss. To'
  @Common.QuickInfo : 'Date Up to Which the Object Is Used'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDPOSSDATETO'
  REPossessionEndDate : Date;
  @Common.Label : 'Multiple Assignment'
  @Common.Heading : 'Mult'
  @Common.QuickInfo : 'Multiple Assignment of Object to Group Allowed'
  REHasMultipleAssignments : Boolean not null;
  @Common.Label : 'Transfer of Possess. Starts At'
  @Common.Heading : 'Transfer of Possession Starts At'
  @Common.QuickInfo : 'Transfer of Possession Start Date'
  REObjectAvailableFromDate : Date;
  @Common.Label : 'Transfer of Possess. Ends On'
  @Common.Heading : 'Transfer of Possession Ends On'
  @Common.QuickInfo : 'Transfer of Possession End Date'
  REObjectAvailableToDate : Date;
  @Common.Label : 'Valuation Relevance'
  @Common.Heading : 'Val. Rel.'
  ValuationRelevance : String(10) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  @Common.Composition : true
  _REAdjustmentTermTP : Composition of many API_RECONTRACT_0001.A_REContrAdjustmentTerm {  };
  @Common.Composition : true
  _REConditionTP : Composition of many API_RECONTRACT_0001.A_REContrCondition {  };
  @Common.Composition : true
  _RENoticeTermAndRulesTP : Composition of many API_RECONTRACT_0001.A_REContrNoticeTerm {  };
  @Common.Composition : true
  _RENoticeTermForObjTP : Composition of many API_RECONTRACT_0001.A_REContrNoticeTermForObj {  };
  @Common.Composition : true
  _REObjAssgmtTP : Composition of many API_RECONTRACT_0001.A_REContrObjAssgmt {  };
  @Common.Composition : true
  _REOrglAssgmtTermTP : Composition of many API_RECONTRACT_0001.A_REContrOrglAssgmtTerm {  };
  @Common.Composition : true
  _REPartnerAssgmtTP : Composition of many API_RECONTRACT_0001.A_REContrPartAssgmt {  };
  @Common.Composition : true
  _REPostingTermTP : Composition of many API_RECONTRACT_0001.A_REContrPostingTerm {  };
  @Common.Composition : true
  _REReminderDateTP : Composition of many API_RECONTRACT_0001.A_REContrReminderDate {  };
  @Common.Composition : true
  _REReminderRuleTP : Composition of many API_RECONTRACT_0001.A_REContrReminderRule {  };
  @Common.Composition : true
  _RERenewalTermAndRulesTP : Composition of many API_RECONTRACT_0001.A_REContrRenewalTerm {  };
  @Common.Composition : true
  _RERhythmTermTP : Composition of many API_RECONTRACT_0001.A_REContrRhythmTerm {  };
  @Common.Composition : true
  _RESalesReportingTermTP : Composition of many API_RECONTRACT_0001.A_REContrSalesReportingTerm {  };
  @Common.Composition : true
  _RESalesRuleFrqcyTermTP : Composition of many API_RECONTRACT_0001.A_REContrSalesRuleFrqcyTerm {  };
  @Common.Composition : true
  _RESalesRuleTermTP : Composition of many API_RECONTRACT_0001.A_REContrSalesRuleTerm {  };
  @Common.Composition : true
  _REValuationConditionTP : Composition of many API_RECONTRACT_0001.A_REContrValuationCondition {  };
  @Common.Composition : true
  _REValuationTP : Composition of many API_RECONTRACT_0001.A_REContrValuation {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Adjustment Terms'
@Common.SemanticKey : [
  'ValidityStartDate',
  'REAdjustmentElementaryRule',
  'REAdjustmentRule',
  'RETermNumber',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermNumber',
  'REAdjustmentRule',
  'REAdjustmentElementaryRule',
  'ValidityStartEndDateValue'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrAdjustmentTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Adjustment Rule'
  @Common.Heading : 'AdRl'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJADJMRULE'
  key REAdjustmentRule : String(10) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'ElementaryAjust.Rule'
  @Common.Heading : 'EAdR'
  @Common.QuickInfo : 'Elementary Adjustment Rule (Part of Comb. Rule)'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJADJMSUBRULE'
  key REAdjustmentElementaryRule : String(10) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Common.FieldControl : #Mandatory
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Adjustment Method'
  @Common.Heading : 'AMth'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJADJMMETH'
  REAdjustmentMethod : String(4) not null;
  @Common.Label : 'Global Param. Ind.'
  @Common.Heading : 'GlID'
  @Common.QuickInfo : 'Indicator: Specify global param. individ. for contract/obj.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDIVIDUALGLOBAL'
  REAdjustmentIsIndivGlobParam : Boolean not null;
  @Common.Label : 'Spec. Param. Ind.'
  @Common.Heading : 'IdSp'
  @Common.QuickInfo : 'Indicator: Specify Spec. Param. Individ. for Contract/Obj.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDIVIDUALSPECIFIC'
  REAdjustmentIsIndivSpcfcParam : Boolean not null;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Type'
  @Common.Heading : 'Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECAOBJTYPE'
  RealEstateObjectType : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  REStatusObject : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Part - Object ID'
  @Common.Heading : 'Object ID'
  @Common.QuickInfo : 'ID Part Key, for example "1000/123"'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECAIDENTKEY'
  REIdentificationKey : String(45) not null;
  @Common.Label : 'Use Defaults'
  @Common.Heading : 'Use Def.'
  @Common.QuickInfo : 'Bool: Use Customizing Defaults When Values Initial'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJUSEDEFAULTS'
  RERuleIsUsingDefaults : Boolean not null;
  @Common.Label : 'Approval Required'
  @Common.Heading : 'App.'
  @Common.QuickInfo : 'Indicator: Approval for Adjustment Required?'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJAPPROVAL'
  REIsRuleApprovalRequired : Boolean not null;
  @Common.Label : 'Activation w/o App.'
  @Common.Heading : 'AwoA'
  @Common.QuickInfo : 'Indicator: Activation Without Approval Possible'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJACTIFNOAPPR'
  REIsActvtnWithoutApprvl : Boolean not null;
  @Common.Label : 'Date Changeable'
  @Common.Heading : 'ChDt'
  @Common.QuickInfo : 'Indicator: Is valid-from date manually changeable?'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJDTCHANGEABLE'
  REIsDueDateChangeable : Boolean not null;
  @Common.Label : 'Pass-On (%)'
  @Common.Heading : '%Ps-On'
  @Common.QuickInfo : 'Percentage with Which the Adjustment Amount Is Passed-On'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJPERCENTAGEPASS'
  REAdjustmentPercentPassedValue : Decimal(5, 2) not null;
  @Common.Label : 'Consider Inc.% of RO'
  @Common.Heading : 'I%RO'
  @Common.QuickInfo : 'Consider Percentage Rate of Increase of Rental Object'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJUSERORATEINC'
  REHasRentalObjectIncrease : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Adjustment Direction'
  @Common.Heading : 'Dir.'
  @Common.QuickInfo : 'In which direction (+/-/=) can the amount change?'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJADJMDIRECTION'
  REAdjustmentDirection : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Change Direction'
  @Common.Heading : 'CDir'
  @Common.QuickInfo : 'How (+/-/=) Can the Amount Be Changed After Adjustment'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJCHANGEDIRECTION'
  REAdjustmentChangeDirection : String(1) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Adjustment Frequency'
  REAdjustmentFrequency : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Frequency Unit'
  @Common.Heading : 'FrUn'
  REFrequencyUnit : String(1) not null;
  @Common.Label : 'Min. Int. Freq. Strt'
  @Common.Heading : 'MInt'
  @Common.QuickInfo : 'Indicator: Calculate Minimum Interval from Frequency Start?'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJRHYTHMBEGIN'
  REIsIntervalFromFrqcyStart : Boolean not null;
  @Common.Label : 'Simulation Only'
  @Common.Heading : 'Sim.'
  @Common.QuickInfo : 'Indicator: Adjustment Rule Is Allowed for Simulation Only'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJSIMULATIONRULE'
  REIsSimulationRule : Boolean not null;
  @Common.Label : 'No Adj. Correspond.'
  @Common.Heading : 'NoDc'
  @Common.QuickInfo : 'Indicator: No Adjustment Document'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJNODOCUMENT'
  RERuleHasNoDocument : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Infl. on Subs.Cond.'
  @Common.Heading : 'SbCn'
  @Common.QuickInfo : 'Influence on Subsequent Conditions'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJADJMCOTYPE'
  REAdjustmentSubsqntCondition : String(1) not null;
  @Common.Label : 'On Notice Date'
  @Common.Heading : 'NDt'
  @Common.QuickInfo : 'Adjustment on Next Possible Notice Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJNEXTADJMNOTICE'
  REAdjustmentIsOnNextNotice : Boolean not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Adjustment Basis'
  @Common.Heading : 'AdjB'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJADJMBASE'
  REAdjustmentBase : String(1) not null;
  @Common.Label : 'Aut.DefaultOnly'
  @Common.Heading : 'ADef'
  @Common.QuickInfo : 'Automatic Default Only'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJAUTODEFAULT'
  REAdjustmentIsAutoDefault : Boolean not null;
  @Common.Label : 'Notific. Required'
  @Common.Heading : 'Notf'
  @Common.QuickInfo : 'Notification Required for Adjustment?'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJANNOUNCE'
  REAdjustmentIsNotifRequired : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Time-Dependency'
  @Common.QuickInfo : 'Consideration of Time-Dependency'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJTIMEDEPTYPE'
  REAdjustmentIsTimeDependent : String(1) not null;
  @Common.Label : 'Due Date Reqrd'
  @Common.Heading : 'DDRq'
  @Common.QuickInfo : 'Due Date Required for Follow-Up Postings'
  REAdjustmentDueDateIsMandatory : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'No Retro. Adj.'
  @Common.Heading : 'NoRA'
  @Common.QuickInfo : 'No Retroactive Adjustment'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJNORETROACTIVEADJM'
  REAdjustmentIsNotRetroActive : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Reason for Lock'
  @Common.Heading : 'LkRS'
  @Common.QuickInfo : 'Reason for Adjustment Lock'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJBLOCKREASON'
  REAdjustmentBlockReason : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Dep.Cond.Type'
  @Common.Heading : 'CTDC'
  @Common.QuickInfo : 'Condition Type of Dependent Condition'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJDEPCONDTYPE'
  REConditionType : String(4) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Sort Sequence'
  @Common.Heading : 'Seqn'
  @Common.QuickInfo : 'Sort Sequence of Rules for Adjustment Process'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJRULEORDER'
  RERuleSortOrder : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Crcy Transl. Rule'
  @Common.QuickInfo : 'Currency Translation Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECACTRULE'
  RECurrencyTranslationRule : String(20) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Index Series'
  @Common.Heading : 'Index'
  @Common.QuickInfo : 'Index Series on Which the Adjustment Is Based'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXSERIES'
  REAdjustmentIndexSeries : String(5) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Base Year'
  @Common.Heading : 'BsYr'
  @Common.QuickInfo : 'Base Year for an Index Series'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXBASEYEAR'
  REAdjustmentIndexBaseYear : String(4) not null;
  @Common.Label : 'Current Base Year'
  @Common.Heading : 'CurB'
  @Common.QuickInfo : 'Always Use Current Base Year'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXBASEACT'
  REAdjustmentIdxIsAlwaysBaseYr : Boolean not null;
  @Common.Label : 'Min. Change Points'
  @Common.Heading : 'MinChPts'
  @Common.QuickInfo : 'Minimum Change of Index Series Since Last Adjust. in Points'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXCHGPOINTS'
  REAdjustmentIdxMinChgPointsVal : Decimal(8, 3) not null;
  @Common.Label : 'Min. Change Percent'
  @Common.Heading : 'MinPerc'
  @Common.QuickInfo : 'Minimum Change of Index Series Since Last Adjust. in Percent'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXCHGPERCENT'
  REAdjustmentIdxMinChgPercent : Decimal(7, 4) not null;
  @Common.Label : 'Diff. Exceeded'
  @Common.Heading : '>'
  @Common.QuickInfo : 'Adjust When Difference in Points Is Exceeded'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXCHGPOIEXCEED'
  REAdjustmentIsIdxChgPointsExcd : Boolean not null;
  @Common.Label : 'Diff. Exceeded'
  @Common.Heading : '>'
  @Common.QuickInfo : 'Adjust When Percentage Difference Exceeded'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXCHGPEREXCEED'
  REAdjustmentIsIdxChgPctExcd : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Flexible Frequency'
  @Common.Heading : 'FlxF'
  @Common.QuickInfo : 'Flexibility of Adjustment Frequency (Set, Earliest, ...)'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJRHYTHMFLEXIBLE'
  REAdjustmentRhythmFlexible : String(1) not null;
  @Common.Label : 'Adjustment Delay'
  @Common.Heading : 'Dely'
  @Common.QuickInfo : 'Adjustment Delay in Months'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJDELAYBASE'
  REAdjustmentDelayInMonths : Decimal(precision: 3) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Possible Adj. Dates'
  @Common.Heading : 'Date'
  @Common.QuickInfo : 'Possible Adjustment Dates'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJDELAYBASEUNIT'
  REAdjustmentDelayUnit : String(1) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Adjustment Basis'
  @Common.Heading : 'AdBa'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJADJMINDEXBASIS'
  REAdjustmentIndexBasis : String(1) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Index/spread clause'
  @Common.Heading : 'IdSp'
  @Common.QuickInfo : 'Index-Linked Contract: Index or Spread Clause'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXSERTYPE1'
  REAdjustmentIndexOrSpread : String(1) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Perf.Prov./Index Cl.'
  @Common.Heading : 'PPIn'
  @Common.QuickInfo : 'Index-Linked Contract: Performance Provision or Index Clause'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REAJINDEXSERTYPE2'
  REAdjustmentIndexOrPerformance : String(1) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Conditions'
@Common.SemanticKey : [
  'REExtConditionPurpose',
  'ValidityStartDate',
  'REConditionType',
  'REStatusObjectCalculation',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.FilterRestrictions.NonFilterableProperties : [ 'REStatusObjectIDCalculation', 'REStatusObjectIDDistribution' ]
@Capabilities.SortRestrictions.NonSortableProperties : [ 'REStatusObjectIDCalculation', 'REStatusObjectIDDistribution' ]
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'REConditionUUID',
  'InternalRealEstateNumber',
  'REContractSubjectNumber',
  'REStatusObjectTypeCalculation'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrCondition {
  @Core.Immutable : true
  @Common.Label : 'Condition'
  @Common.Heading : 'Cond.'
  @Common.QuickInfo : 'GUID (RAW16) for Conditions'
  key REConditionUUID : UUID not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Calculation Object Number'
  @Common.QuickInfo : 'Object Number for Calculation'
  REStatusObjectCalculation : String(22) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Obj. Identification'
  @Common.Heading : 'Object'
  @Common.QuickInfo : 'Complete Object Identification, for Example BE 1000/123'
  REStatusObjectIDCalculation : String(50) not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  @Common.Label : 'Contract Object Number'
  REContractSubjectNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Calculat. BusObjType'
  @Common.Heading : 'BusObjType'
  @Common.QuickInfo : 'Business Object Type of Calculation Object'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDBUSOBJTYPECALC'
  REStatusObjectTypeCalculation : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Condition Type'
  @Common.Heading : 'CTyp'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCONDTYPE'
  REConditionType : String(4) not null;
  @Common.FieldControl : #Mandatory
  @Common.IsUpperCase : true
  @Common.Label : 'External Condition Purpose'
  @Common.QuickInfo : 'Conditions - External Purpos'
  REExtConditionPurpose : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  ValidityStartEndDateValue : String(16) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Distribution Object Number'
  @Common.QuickInfo : 'Object Number for Distribution'
  REStatusObjectDistribution : String(22) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Obj. Identification'
  @Common.Heading : 'Object'
  @Common.QuickInfo : 'Complete Object Identification, for Example BE 1000/123'
  REStatusObjectIDDistribution : String(50) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Distribution Object Type'
  @Common.QuickInfo : 'Object Type for Distribution'
  REObjectTypeDistribution : String(1) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Posting Object Type'
  @Common.QuickInfo : 'Object Type for Posting'
  REObjectTypePosting : String(1) not null;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Entered By'
  @Common.Heading : 'Entered'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERF'
  CreatedByUser : String(12) not null;
  @odata.Precision : 7
  @odata.Type : 'Edm.DateTimeOffset'
  @Common.Label : 'Created On'
  @Common.QuickInfo : 'Creation Date'
  CreationDateTime : Timestamp;
  @Common.IsUpperCase : true
  @Common.Label : 'Initial Entry Source'
  @Common.Heading : 'Src.In.Ent.'
  @Common.QuickInfo : 'Source of Initial Entry'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REHER'
  RESourceOfCreation : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Last Changed By'
  @Common.Heading : 'Last Change'
  @Common.QuickInfo : 'Employee ID'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RBEAR'
  LastChangedByUser : String(12) not null;
  @odata.Precision : 7
  @odata.Type : 'Edm.DateTimeOffset'
  @Common.Label : 'Last Changed On'
  LastChangeDateTime : Timestamp;
  @Common.IsUpperCase : true
  @Common.Label : 'Editing Source'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RBHER'
  RESourceOfChange : String(10) not null;
  @Common.Label : 'One-Time Condition'
  @Common.Heading : 'Once'
  @Common.QuickInfo : 'Condition Is One-Time Condition'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDUNIQUECOND'
  REIsOneTimeCondition : Boolean not null;
  @Common.Label : 'Statistical Condition'
  @Common.QuickInfo : 'Statistical or Informational Condition'
  REConditionIsStatistical : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Posting Term'
  @Common.Heading : 'PT'
  @Common.QuickInfo : 'Number of Posting Term'
  REPostingTerm : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Rhythm Term'
  @Common.QuickInfo : 'Number of Rhythm Term'
  RERhythmTerm : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Adjustment Term'
  @Common.Heading : 'PAr'
  @Common.QuickInfo : 'Number of Adjustment Term'
  REAdjustmentNumber : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Organizational Term'
  @Common.QuickInfo : 'Number of Organizational Assignment Term'
  REOrglAssignmentTerm : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Sales Term'
  @Common.Heading : 'ST'
  @Common.QuickInfo : 'Number of Sales Term'
  RESalesTerm : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Peak Sales Term'
  @Common.Heading : 'PST'
  @Common.QuickInfo : 'Number of Peak Sales Term'
  REPeakSalesTerm : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'SCS Posting Term'
  @Common.Heading : 'SCST'
  @Common.QuickInfo : 'Service Charge Settlement Posting Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDTERMNOPYSCS'
  RESrvcChrgSettlementPostingTrm : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Withholding Tax Term'
  @Common.Heading : 'WT'
  @Common.QuickInfo : 'Number of Withholding Tax Term'
  REWithholdingTaxTerm : String(4) not null;
  @Common.FieldControl : #Mandatory
  @Common.IsUpperCase : true
  @Common.Label : 'Calculation Formula'
  @Common.Heading : 'CaFm'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCALCRULE'
  RECalculationRule : String(4) not null;
  @Common.Label : 'Unit Price'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDUNITPRICE'
  REUnitPrice : Decimal(19, 6) not null;
  @Common.IsCurrency : true
  @Common.IsUpperCase : true
  @Common.Label : 'Condition Currency'
  REConditionCurrency : String(3) not null;
  @Common.Label : 'Calc. Formula Param.'
  @Common.Heading : 'Calculation Formula Parameter'
  @Common.QuickInfo : 'Untypified Parameter for a Calculation Formula'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCALCRULEPARA'
  RECalculationRuleParam1 : String(70) not null;
  @Common.Label : 'Calc. Formula Param.'
  @Common.Heading : 'Calculation Formula Parameter'
  @Common.QuickInfo : 'Untypified Parameter for a Calculation Formula'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCALCRULEPARA'
  RECalculationRuleParam2 : String(70) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Distribution Formula'
  REDistributionRule : String(4) not null;
  @Common.Label : 'Dist.Form.Param.'
  @Common.Heading : 'Distrib. Formula Parameter'
  @Common.QuickInfo : 'Untypified Parameter for a Distribution Formula'
  REDistributionRuleParam1 : String(70) not null;
  @Common.Label : 'Dist.Form.Param.'
  @Common.Heading : 'Distrib. Formula Parameter'
  @Common.QuickInfo : 'Untypified Parameter for a Distribution Formula'
  REDistributionRuleParam2 : String(70) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Reason for Change'
  @Common.Heading : 'ChRs'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCHGREASON'
  REReasonForChange : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Calculation Parameter Object'
  @Common.QuickInfo : 'Object Number in Calculation/Distribution Parameter'
  REStsObjectParamCalculation : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Distribution Parameter Object'
  @Common.QuickInfo : 'Object Number in Calculation/Distribution Parameter'
  REStsObjectParamDistribution : String(22) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Notice Terms'
@Common.SemanticKey : [ 'RENoticeType', 'RETermType', 'InternalRealEstateNumber' ]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermType',
  'RETermNumber',
  'RENoticeRule',
  'RENoticeSequenceNo'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrNoticeTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  key RENoticeRule : String(12) not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  key RENoticeSequenceNo : String(4) not null;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Notice Type'
  @Common.Heading : 'Type'
  @Common.QuickInfo : 'Notice Type of RE Contract'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTTYPE'
  RENoticeType : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Notice Procedure'
  @Common.Heading : 'NoticePr.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPROC'
  RENoticeProcedure : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Party Giving Notice'
  @Common.Heading : 'Party'
  @Common.QuickInfo : 'Party Giving Notice in Notice Procedure'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPROCPRTY'
  RENoticeGivingParty : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Rule Type'
  @Common.Heading : 'Type'
  @Common.QuickInfo : 'Type of Notice Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRULETYPE'
  RENoticeRuleType : String(1) not null;
  @Common.Label : 'Notice Rule Name'
  @Common.QuickInfo : 'Name of Notice Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXNTRULE'
  RENoticeRuleDescription : String(60) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Term in Years'
  @Common.Heading : 'TmYr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTLIMITYEARS'
  RETermPeriodInYears : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Term in Months'
  @Common.Heading : 'TmMo'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTLIMITMONTHS'
  RETermPeriodInMonths : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Term in Days'
  @Common.Heading : 'TmDy'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTLIMITDAYS'
  RETermPeriodInDays : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Notice Per'
  @Common.QuickInfo : 'Type of Period End for Period Regulation'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRHYTHMTYPE'
  REPeriodEndRhythmType : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Period-Months'
  @Common.Heading : 'NtMo'
  @Common.QuickInfo : 'Notice Period in Months'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPERMONTHS'
  RENoticePeriodInMonths : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Period -Weeks'
  @Common.Heading : 'NtWk'
  @Common.QuickInfo : 'Notice Period in Weeks'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPERWEEKS'
  RENoticePeriodInWeeks : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Prd in Days'
  @Common.Heading : 'NDay'
  @Common.QuickInfo : 'Notice Period in Days'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPERDAYS'
  RENoticePeriodInDays : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Grace Period'
  @Common.Heading : 'GrP'
  @Common.QuickInfo : 'Grace Days for Notice Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPERGRACEDAYS'
  RENoticeGracePeriod : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Receipt in Calendar/Business Days'
  @Common.QuickInfo : 'Grace Days as Calendar or Business Days?'
  REGracePeriodCalOrWorkDays : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Calendar for Grace Period Calculcation'
  @Common.QuickInfo : 'Calendar for Calculation of Calendar or Business Days'
  RENoticePeriodCalendar : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Year'
  @Common.Heading : 'NtYr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTNOTYEAR'
  RENoticeYear : String(4) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Month'
  @Common.Heading : 'NtMo'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTNOTMONTH'
  RENoticeMonth : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Day'
  @Common.Heading : 'NDay'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTNOTDAY'
  RENoticeDay : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Received in Year'
  @Common.Heading : 'RYr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRECYEAR'
  RENoticeReceiptYear : String(4) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Received in Month'
  @Common.Heading : 'RMo.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRECMONTH'
  RENoticeReceiptMonth : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Received on Day'
  @Common.QuickInfo : 'Received On Day'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMVDMNTRECDAY'
  RENoticeReceiptDay : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Grace Period in Calendar/Business Days'
  @Common.QuickInfo : 'Grace Days as Calendar or Business Days?'
  RENoticeRcptCalOrWorkDays : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Calendar for Receipt Calculation'
  @Common.QuickInfo : 'Calendar for Calculation of Calendar or Business Days'
  RENoticeReceiptCalendar : String(2) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Object Notice Terms'
@Common.SemanticKey : [ 'RENoticeType', 'RETermType', 'InternalRealEstateNumber' ]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermType',
  'REStatusObject',
  'RETermNumber',
  'RENoticeRule',
  'RENoticeSequenceNo'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrNoticeTermForObj {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  key REStatusObject : String(22) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Notice Rule'
  @Common.Heading : 'Notic.Rule'
  key RENoticeRule : String(12) not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  @Common.Label : 'Sequence no.'
  @Common.Heading : 'Seq'
  @Common.QuickInfo : 'Sequence Number for Description of Notice Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRULENO'
  key RENoticeSequenceNo : String(4) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Notice Type'
  @Common.Heading : 'Type'
  @Common.QuickInfo : 'Notice Type of RE Contract'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTTYPE'
  RENoticeType : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Notice Procedure'
  @Common.Heading : 'NoticePr.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPROC'
  RENoticeProcedure : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Party Giving Notice'
  @Common.Heading : 'Party'
  @Common.QuickInfo : 'Party Giving Notice in Notice Procedure'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPROCPRTY'
  RENoticeGivingParty : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Rule Type'
  @Common.Heading : 'Type'
  @Common.QuickInfo : 'Type of Notice Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRULETYPE'
  RENoticeRuleType : String(1) not null;
  @Common.Label : 'Notice Rule Name'
  @Common.QuickInfo : 'Name of Notice Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXNTRULE'
  RENoticeRuleDescription : String(60) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Term in Years'
  @Common.Heading : 'TmYr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTLIMITYEARS'
  RETermPeriodInYears : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Term in Months'
  @Common.Heading : 'TmMo'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTLIMITMONTHS'
  RETermPeriodInMonths : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Term in Days'
  @Common.Heading : 'TmDy'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTLIMITDAYS'
  RETermPeriodInDays : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Notice Per'
  @Common.QuickInfo : 'Type of Period End for Period Regulation'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRHYTHMTYPE'
  REPeriodEndRhythmType : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Period-Months'
  @Common.Heading : 'NtMo'
  @Common.QuickInfo : 'Notice Period in Months'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPERMONTHS'
  RENoticePeriodInMonths : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Period -Weeks'
  @Common.Heading : 'NtWk'
  @Common.QuickInfo : 'Notice Period in Weeks'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPERWEEKS'
  RENoticePeriodInWeeks : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Prd in Days'
  @Common.Heading : 'NDay'
  @Common.QuickInfo : 'Notice Period in Days'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPERDAYS'
  RENoticePeriodInDays : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Grace Period'
  @Common.Heading : 'GrP'
  @Common.QuickInfo : 'Grace Days for Notice Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTPERGRACEDAYS'
  RENoticeGracePeriod : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Receipt in Calendar/Business Days'
  @Common.QuickInfo : 'Grace Days as Calendar or Business Days?'
  REGracePeriodCalOrWorkDays : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Calendar for Grace Period Calculcation'
  @Common.QuickInfo : 'Calendar for Calculation of Calendar or Business Days'
  RENoticePeriodCalendar : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Year'
  @Common.Heading : 'NtYr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTNOTYEAR'
  RENoticeYear : String(4) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Month'
  @Common.Heading : 'NtMo'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTNOTMONTH'
  RENoticeMonth : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notice Day'
  @Common.Heading : 'NDay'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTNOTDAY'
  RENoticeDay : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Received in Year'
  @Common.Heading : 'RYr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRECYEAR'
  RENoticeReceiptYear : String(4) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Received in Month'
  @Common.Heading : 'RMo.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMNTRECMONTH'
  RENoticeReceiptMonth : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Received on Day'
  @Common.QuickInfo : 'Received On Day'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMVDMNTRECDAY'
  RENoticeReceiptDay : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Grace Period in Calendar/Business Days'
  @Common.QuickInfo : 'Grace Days as Calendar or Business Days?'
  RENoticeRcptCalOrWorkDays : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Calendar for Receipt Calculation'
  @Common.QuickInfo : 'Calendar for Calculation of Calendar or Business Days'
  RENoticeReceiptCalendar : String(2) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Object Assignments'
@Common.SemanticKey : [
  'ValidityStartDate',
  'REStatusObjectTarget',
  'REObjectAssignmentType',
  'REStatusObjectSource'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'REStatusObjectSource',
  'REObjectAssignmentType',
  'REStatusObjectTarget',
  'ValidityStartEndDateValue',
  'InternalRealEstateNumber'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrObjAssgmt {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  key REStatusObjectSource : String(22) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Assignment Type'
  @Common.Heading : 'AsgnType'
  @Common.QuickInfo : 'Type of Object Assignment'
  key REObjectAssignmentType : String(2) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  key REStatusObjectTarget : String(22) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Type'
  REObjectTypeTarget : String(2) not null;
  @Common.Label : 'Informational'
  @Common.Heading : 'Info'
  @Common.QuickInfo : 'Informational Assignment'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDASSIGNONLYINFO'
  REOnlyInfoAssgmt : Boolean not null;
  @Core.Computed : true
  @Common.Label : 'Source Obj. Archived'
  @Common.Heading : 'Archived'
  @Common.QuickInfo : 'Source Object Was Archived'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDOBJNRSRCARCH'
  REStatusObjectSourceIsArchived : Boolean not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Generation Type'
  @Common.Heading : 'GenTyp'
  @Common.QuickInfo : 'Generation Type Functional Location'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDFLGENTYPE'
  REGenerationType : String(1) not null;
  @Core.Computed : true
  @Common.Label : 'Leading Asset'
  @Common.Heading : 'Lead.Asset'
  @Common.QuickInfo : 'Asset Is Leading Asset'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDISMAINASSET'
  REIsMainAsset : Boolean not null;
  @Core.Computed : true
  @Common.Label : 'Mult.Assignmt Entry'
  @Common.Heading : 'GeMu'
  @Common.QuickInfo : 'Generated Entry for Multiple Assignment'
  REAssignmentHasMultiple : Boolean not null;
  @Common.Label : 'Possession Date From'
  @Common.Heading : 'Poss. From'
  @Common.QuickInfo : 'Date From Which the Object Is Made Available for Use'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDPOSSDATEFROM'
  REObjectPossessionStartDate : Date;
  @Common.Label : 'Possession Date To'
  @Common.Heading : 'Poss. To'
  @Common.QuickInfo : 'Date Up to Which the Object Is Used'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDPOSSDATETO'
  REObjectPossessionEndDate : Date;
  @Common.IsDigitSequence : true
  @Common.Label : 'Group Number'
  @Common.Heading : 'GrNo'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDADJUSTNUMBER'
  REGroupNumber : String(4) not null;
  @Common.Label : 'Object Group'
  @Common.QuickInfo : 'Name of Object Groups'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDXOBJGRP'
  REObjectGroupName : String(60) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Contract Object Number'
  REContractSubjectNumber : String(4) not null;
  @Common.Label : 'Contract Object'
  @Common.QuickInfo : 'Name of Contract Object'
  REContractSubjectDescription : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Contract Obj. Class'
  @Common.Heading : 'CO Class'
  @Common.QuickInfo : 'Contract Object Class'
  REContractSubjectClass : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Type'
  @Common.Heading : 'Obj. Type'
  @Common.QuickInfo : 'Type of Contract Object'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDCNSUBJECTTYPE'
  REContractSubjectType : String(6) not null;
  @Common.Label : 'External ID'
  @Common.QuickInfo : 'External Identification for Contract Object'
  ExternalId : String(100) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number Account Assignment'
  REAccountingObject : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Type'
  @Common.Heading : 'Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECAOBJTYPE'
  REAccountingObjectType : String(2) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Organizational Assignments'
@Common.SemanticKey : [
  'ValidityStartDate',
  'RETermNumber',
  'RETermType',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermType',
  'RETermNumber',
  'ValidityStartEndDateValue'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrOrglAssgmtTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Business Area'
  @Common.Heading : 'BusA'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=GSBER'
  BusinessArea : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Profit Center'
  @Common.Heading : 'Profit Ctr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=PRCTR'
  ProfitCenter : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Additional Account Assignment'
  @Common.QuickInfo : 'Object Number for Additional Account Assignment'
  REStatusObject : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Tax Jurisdiction'
  @Common.Heading : 'Tax Jur.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TXJCD'
  TaxJurisdiction : String(15) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Fund'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BP_GEBER'
  Fund : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Funds Center'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FM_FICTR'
  FundsCenter : String(16) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Commitment Item'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FM_FIPEX'
  CommitmentItem : String(24) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Functional Area'
  @Common.Heading : 'FA'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FM_FAREA'
  FunctionalArea : String(16) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Budget Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FM_BUDGET_PERIOD'
  BudgetPeriod : String(10) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Controlling Area'
  @Common.Heading : 'COAr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KOKRS'
  ControllingArea : String(4) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Procedure'
  @Common.Heading : 'Proc.'
  @Common.QuickInfo : 'Procedure (Pricing, Output Control, Acct. Det., Costing,...)'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=KALSM_D'
  TaxCalculationProcedure : String(6) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'FM Area'
  @Common.Heading : 'FMA'
  @Common.QuickInfo : 'Financial Management Area'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FIKRS'
  FinancialManagementArea : String(4) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Business Partner Assignments'
@Common.SemanticKey : [
  'ValidityStartDate',
  'BusinessPartnerRole',
  'BusinessPartner',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [ 'REPartnerRelationUUID', 'InternalRealEstateNumber' ]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrPartAssgmt {
  @Core.Immutable : true
  @Common.Label : 'GUID: BP/Object'
  @Common.Heading : 'GUID BP/OR'
  @Common.QuickInfo : 'GUID: Business Partner Object Relationship'
  key REPartnerRelationUUID : UUID not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Business Partner'
  @Common.QuickInfo : 'Business Partner Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BU_PARTNER'
  BusinessPartner : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'BP Role'
  @Common.Heading : 'Role'
  @Common.QuickInfo : 'Business Partner: Role'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBPROLE'
  BusinessPartnerRole : String(6) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  ValidityStartEndDateValue : String(16) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Role type'
  @Common.Heading : 'RType'
  @Common.QuickInfo : 'Business Partner: Role Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBPSUBROLE'
  REPartnerRoleType : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Address Type'
  @Common.Heading : 'Addr'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBPADDRTYPE'
  AddressType : String(10) not null;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.Label : 'Frac.share of prop.'
  @Common.Heading : 'Frac. share'
  @Common.QuickInfo : 'Fractional share of property'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBPBRUEIG'
  REFractionalPrptyShrRatio : Decimal(9, 3) not null;
  @Common.Label : 'Co-ownership share'
  @Common.Heading : 'Co-owners.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBPMITEIG'
  REOwnershipShrRatio : Decimal(9, 3) not null;
  @Common.Label : 'Share'
  @Common.QuickInfo : 'Ownership share'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBPANTEIL'
  RECoOwnershipShrRatio : Decimal(6, 2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Factor'
  @Common.QuickInfo : 'Conversion factor for fractional share of property'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBPFAKTEIG'
  REFractionalShrCnvrsnRatio : String(6) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Contract Account'
  @Common.Heading : 'Cont.Account'
  @Common.QuickInfo : 'Contract Account Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REXACNACCT'
  ContractAccount : String(12) not null;
  @Core.Computed : true
  FormattedAddress : String(71) not null;
  @Core.Computed : true
  @Common.Label : 'Main Partner'
  @Common.QuickInfo : 'Real Estate Main Partner'
  REIsMainPartner : Boolean not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Posting Terms'
@Common.SemanticKey : [
  'ValidityStartDate',
  'RETermNumber',
  'RETermType',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermType',
  'RETermNumber',
  'ValidityStartEndDateValue'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrPostingTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Payment Method'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FARP_SCHZW_BSEG'
  PaymentMethod : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Payment Method for Credit Memos'
  REPaymentMethodCreditMemo : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Item Payment Block'
  @Common.Heading : 'IPB'
  @Common.QuickInfo : 'Payment Block on Item'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FARP_DZLSPR'
  PaymentBlockingReason : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Terms of Payment'
  @Common.Heading : 'PTrm'
  @Common.QuickInfo : 'Terms of Payment Key'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERAPYMTTERM'
  PaymentTerms : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'House Bank'
  @Common.Heading : 'House Bk'
  @Common.QuickInfo : 'House Bank Key'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FARP_HBKID'
  HouseBank : String(5) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'House Bank Account'
  HouseBankAccount : String(5) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Bank Details ID'
  @Common.Heading : 'ID'
  BankIdentification : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Note to Payee'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERANOTETOPAYEE'
  RENoteToPayeeText : String(25) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Dunning Area'
  @Common.Heading : 'DArea'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FARP_MABER'
  DunningArea : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Dunning Key'
  @Common.Heading : 'DKey'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FARP_MSCHL'
  DunningKey : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Dunning Block'
  @Common.Heading : 'DBlock'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=FARP_MANSP'
  DunningBlockingReason : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Account Determination Value'
  REAcctDeterminationKey : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Tax Type'
  @Common.Heading : 'TTyp'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERATAXTYPE'
  RETaxType : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Tax Group'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERATAXGROUP'
  TaxGroup : String(20) not null;
  @Common.Label : 'Gross'
  @Common.QuickInfo : 'Condition Amount Is Gross Amount'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDISGROSS'
  REIsConditionGrossAmount : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Alternative Tax Reporting Country/Region'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMVDMTAXCOUNTRY'
  TaxCountry : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Business Partner'
  @Common.QuickInfo : 'Business Partner Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=BU_PARTNER'
  BusinessPartner : String(10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Internal Object Number'
  @Common.QuickInfo : 'Object Number for Internal Use'
  REAccountingObject : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Tax Jurisdiction'
  @Common.Heading : 'Tax Jur.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TXJCD'
  TaxJurisdiction : String(15) not null;
  @Common.Label : 'Split'
  @Common.QuickInfo : 'Condition Split'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMISCDSPLIT'
  REIsConditionSplit : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Currency Translation Rule'
  RECurrencyTranslationRule : String(20) not null;
  @Common.Label : 'Partner Lock'
  @Common.Heading : 'Prtnr Lock'
  @Common.QuickInfo : 'Lock of Partner Data in Posting Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERAISPARTNERBLOCKED'
  REIsPartnerBlocked : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'ID of SEPA Mandate'
  @Common.Heading : 'SEPA Mandate'
  @Common.QuickInfo : 'SEPA Mandate: Unique Reference to Mandate per Vendor'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMSEPAMNDID'
  SEPAMandate : String(35) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Creditor ID'
  @Common.QuickInfo : 'SEPA Mandate: Creditor ID'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMSEPARECCRDID'
  SEPAMandateCreditor : String(35) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Reminder Dates'
@Common.SemanticKey : [ 'REReminderDate', 'REReminderNumber', 'InternalRealEstateNumber' ]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [ 'InternalRealEstateNumber', 'REReminderNumber', 'REReminderDate' ]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
@Capabilities.InsertRestrictions.Insertable : false
@Capabilities.DeleteRestrictions.Deletable : false
entity API_RECONTRACT_0001.A_REContrReminderDate {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  @Common.Label : 'Reminder Rule Number'
  @Common.QuickInfo : 'Identification Number of Reminder Rule'
  key REReminderNumber : String(4) not null;
  @Core.Immutable : true
  @Common.Label : 'Reminder Date'
  key REReminderDate : Date not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Reminder Rule'
  REReminderRule : String(4) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Reminder Reason'
  REReminderReason : String(4) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Entered By'
  @Common.Heading : 'Entered'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERF'
  CreatedByUser : String(12) not null;
  @Core.Computed : true
  @Common.Label : 'First Entered On'
  @Common.Heading : 'Entered On'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DERF'
  CreationDate : Date;
  @Core.Computed : true
  @Common.Label : 'Time of Creation'
  @Common.Heading : 'Time'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TERF'
  CreationTime : Time not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Initial Entry Source'
  @Common.Heading : 'Src.In.Ent.'
  @Common.QuickInfo : 'Source of Initial Entry'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REHER'
  RESourceOfCreation : String(10) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Last Changed By'
  @Common.Heading : 'Last Change'
  @Common.QuickInfo : 'Employee ID'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RBEAR'
  LastChangedByUser : String(12) not null;
  @Core.Computed : true
  @Common.Label : 'Last Edited On'
  @Common.Heading : 'LastEdit'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=DBEAR'
  LastChangeDate : Date;
  @Core.Computed : true
  @Common.Label : 'Last Edited At'
  @Common.Heading : 'LastEdit'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TBEAR'
  LastChangeTime : Time not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Editing Source'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RBHER'
  RESourceOfChange : String(10) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Person Responsible'
  @Common.Heading : 'Person Resp.'
  Responsible : String(12) not null;
  @Common.Label : 'Workflow Date'
  REReminderWrkflwDate : Date;
  @Common.Label : 'Reminder Completed'
  @Common.QuickInfo : 'Reminder Date Completed'
  REReminderIsDone : Boolean not null;
  @Common.Label : 'Fixed Date'
  @Common.Heading : 'Fix'
  @Common.QuickInfo : 'Reminder Date Fixed'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECARSFIXED'
  REReminderIsFix : Boolean not null;
  @Common.Label : 'Workflow'
  @Common.Heading : 'WF'
  @Common.QuickInfo : 'Send workflow event'
  REReminderIsWrkflwSend : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Text Name'
  @Common.Heading : 'Text'
  @Common.QuickInfo : 'Name'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=TDOBNAME'
  TextObjectKey : String(70) not null;
  @Common.Label : 'Reminder Memo'
  @Common.QuickInfo : 'Memo for Reminder Date'
  REReminderInfoText : String(60) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Reminder Rules'
@Common.SemanticKey : [
  'REReminderRuleParamNumber',
  'REReminderNumber',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'REReminderNumber',
  'REReminderRuleParamNumber'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrReminderRule {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  @Common.Label : 'Reminder Rule Number'
  @Common.QuickInfo : 'Identification Number of Reminder Rule'
  key REReminderNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  @Common.Label : 'Reminder Rule Parameter'
  @Common.QuickInfo : 'Number of Parameter of Reminder Rule'
  key REReminderRuleParamNumber : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Reminder Rule'
  REReminderRule : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Reminder Reason'
  REReminderReason : String(4) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Type of Reminder Rule Parameter'
  @Common.QuickInfo : 'Type of Parameter of Reminder Rule'
  REReminderParamType : String(1) not null;
  @Common.Label : 'Reminder Date Parameter'
  @Common.QuickInfo : 'Parameter of Reminder Rule: Date'
  REReminderParamDate : Date;
  @Common.IsDigitSequence : true
  @Common.Label : 'Reminder Number Parameter'
  @Common.QuickInfo : 'Parameter of Reminder Rule: Number'
  REReminderParamNmbr : String(4) not null;
  @Common.Label : 'Reminder Yes/No Parameter'
  @Common.QuickInfo : 'Parameter of Reminder Rule: Y/N Field'
  REReminderParamIsBoolean : Boolean not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Renewal Terms'
@Common.SemanticKey : [
  'RERenewalRuleType',
  'RERenewalSequenceNumber',
  'RETermNumber',
  'RETermType',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermType',
  'RETermNumber',
  'RERenewalType',
  'RERenewalSequenceNumber',
  'RERenewalRuleType'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrRenewalTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Renewal Type'
  @Common.Heading : 'RT'
  @Common.QuickInfo : 'Type of Renewal of Real Estate Contract'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNTYPE'
  key RERenewalType : String(1) not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  @Common.Label : 'Sequence No.'
  @Common.Heading : 'Seq'
  @Common.QuickInfo : 'Sequence Number of Extension Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNRULENO'
  key RERenewalSequenceNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Option/Automatic'
  @Common.Heading : 'O/A'
  @Common.QuickInfo : 'Type of Renewal Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNRULETYPE'
  key RERenewalRuleType : String(1) not null;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Renewal Rule'
  @Common.Heading : 'RRul'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNRULE'
  RERenewalRule : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Autom. Renewal Type'
  @Common.Heading : 'Autm.Renew'
  @Common.QuickInfo : 'Type of Automatic Renewal'
  REAutomaticRenewalType : String(1) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Number of Renewals'
  @Common.Heading : 'Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNEXTCOUNT'
  RENumberOfRenewals : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Renewed Years'
  @Common.Heading : 'RnwYrs'
  @Common.QuickInfo : 'Contract Renewed for Number of Years'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNEXTYEARS'
  RERenewalPeriodInYears : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Renewed Months'
  @Common.Heading : 'RnwMos'
  @Common.QuickInfo : 'Contract Renewed for Number of Months'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNEXTMONTHS'
  RERenewalPeriodInMonths : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Renewed Days'
  @Common.Heading : 'RnwDys'
  @Common.QuickInfo : 'Contract Renewed for Number of Days'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNEXTDAYS'
  RERenewalPeriodInDays : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Rounding of Renewal'
  @Common.Heading : 'Roundng'
  @Common.QuickInfo : 'Rounding Rule for Determined Renewal Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNEXTROUND'
  RERenewalRoundingDateRule : String(1) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notification Years'
  @Common.Heading : 'NtfY'
  @Common.QuickInfo : 'Notification Must Be This No. of Years before Renewal Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNNOTYEARS'
  RENotificationPeriodInYears : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notification Months'
  @Common.Heading : 'NtfM'
  @Common.QuickInfo : 'Notification Must Be This No. of Months before Renewal Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNNOTMONTHS'
  RENotificationPeriodInMonths : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notification Weeks'
  @Common.Heading : 'NtfW'
  @Common.QuickInfo : 'Notification Must Be This No. of Weeks before Renewal Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNNOTWEEKS'
  RENotificationPeriodInWeeks : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Notification Days'
  @Common.Heading : 'NtfD'
  @Common.QuickInfo : 'Notification Must Be This Number of Days Before Renewal Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNNOTDAYS'
  RENotificationPeriodInDays : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Notific. Rounding'
  @Common.Heading : 'Roundng'
  @Common.QuickInfo : 'Rounding Rule for Determined Notification Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMRNNOTROUND'
  RENotificationRoundingDateRule : String(1) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Rhythm Terms'
@Common.SemanticKey : [
  'ValidityStartDate',
  'RETermNumber',
  'RETermType',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermType',
  'RETermNumber',
  'ValidityStartEndDateValue'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrRhythmTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Frequency'
  @Common.Heading : 'Freq.'
  @Common.QuickInfo : 'Number of Frequency Units of Period'
  RENumberOfFrequencyUnits : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Frequency Unit'
  @Common.Heading : 'FrUn'
  REFrequencyUnit : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Start of Week'
  @Common.QuickInfo : 'Start of Week for Weekly Frequencies'
  REStartFrequencyWeek : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Start of Frequency'
  @Common.Heading : 'FrSt'
  @Common.QuickInfo : 'Start of Frequency for Daily, Monthly, and Yearly Frequency'
  REFrequencyStart : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Amount Reference'
  @Common.Heading : 'AmtR'
  @Common.QuickInfo : 'Condition Amount Reference'
  REConditionAmountReference : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Condition Amount Reference Differences'
  REConditionAmountDiff : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Pro Rata'
  @Common.Heading : 'PrRt'
  @Common.QuickInfo : 'Pro Rata Method'
  REProRataMethod : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Calculation Method'
  @Common.Heading : 'CaMe'
  @Common.QuickInfo : 'Calculation method for time-dependent periods'
  REProRataMethodCalc : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Payment Form'
  @Common.Heading : 'Pmnt form'
  @Common.QuickInfo : 'Payment Form (Period Start, Mid-Period, In Arrears, Example)'
  REPaymentForm : String(1) not null;
  @Common.Label : 'Frequency Start Date (User)'
  @Common.QuickInfo : 'User-Selected Frequency Start Date'
  REFrequencyStartDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Correction Rule'
  @Common.Heading : 'CrRl'
  @Common.QuickInfo : 'Due Date Correction Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDDUEDATECORRRULE'
  REDueDateCorrectionRule : String(4) not null;
  @Common.Label : 'Days'
  @Common.QuickInfo : 'Number of Days for Correcting Due Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDDUEDATECORRDAY'
  REDueDateNumberOfCrrtnDays : Integer not null;
  @Common.Label : 'Months'
  @Common.QuickInfo : 'Number of Months for Correcting Due Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDDUEDATECORRMONTH'
  REDueDateNumberOfCrrtnMonths : Integer not null;
  @Common.Label : 'Years'
  @Common.QuickInfo : 'Number of Years for Correcting Due Date'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDDUEDATECORRYEAR'
  REDueDateNumberOfCrrtnYears : Integer not null;
  @Common.Label : 'Number'
  @Common.QuickInfo : 'Correction Number for Correction of Due Date by Calendar'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDDUEDATECORRCAL'
  REDueDateNumberOfCrrtnCalendar : Integer not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Unit'
  @Common.QuickInfo : 'Unit for Correcting Due Date by Calendar'
  REDueDateCrrtnCalendarUnit : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Factory Calendar ID'
  @Common.Heading : 'Fac.Cal.ID'
  @Common.QuickInfo : 'Factory Calendar'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECACALENDAR'
  FactoryCalendar : String(2) not null;
  @Common.Label : 'Move Start'
  @Common.Heading : 'Strt'
  @Common.QuickInfo : 'Move Due Date to Start'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDDUEDATEMOVEBEGIN'
  REDueDateIsAtBeginning : Boolean not null;
  @Common.Label : 'Move End'
  @Common.Heading : 'End'
  @Common.QuickInfo : 'Move Due Date to End'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDDUEDATEMOVEEND'
  REDueDateIsAtEnd : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Fixed Periods'
  @Common.Heading : 'FxPd'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDFIXPER'
  REFixedPeriod : String(10) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Sales Reporting Terms'
@Common.SemanticKey : [
  'ValidityStartDate',
  'RETermType',
  'RETermNumber',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermNumber',
  'RETermType',
  'ValidityStartEndDateValue',
  'RESalesRhythmType'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrSalesReportingTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Type of Frequency'
  @Common.Heading : 'Freq.Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRHYTHMTYPE'
  key RESalesRhythmType : String(4) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Type'
  @Common.Heading : 'Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECAOBJTYPE'
  RealEstateObjectType : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  REStatusObject : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Sales Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRSALESTYPE'
  RESalesType : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Gross/Net Sales'
  @Common.Heading : 'Gross/Net'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRSALESREPORTTYPE'
  RESalesReportType : String(2) not null;
  @Common.Label : 'Statistical Only'
  @Common.Heading : 'Statist.'
  @Common.QuickInfo : 'Statistical Sales Report'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRREPSTATISTICAL'
  REIsStatisticalRule : Boolean not null;
  @Common.Label : 'Using Meter'
  @Common.Heading : 'Meter'
  @Common.QuickInfo : 'Sales Determined by Assigned Meter'
  RESalesReportingIsUsingMsmt : Boolean not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Measurement Type'
  @Common.Heading : 'MeasTp'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDMEAS'
  REMeasurementType : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  REStatusObjectMeasurement : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Measuring Point'
  @Common.Heading : 'MeasPoint'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESCPOINT'
  MeasuringPoint : String(12) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Heating Value Days'
  @Common.Heading : 'RL Key'
  @Common.QuickInfo : 'Regional Location Key for Heating Value Days'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESCLOCKEY'
  RERgnlLocKeyHeatingValDays : String(10) not null;
  @Common.Label : 'Start of Frequency'
  @Common.Heading : 'Freq.Start'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRHBEGIN'
  REFrequencyStartDate : Date;
  @Common.IsDigitSequence : true
  @Common.Label : 'Frequency'
  @Common.Heading : 'Freq.'
  @Common.QuickInfo : 'Number of Frequency Units of Period'
  RENumberOfFrequencyUnits : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Frequency Unit'
  @Common.Heading : 'FrUn'
  REFrequencyUnit : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Fixed Periods'
  @Common.Heading : 'FxPd'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDFIXPER'
  REFixedPeriod : String(10) not null;
  @Common.Label : 'Tolerance Value'
  @Common.Heading : 'Tolerance'
  @Common.QuickInfo : 'Tolerance for When Sales Report Must Be Received'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRPTOLERANCE'
  RESalesReportingTolerance : Integer not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Tolerance in'
  @Common.Heading : 'Unit'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRPTOLERANCEIN'
  RESalesReportingToleranceUnit : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Factory Calendar'
  @Common.Heading : 'Calendar'
  @Common.QuickInfo : 'Calendar'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRPTOLCALENDAR'
  RESalesRptgToleranceCalendar : String(2) not null;
  @Common.Label : 'Exclusion Start'
  @Common.Heading : 'Excl.Start'
  @Common.QuickInfo : 'Start of Excluded Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRHBEGINEXCL'
  REFrequencyExcludedStartDate : Date;
  @Common.Label : 'Validity End Date'
  REFrequencyExcludedEndDate : Date;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Sales Rule Frequencies'
@Common.SemanticKey : [
  'ValidityStartDate',
  'RETermType',
  'RETermNumber',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermNumber',
  'RETermType',
  'RESalesRhythmType',
  'ValidityStartEndDateValue'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrSalesRuleFrqcyTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'SR No.'
  @Common.QuickInfo : 'Term Number of Sales Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRTMSBTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Type of Frequency'
  @Common.Heading : 'Freq.Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRHYTHMTYPE'
  key RESalesRhythmType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Type'
  @Common.Heading : 'Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECAOBJTYPE'
  RealEstateObjectType : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  REStatusObject : String(22) not null;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.Label : 'Start of Frequency'
  @Common.Heading : 'Freq.Start'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRHBEGIN'
  REFrequencyStartDate : Date;
  @Common.IsDigitSequence : true
  @Common.Label : 'Frequency'
  @Common.Heading : 'Freq.'
  @Common.QuickInfo : 'Number of Frequency Units of Period'
  RENumberOfFrequencyUnits : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Frequency Unit'
  @Common.Heading : 'FrUn'
  REFrequencyUnit : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Pro Rata'
  @Common.Heading : 'PrRt'
  @Common.QuickInfo : 'Pro Rata Method'
  REProRataMethod : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Calculation Method'
  @Common.Heading : 'CaMe'
  @Common.QuickInfo : 'Calculation method for time-dependent periods'
  REProRataMethodCalc : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Fixed Periods'
  @Common.Heading : 'FxPd'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDFIXPER'
  REFixedPeriod : String(10) not null;
  @Common.Label : 'Pay Credit'
  @Common.Heading : 'Pay'
  @Common.QuickInfo : 'Credits Withing Cumulative Settlement Are Paid'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRCREDITPAYBACK'
  RESalesIsCreditPayback : Boolean not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Sales Rule Terms'
@Common.SemanticKey : [
  'ValidityStartDate',
  'RETermType',
  'RETermNumber',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermNumber',
  'RETermType',
  'ValidityStartEndDateValue',
  'RESalesReportingTermNumber',
  'RESalesItemNumberGrading'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
@Capabilities.FilterRestrictions.FilterExpressionRestrictions : [
  { Property: REMinSalesAmount, AllowedExpressions: 'MultiValue' },
  {
    Property: REMinSalesRptgIntervalAmount,
    AllowedExpressions: 'MultiValue'
  },
  { Property: REMinSalesQuantity, AllowedExpressions: 'MultiValue' },
  {
    Property: REMinSalesRptgIntervalQuantity,
    AllowedExpressions: 'MultiValue'
  },
  { Property: REMaxSalesAmount, AllowedExpressions: 'MultiValue' },
  { Property: REMaxSalesQuantity, AllowedExpressions: 'MultiValue' },
  { Property: REMinSalesGradingAmount, AllowedExpressions: 'MultiValue' },
  { Property: REMaxSalesGradingAmount, AllowedExpressions: 'MultiValue' },
  { Property: REMinSalesGradingQuantity, AllowedExpressions: 'MultiValue' },
  { Property: REMaxSalesGradingQuantity, AllowedExpressions: 'MultiValue' },
  {
    Property: RESalesMinRentGradingAmount,
    AllowedExpressions: 'MultiValue'
  }
]
entity API_RECONTRACT_0001.A_REContrSalesRuleTerm {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  key RETermType : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RepRuleNo.'
  @Common.QuickInfo : 'Term Number of Reporting Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRTMRPTERMNO'
  key RESalesReportingTermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  @Common.Label : 'Sequence number'
  @Common.Heading : 'Seq. no.'
  @Common.QuickInfo : 'Sequence number for sales amount and percentage'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRGRADINGITEMNO'
  key RESalesItemNumberGrading : String(3) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Type'
  @Common.Heading : 'Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECAOBJTYPE'
  RealEstateObjectType : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Object Number'
  REStatusObject : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Type of Sales Rule'
  @Common.Heading : 'Rule Type'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRSALESRULE'
  RESalesRule : String(4) not null;
  @Common.Label : 'Peak Sales Rule'
  @Common.Heading : 'PkSalesRl'
  @Common.QuickInfo : 'Is a Peak Sales Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRISMASTERSB'
  REIsPeakSalesRule : Boolean not null;
  @Common.Label : 'Post Using Cash Flow'
  @Common.Heading : 'Post CF'
  @Common.QuickInfo : 'Use Periodic Posting Run for Posting'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRUSECF4POST'
  RESalesRuleIsUsingPeriodicPost : Boolean not null;
  @Common.IsCurrency : true
  @Common.IsUpperCase : true
  @Common.Label : 'Currency'
  @Common.Heading : 'Crcy'
  @Common.QuickInfo : 'Currency Key'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=WAERS'
  RESalesCurrency : String(3) not null;
  @Common.IsUnit : true
  @Common.Label : 'Unit'
  @Common.QuickInfo : 'Unit of measurement of sales reporting values'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRSALESUNIT'
  RESalesUnit : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'What Sales'
  @Common.QuickInfo : 'What Sales Should Be Used for Calculation'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRCALCAMOUNTTYPE'
  RESalesAmountType : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Net/Gross'
  @Common.QuickInfo : 'Is Price per Unit of Measure a Net or Gross Pricee'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRPRICEPERUNITAMOUNTTYPE'
  RESalesQuantityAmountType : String(2) not null;
  @Measures.ISOCurrency : RESalesCurrency
  @Common.Label : 'Minimum sales (Amt)'
  @Common.Heading : 'Minimum sales(Amt)'
  @Common.QuickInfo : 'Minimum Monetary Sales in the Settlement Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMINSALESSEPER'
  REMinSalesAmount : Decimal(precision: 15) not null;
  @Measures.ISOCurrency : RESalesCurrency
  @Common.Label : 'Min.sales/rep.inter.'
  @Common.Heading : 'Min.sales/rep.'
  @Common.QuickInfo : 'Minimum sales in reporting interval'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMINSALESREP'
  REMinSalesRptgIntervalAmount : Decimal(precision: 15) not null;
  @Measures.Unit : RESalesUnit
  @Common.Label : 'Min.Q.Sales'
  @Common.QuickInfo : 'Minimum Quantitative Sales in Settlement Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMINQUANSEPER'
  REMinSalesQuantity : Decimal(17, 4) not null;
  @Measures.Unit : RESalesUnit
  @Common.Label : 'MinQSales/Rep.Int.'
  @Common.Heading : 'MinQSales/RepI'
  @Common.QuickInfo : 'Minimum Quantitative Sales in Reporting Interval'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMINQUANREP'
  REMinSalesRptgIntervalQuantity : Decimal(17, 4) not null;
  @Measures.ISOCurrency : RESalesCurrency
  @Common.Label : 'Max. sales (amount)'
  @Common.Heading : 'Max.sales (amount)'
  @Common.QuickInfo : 'Maximum (Monetary) Sales in the Settlement Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMAXSALESSEPER'
  REMaxSalesAmount : Decimal(precision: 15) not null;
  @Measures.Unit : RESalesUnit
  @Common.Label : 'Max.Q.Sales'
  @Common.QuickInfo : 'Maximum Quantitative Sales in Settlement Period'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMAXQUANSEPER'
  REMaxSalesQuantity : Decimal(17, 4) not null;
  @Common.IsUnit : true
  @Common.Label : 'Unit'
  @Common.QuickInfo : 'Unit of measurement of sales reporting values'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRSALESUNIT'
  RESalesUnitGrading : String(3) not null;
  @Measures.ISOCurrency : RESalesCurrency
  @Common.Label : 'Sales from'
  @Common.QuickInfo : 'Sales (minimum)'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMINSALESSALESGRADING'
  REMinSalesGradingAmount : Decimal(precision: 15) not null;
  @Measures.ISOCurrency : RESalesCurrency
  @Common.Label : 'Sales To'
  @Common.QuickInfo : 'Sales (maximum)'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMAXSALESSALESGRADING'
  REMaxSalesGradingAmount : Decimal(precision: 15) not null;
  @Measures.Unit : RESalesUnit
  @Common.Label : 'Q.Sales From'
  @Common.QuickInfo : 'Quantitative Sales (Minimum)'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMINQUANTITY'
  REMinSalesGradingQuantity : Decimal(17, 4) not null;
  @Measures.Unit : RESalesUnit
  @Common.Label : 'Q.Sales To'
  @Common.QuickInfo : 'Quantitative Sales (Maximum)'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMAXQUANTITY'
  REMaxSalesGradingQuantity : Decimal(17, 4) not null;
  @Common.Label : 'Amount/UnitMeas.'
  @Common.QuickInfo : 'Amount per unit of measure'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRPRICEPERUNIT'
  REPerUnitGradingPrice : Decimal(19, 6) not null;
  @Measures.ISOCurrency : RESalesCurrency
  @Common.Label : 'MinRent/SalesGrading'
  @Common.Heading : 'Min. Rent/Grading'
  @Common.QuickInfo : 'Minimum Rent per Sales Grading'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRMINRENTSALESGRADING'
  RESalesMinRentGradingAmount : Decimal(precision: 15) not null;
  @Common.Label : '% rate'
  @Common.QuickInfo : 'Percentage of sales as rent'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RESRRENTPERCENT'
  RESalesRentGradingPercent : Decimal(5, 2) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Valuation Terms'
@Common.SemanticKey : [
  'ValidityStartEndDateValue',
  'RETermNumber',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.FilterRestrictions.NonFilterableProperties : [ 'REIdentification' ]
@Capabilities.SortRestrictions.NonSortableProperties : [ 'REIdentification' ]
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermNumber',
  'ValidityStartEndDateValue'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
entity API_RECONTRACT_0001.A_REContrValuation {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Term Category'
  @Common.Heading : 'Cat.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMTYPE'
  RETermType : String(4) not null;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Valuation Rule'
  @Common.Heading : 'Val.Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECECERULE'
  REValuationRule : String(10) not null;
  @Common.Label : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Val. Object Number'
  @Common.QuickInfo : 'Valuation Object Number'
  REStatusObject : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Contract BusObjType'
  @Common.Heading : 'BusObjType'
  @Common.QuickInfo : 'Business Object Type of Contract Object'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=REBDBUSOBJTYPECN'
  RealEstateObjectType : String(2) not null;
  @Core.Computed : true
  @Common.IsUpperCase : true
  @Common.Label : 'Obj. Identification'
  @Common.Heading : 'Object'
  @Common.QuickInfo : 'Complete Object Identification, for Example BE 1000/123'
  REIdentification : String(50) not null;
  @Common.Label : 'Relation Valid From'
  @Common.QuickInfo : 'Validity Start Date'
  ObjectValidFrom : Date;
  @Common.Label : 'Start of Consideration'
  @Common.QuickInfo : 'Start of consideration'
  REConsiderationStartDate : Date;
  @Common.Label : 'First Posting From'
  @Common.QuickInfo : 'Start of consideration'
  RECashFlowPostingFromDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Asset Number'
  @Common.QuickInfo : 'Asset Object'
  REStatusObjectAsset : String(22) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Classification'
  @Common.Heading : 'Classific'
  @Common.QuickInfo : 'Valuation Classification'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECECESLTYPE'
  REValuationClassification : String(1) not null;
  @Common.Label : 'Interest Rate'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECEINTERESTRATE'
  REInterestRate : Decimal(15, 10) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Frequency Term'
  @Common.Heading : 'FT'
  @Common.QuickInfo : 'Number of Frequency Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECETERMNORH'
  REFrequencyTerm : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Distribut. Formula'
  @Common.Heading : 'DstF'
  @Common.QuickInfo : 'Distribution Formula'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDDISTRULE'
  REDistributionRule : String(4) not null;
  @Common.Label : 'Dist.Form.Param.'
  @Common.Heading : 'Distrib. Formula Parameter'
  @Common.QuickInfo : 'Untypified Parameter for a Distribution Formula'
  REDistributionRuleParam1 : String(70) not null;
  @Common.Label : 'Dist.Form.Param.'
  @Common.Heading : 'Distrib. Formula Parameter'
  @Common.QuickInfo : 'Untypified Parameter for a Distribution Formula'
  REDistributionRuleParam2 : String(70) not null;
  @Common.Label : 'Probable End'
  @Common.Heading : 'Prob. End'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECEVDMPROBABLEEND'
  REProbableEndDate : Date;
  @Common.Label : 'End of Usage RoU'
  @Common.Heading : 'Usage End RoU'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECEVDMUSEFULLIFEEND'
  REAssetRightOfUseEndDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Rule Status'
  @Common.QuickInfo : 'Valuation Rule Status'
  REValuationRuleStatus : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Valuation Status'
  REValuationStatus : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Reason for Stat.'
  @Common.Heading : 'Reason for Status'
  @Common.QuickInfo : 'Reason for Status'
  REValuationStatusReason : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Valuation Behavior'
  @Common.Heading : 'Val.Beh.'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECEPROCESSBEHAVIOR'
  REValuationBehavior : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Tax Type'
  @Common.Heading : 'TTyp'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERATAXTYPE'
  RETaxType : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Tax Group'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RERATAXGROUP'
  TaxGroup : String(20) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Accounting Object'
  REAccountingObject : String(22) not null;
  @Common.Label : 'Note'
  @Common.QuickInfo : 'Valuation Note'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECENOTE'
  REInfoText : String(100) not null;
  @Common.Label : 'Numerator Factor'
  @Common.Heading : 'Num.Factor'
  @Common.QuickInfo : 'Numerator Valuation Factor'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECESCOPENUMERATOR'
  REValuationFactorNumerator : Integer not null;
  @Common.Label : 'Denominator Factor'
  @Common.Heading : 'Den.Factor'
  @Common.QuickInfo : 'Denominator Valuation Factor'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECESCOPEDENOMINATOR'
  REValuationFactorDenominator : Integer not null;
  @Common.IsCurrency : true
  @Common.IsUpperCase : true
  @Common.Label : 'Valuation Currency'
  REValuationCurrency : String(3) not null;
  @Common.Label : 'Questionnaire'
  @Common.QuickInfo : 'GUID for Questionnaire'
  REValuationQuestionnaireUUID : UUID;
  @Common.IsUpperCase : true
  @Common.Label : 'Country/Region Key'
  @Common.Heading : 'C/R'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=LAND1'
  Country : String(3) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Condition Specific Valuations'
@Common.SemanticKey : [
  'REStatusObjectCalculation',
  'REExtConditionPurpose',
  'REConditionValidityStartDate',
  'REConditionType',
  'ValidityStartEndDateValue',
  'RETermNumber',
  'InternalRealEstateNumber'
]
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.UpdateRestrictions.DeltaUpdateSupported : true
@Capabilities.UpdateRestrictions.NonUpdatableProperties : [
  'InternalRealEstateNumber',
  'RETermNumber',
  'ValidityStartEndDateValue',
  'REConditionType',
  'REConditionValidityStartDate',
  'REExtConditionPurpose',
  'REStatusObjectCalculation'
]
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_REContract' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.DeepUpdateSupport.ContentIDSupported : true
@Capabilities.FilterRestrictions.FilterExpressionRestrictions : [
  {
    Property: REValuationCndnShareAbsltAmt,
    AllowedExpressions: 'MultiValue'
  }
]
entity API_RECONTRACT_0001.A_REContrValuationCondition {
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'RE Key'
  @Common.QuickInfo : 'Internal Key of Real Estate Object'
  key InternalRealEstateNumber : String(13) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Number'
  @Common.Heading : 'No.'
  @Common.QuickInfo : 'Term Number'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMTERMNO'
  key RETermNumber : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Validity Period'
  @Common.QuickInfo : 'Date from to (RAP Key)'
  key ValidityStartEndDateValue : String(16) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Condition Type'
  @Common.Heading : 'CTyp'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECDCONDTYPE'
  key REConditionType : String(4) not null;
  @Core.Immutable : true
  @Common.Label : 'Condition Validity Start Date'
  @Common.QuickInfo : 'Validity Start Date'
  key REConditionValidityStartDate : Date not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'External Condition Purpose'
  @Common.QuickInfo : 'Conditions - External Purpos'
  key REExtConditionPurpose : String(4) not null;
  @Core.Immutable : true
  @Common.IsUpperCase : true
  @Common.Label : 'Calculation Object Number'
  @Common.QuickInfo : 'Object Number for Calculation'
  key REStatusObjectCalculation : String(22) not null;
  @Common.Label : 'Name of Term'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RETMXTERM'
  RETermName : String(60) not null;
  @Common.Label : 'Valuation Validity Start Date'
  @Common.QuickInfo : 'Validity Start Date'
  ValidityStartDate : Date;
  @Common.Label : 'Valuation Validity End Date'
  @Common.QuickInfo : 'Validity End Date'
  ValidityEndDate : Date;
  @Common.Label : 'Condition Validity End Date'
  @Common.QuickInfo : 'Validity End Date'
  REConditionValidityEndDate : Date;
  @Common.IsUpperCase : true
  @Common.Label : 'Valuation Property'
  @Common.Heading : 'Val.Prop.'
  @Common.QuickInfo : 'Condition Valuation Property'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECECDPROP'
  REValuationCndnProperty : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Cond. Consideration'
  @Common.Heading : 'Cond.Cons.'
  @Common.QuickInfo : 'Condition Consideration'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECECDCONS'
  REValuationCndnConsdtn : String(1) not null;
  @Common.Label : 'Cons. Condition'
  @Common.Heading : 'Cons.Cond.'
  @Common.QuickInfo : 'Indicator: Consider Condition?'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECECONSIDERCOND'
  REIsValuationCndnConsdtn : Boolean not null;
  @Common.Label : 'Percentage'
  @Common.Heading : '% Share'
  @Common.QuickInfo : 'Percentage Share of Condition'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECECONDPERC'
  REValuationCndnSharePercent : Decimal(7, 4) not null;
  @Measures.ISOCurrency : REValuationCurrency
  @Common.Label : 'Absolute Share'
  @Common.Heading : 'Abs. Share'
  @Common.QuickInfo : 'Absolute Share of Condition'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECECONDABS'
  REValuationCndnShareAbsltAmt : Decimal(precision: 15) not null;
  @Common.IsCurrency : true
  @Common.IsUpperCase : true
  @Common.Label : 'Valuation Currency'
  @Common.QuickInfo : 'Condition Currency'
  REValuationCurrency : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Status Cond. Rule'
  @Common.Heading : 'Stat.Cond.'
  @Common.QuickInfo : 'Status of Condition-Specific Valuation Rule'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECESTATUSCONDRULE'
  REValuationCndnStatus : String(1) not null;
  @Common.Label : 'Note'
  @Common.QuickInfo : 'Valuation Note'
  @Common.DocumentationRef : 'urn:sap-com:documentation:key?=type=DE&id=RECENOTE'
  REInfoText : String(100) not null;
  SAP__Messages : many API_RECONTRACT_0001.SAP__Message not null;
  _REContract : Association to one API_RECONTRACT_0001.A_REContract {  };
};

