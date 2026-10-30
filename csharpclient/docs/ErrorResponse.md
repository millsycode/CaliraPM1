# Calira.Api.Model.ErrorResponse
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Error** | **string** | Error code, e.g. &#x60;unauthorised&#x60;, &#x60;resource_authorisation_failure&#x60;, &#x60;resource_not_found&#x60;. | [optional] 
**ErrorDescription** | **string** | Human-readable description of &#x60;error&#x60;. | [optional] 
**Success** | **bool?** |  | [optional] 
**Message** | **string** |  | [optional] 
**Errors** | **List&lt;Object&gt;** | Error details. Validation errors are &#x60;{attribute, message}&#x60; objects; other errors are plain strings. | [optional] 
**ErrorMessages** | **Object** | Human-readable error message(s): a string or an array of strings. | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

