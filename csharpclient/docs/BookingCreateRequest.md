# Calira.Api.Model.BookingCreateRequest
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AccountId** | **int?** | Lab account ID. Defaults to the equipment&#x27;s lab. | [optional] 
**EquipmentId** | **int?** |  | 
**StartTime** | **DateTime?** |  | 
**EndTime** | **DateTime?** |  | 
**BookingType** | **string** | Defaults to &#x60;use&#x60;. | [optional] 
**MaintenanceProvider** | **string** | Required for maintenance bookings only. | [optional] 
**MaintenanceType** | **string** | Required for maintenance bookings only. | [optional] 
**Projects** | [**List&lt;BookingProjectInput&gt;**](BookingProjectInput.md) |  | [optional] 
**BookingOnBehalfOf** | **int?** | User ID to create the booking for (lab admins/instructors). | [optional] 
**InvitedUsers** | [**List&lt;BookingInvitedUserInput&gt;**](BookingInvitedUserInput.md) |  | [optional] 
**Recurrence** | [**BookingRecurrenceInput**](BookingRecurrenceInput.md) |  | [optional] 
**AddOns** | [**List&lt;BookingAddOnInput&gt;**](BookingAddOnInput.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

