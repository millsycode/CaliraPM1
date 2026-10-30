# Calira.Api.Model.EquipmentStartStep
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**StartStep** | **string** | When bookings can start: - &#x60;quarter&#x60; — every 15 minutes - &#x60;halfHour&#x60; — every 30 minutes - &#x60;fullHour&#x60; — on the hour - &#x60;fullDay&#x60; — once per day - &#x60;custom&#x60; — use &#x60;custom&#x60; array  Values: &#x60;quarter&#x60;, &#x60;halfHour&#x60;, &#x60;fullHour&#x60;, &#x60;fullDay&#x60;, &#x60;custom&#x60;. | 
**Custom** | **List&lt;string&gt;** | Required when &#x60;start_step&#x60; is &#x60;custom&#x60;. Array of &#x60;HH:MM&#x60; times when bookings may start. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

