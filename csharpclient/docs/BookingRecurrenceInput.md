# Calira.Api.Model.BookingRecurrenceInput
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**RecurrenceType** | **string** |  | 
**RecurrenceInterval** | **int?** | Repeat every N days/weeks/months/years. Must be positive. | 
**RecurrenceEnd** | **DateTime?** | Last date of the series (YYYY-MM-DD). | 
**RecurrenceDays** | **List&lt;string&gt;** | Weekly only: the days to repeat on. | [optional] 
**RecurrenceDate** | **int?** | monthly_absolute only: day of the month (must match the start date). | [optional] 
**RecurrenceAction** | **string** | What to do on conflicts. &#x60;overlap_existing&#x60;/&#x60;decline_existing&#x60; need lab admin/instructor rights. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

