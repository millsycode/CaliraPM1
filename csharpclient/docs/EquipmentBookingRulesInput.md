# Calira.Api.Model.EquipmentBookingRulesInput
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**BookingRules** | **bool?** | Whether custom booking rules are enabled.  Server default: False. | [optional] 
**BusinessHours** | [**List&lt;EquipmentBusinessHours&gt;**](EquipmentBusinessHours.md) | Per-day opening hours for internal bookers. Optional. | [optional] 
**MinBookingTime** | [**EquipmentTimeConfig**](EquipmentTimeConfig.md) |  | [optional] 
**MaxBookingTime** | [**EquipmentTimeConfig**](EquipmentTimeConfig.md) |  | [optional] 
**TimeStep** | [**EquipmentTimeStep**](EquipmentTimeStep.md) |  | [optional] 
**StartStep** | [**EquipmentStartStep**](EquipmentStartStep.md) |  | [optional] 
**AdvanceBookingMust** | [**EquipmentAdvanceBookingNotice**](EquipmentAdvanceBookingNotice.md) |  | [optional] 
**AdvanceBookingCan** | [**EquipmentAdvanceBookingNotice**](EquipmentAdvanceBookingNotice.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

