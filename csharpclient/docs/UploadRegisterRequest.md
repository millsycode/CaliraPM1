# Calira.Api.Model.UploadRegisterRequest
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Filename** | **string** | Original file name including extension. | 
**ContentType** | **string** | MIME type of the file. Must match &#x60;purpose&#x60; restrictions (see &#x60;POST /uploads&#x60;). | 
**ByteSize** | **int?** | File size in bytes. Maximum 10 MB for photos, 25 MB for documents. | 
**Checksum** | **string** | Base64-encoded MD5 digest of the file bytes. | 
**Purpose** | **string** | &#x60;photo&#x60; / &#x60;document&#x60; for equipment, &#x60;booking_note&#x60; for note attachments. | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

