# Calira.Api.Model.EquipmentConfiguration
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **int?** |  | 
**CreatedAt** | **DateTime?** |  | [optional] 
**UpdatedAt** | **DateTime?** |  | [optional] 
**AccountId** | **int?** |  | 
**Lab** | [**IdName**](IdName.md) |  | [optional] 
**Name** | **string** |  | 
**Room** | **string** |  | [optional] 
**Category** | **string** |  | 
**Subcategory** | **string** |  | [optional] 
**Manufacturer** | **string** |  | [optional] 
**ModelNumber** | **string** |  | [optional] 
**ManufacturingYear** | **int?** |  | [optional] 
**SerialNumber** | **string** |  | [optional] 
**AvailabilityStatus** | **string** |  | [optional] 
**Description** | **string** | Plain-text description. | [optional] 
**LabRules** | **string** | Plain-text lab-specific usage rules. | [optional] 
**SafetyFeatures** | **string** | Plain-text safety information. | [optional] 
**DateOfPurchase** | **string** |  | [optional] 
**InternalId** | **string** |  | [optional] 
**PurchasePrice** | **decimal?** |  | [optional] 
**ContactAccessRoleIds** | **List&lt;int?&gt;** |  | [optional] 
**GroupIds** | **List&lt;int?&gt;** |  | [optional] 
**EquipmentLabelIds** | **List&lt;int?&gt;** |  | [optional] 
**Photos** | [**List&lt;EquipmentAttachment&gt;**](EquipmentAttachment.md) |  | [optional] 
**Documents** | [**List&lt;EquipmentAttachment&gt;**](EquipmentAttachment.md) |  | [optional] 
**Pricing** | [**EquipmentPricingInput**](EquipmentPricingInput.md) |  | [optional] 
**BookingRules** | [**EquipmentBookingRulesInput**](EquipmentBookingRulesInput.md) |  | [optional] 
**Maintenance** | [**EquipmentMaintenanceInput**](EquipmentMaintenanceInput.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

