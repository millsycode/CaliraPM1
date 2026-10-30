# Calira.Api.Api.UploadsApi

All URIs are relative to *https://api.clustermarket.com/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**RegisterUpload**](UploadsApi.md#registerupload) | **POST** /uploads | Register upload

<a name="registerupload"></a>
# **RegisterUpload**
> UploadRegisteredResponse RegisterUpload (UploadRegisterRequest body)

Register upload

Step 1 of a file upload: register the file, then PUT its bytes to `direct_upload.url` with `direct_upload.headers`. Use the returned `signed_id` in equipment `photos`/`documents` or a booking note. Rate limited to 30 requests/minute.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class RegisterUploadExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new UploadsApi();
            var body = new UploadRegisterRequest(); // UploadRegisterRequest | 

            try
            {
                // Register upload
                UploadRegisteredResponse result = apiInstance.RegisterUpload(body);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling UploadsApi.RegisterUpload: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**UploadRegisterRequest**](UploadRegisterRequest.md)|  | 

### Return type

[**UploadRegisteredResponse**](UploadRegisteredResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
