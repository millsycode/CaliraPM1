# Calira.Api.Model.BookingInvitation
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **int?** |  | 
**Status** | **string** | Values: &#x60;pending&#x60;, &#x60;accepted&#x60;, &#x60;rejected&#x60;. | 
**BookingId** | **int?** | ID of the booking this invitation belongs to. | 
**RejectReason** | **string** |  | [optional] 
**StartTime** | **DateTime?** |  | [optional] 
**EndTime** | **DateTime?** |  | [optional] 
**CreatedAt** | **DateTime?** |  | [optional] 
**UpdatedAt** | **DateTime?** |  | [optional] 
**User** | [**BookingInvitationUser**](BookingInvitationUser.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

