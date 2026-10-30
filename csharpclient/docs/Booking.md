# Calira.Api.Model.Booking
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **int?** |  | [optional] 
**Cost** | **string** | Booking cost as a decimal string. | [optional] 
**Currency** | **string** |  | [optional] 
**ChargingType** | **string** |  | [optional] 
**StartTime** | **DateTime?** |  | [optional] 
**EndTime** | **DateTime?** |  | [optional] 
**RequestedAt** | **DateTime?** |  | [optional] 
**BookingType** | **string** |  | [optional] 
**Status** | **string** |  | [optional] 
**Duration** | **decimal?** | Duration in minutes. | [optional] 
**AddOns** | **string** | Add-on names separated by \&quot;; \&quot;. | [optional] 
**MaintenanceProvider** | **string** |  | [optional] 
**MaintenanceType** | **string** |  | [optional] 
**CustomFormResponses** | [**List&lt;CustomFormResponseReference&gt;**](CustomFormResponseReference.md) |  | [optional] 
**RequesterGroup** | [**BookingRequesterGroup**](BookingRequesterGroup.md) |  | [optional] 
**Equipment** | [**IdName**](IdName.md) |  | [optional] 
**ParentEquipment** | [**IdName**](IdName.md) |  | [optional] 
**RequesterLab** | [**IdName**](IdName.md) |  | [optional] 
**RequesterOrganisation** | [**IdName**](IdName.md) |  | [optional] 
**ProviderLab** | [**IdName**](IdName.md) |  | [optional] 
**ProviderOrganisation** | [**IdName**](IdName.md) |  | [optional] 
**Creator** | [**IdName**](IdName.md) |  | [optional] 
**Requester** | [**BookingRequester**](BookingRequester.md) |  | [optional] 
**LastPublicNote** | [**LastPublicNote**](LastPublicNote.md) |  | [optional] 
**Projects** | [**List&lt;BookingProject&gt;**](BookingProject.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

