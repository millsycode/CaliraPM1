# Calira.Api.Api.UsersApi

All URIs are relative to *https://api.clustermarket.com/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ListEquipmentUsers**](UsersApi.md#listequipmentusers) | **GET** /equipment/{id}/users | List equipment users
[**ListLabUsers**](UsersApi.md#listlabusers) | **GET** /users/{account_id} | List lab users

<a name="listequipmentusers"></a>
# **ListEquipmentUsers**
> EquipmentUsersResponse ListEquipmentUsers (int? id)

List equipment users

Users who have access to a piece of equipment (e.g. to invite to a group booking).

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListEquipmentUsersExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new UsersApi();
            var id = 56;  // int? | Equipment ID

            try
            {
                // List equipment users
                EquipmentUsersResponse result = apiInstance.ListEquipmentUsers(id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling UsersApi.ListEquipmentUsers: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int?**| Equipment ID | 

### Return type

[**EquipmentUsersResponse**](EquipmentUsersResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listlabusers"></a>
# **ListLabUsers**
> List<LabMember> ListLabUsers (int? accountId, int? page = null, int? perPage = null)

List lab users

Members of a lab. The ID is a lab (account) ID, not a user ID.  Paged: use `page` and `per_page` (max 100). Totals are in the `X-Total-Records`, `X-Current-Page` and `X-Per-Page` response headers.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListLabUsersExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new UsersApi();
            var accountId = 56;  // int? | Lab account ID
            var page = 56;  // int? | Page number (1-based, default 1). (optional)  (default to 1)
            var perPage = 56;  // int? | Records per page (1-100, default 100). (optional)  (default to 100)

            try
            {
                // List lab users
                List&lt;LabMember&gt; result = apiInstance.ListLabUsers(accountId, page, perPage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling UsersApi.ListLabUsers: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accountId** | **int?**| Lab account ID | 
 **page** | **int?**| Page number (1-based, default 1). | [optional] [default to 1]
 **perPage** | **int?**| Records per page (1-100, default 100). | [optional] [default to 100]

### Return type

[**List<LabMember>**](LabMember.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
