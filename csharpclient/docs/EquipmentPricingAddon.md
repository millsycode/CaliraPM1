# Calira.Api.Model.EquipmentPricingAddon
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **int?** | Add-on identifier. | 
**EquipmentAddon** | **string** | Add-on name or label. | 
**MandatoryExternal** | **string** | Mandatory flag for external bookers. Empty string means not mandatory.  Values: &#x60;AAV&#x60;, &#x60;FBO&#x60;, &#x60;OPT&#x60;. | 
**MandatoryInternal** | **string** | Mandatory flag for internal bookers. Empty string means not mandatory.  Values: &#x60;AAV&#x60;, &#x60;FBO&#x60;, &#x60;OPT&#x60;. | 
**Price** | **decimal?** |  | 
**Quantity** | **string** | How the add-on quantity is determined.  Values: &#x60;fixed&#x60;, &#x60;as_booking_hours&#x60;, &#x60;as_booking_days&#x60;, &#x60;user_specified&#x60;. | 
**Unit** | **string** | Billing unit. Required when &#x60;quantity&#x60; is &#x60;user_specified&#x60;. Auto-set to &#x60;per_hour&#x60; when &#x60;quantity&#x60; is &#x60;as_booking_hours&#x60;, &#x60;per_day&#x60; when &#x60;as_booking_days&#x60;, and &#x60;\&quot;\&quot;&#x60; when &#x60;fixed&#x60;.  Values: &#x60;per_sample&#x60;, &#x60;per_day&#x60;, &#x60;per_hour&#x60;, &#x60;per_run&#x60;. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

