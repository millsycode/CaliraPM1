# Calira.Api.Model.UploadDirectUploadTarget
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Url** | **string** | Pre-signed URL for step B. Send &#x60;PUT&#x60; with raw file bytes to this URL. **Short-lived** — typically expires within 5 minutes; register a new upload if it expires before you complete step B. | 
**Headers** | **Dictionary&lt;string, string&gt;** | Headers to send with the PUT of the file bytes to &#x60;url&#x60;. | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

