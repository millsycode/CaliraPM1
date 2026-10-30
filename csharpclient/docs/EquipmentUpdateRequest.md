# Calira.Api.Model.EquipmentUpdateRequest
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AccountId** | **int?** | Lab account ID where the equipment belongs. **Required on create.** Cannot be changed on update. | [optional] 
**Name** | **string** | Display name of the equipment. **Required on create.** | [optional] 
**Room** | **string** | Physical location or room name (max 255 characters). | [optional] 
**Category** | **string** | Equipment category. **Required on create.** | [optional] 
**Subcategory** | **string** | Subcategory name matching the selected &#x60;category&#x60;. Required when the category has subcategories (e.g. &#x60;Microscopy &amp; Imaging&#x60; for &#x60;Equipment&#x60;). | [optional] 
**Manufacturer** | **string** | Manufacturer name. Required by business rules for &#x60;Equipment&#x60;, &#x60;Other&#x60;, and &#x60;Parent equipment&#x60; categories (max 200 characters). | [optional] 
**ModelNumber** | **string** | Model or catalogue number. Required by business rules for &#x60;Equipment&#x60;, &#x60;Other&#x60;, and &#x60;Parent equipment&#x60; categories (max 200 characters). | [optional] 
**ManufacturingYear** | **decimal?** |  | [optional] 
**SerialNumber** | **string** | Equipment serial number (max 255 characters). | [optional] 
**AvailabilityStatus** | **string** | Whether the equipment can be booked.  Server default: Always Available. | [optional] 
**Description** | **string** | Plain-text description. Rich-text editor formats (HTML or Quill JSON) are not accepted — send plain text only. | [optional] 
**LabRules** | **string** | Plain-text lab-specific usage rules shown to bookers. Send plain text only. | [optional] 
**SafetyFeatures** | **string** | Plain-text safety information shown to bookers. Send plain text only. | [optional] 
**DateOfPurchase** | **string** | Purchase date as an ISO 8601 date string (e.g. &#x60;2024-01-15&#x60;). | [optional] 
**InternalId** | **string** | Internal inventory identifier (max 100 characters; unique per lab). | [optional] 
**PurchasePrice** | **decimal?** |  | [optional] 
**ContactAccessRoleIds** | **List&lt;int?&gt;** | Access role IDs for equipment contact people. Use &#x60;GET /equipment/contact_people?account_id&#x3D;{id}&#x60; to list valid IDs. | [optional] 
**GroupIds** | **List&lt;int?&gt;** | IDs of user groups that should have access to book this equipment. | [optional] 
**EquipmentLabelIds** | **List&lt;int?&gt;** | IDs of equipment labels to apply. | [optional] 
**MaintenanceContractIds** | **List&lt;int?&gt;** | IDs of maintenance contracts. May also be set inside &#x60;maintenance.maintenance_contract_ids&#x60;. | [optional] 
**Photos** | [**EquipmentAttachmentInput**](EquipmentAttachmentInput.md) |  | [optional] 
**Documents** | [**EquipmentAttachmentInput**](EquipmentAttachmentInput.md) |  | [optional] 
**Pricing** | [**EquipmentPricingInput**](EquipmentPricingInput.md) |  | [optional] 
**BookingRules** | [**EquipmentBookingRulesInput**](EquipmentBookingRulesInput.md) |  | [optional] 
**Maintenance** | [**EquipmentMaintenanceInput**](EquipmentMaintenanceInput.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

