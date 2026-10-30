# Calira.Api.Model.BookingInvitationRespondRequest
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **string** | The action to take on the invitation. - &#x60;accept&#x60; — confirm attendance; may trigger calendar sync and notifications - &#x60;reject&#x60; — decline the invitation; optionally include &#x60;reject_reason&#x60;  | 
**RejectReason** | **string** | Optional free-text reason stored when &#x60;status&#x60; is &#x60;reject&#x60;. Ignored when accepting. | [optional] 
**RequestScope** | **string** | For recurring bookings only. Controls which invitations in the series are affected.  Server default: current. | [optional] 
**AcceptAvailable** | **bool?** | When accepting with &#x60;request_scope&#x60; of &#x60;subsequent&#x60; or &#x60;all&#x60;, controls conflict behaviour. If &#x60;false&#x60; (default) and scheduling conflicts exist, no invitations are accepted. If &#x60;true&#x60;, non-conflicting invitations are accepted and conflicting ones are returned in &#x60;conflicting_invitations&#x60;.  Server default: False. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

