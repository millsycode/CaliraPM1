# Calira.Api.Api.GroupsApi

All URIs are relative to *https://api.clustermarket.com/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetGroup**](GroupsApi.md#getgroup) | **GET** /groups/{id} | Get group
[**ListGroups**](GroupsApi.md#listgroups) | **GET** /groups | List groups

<a name="getgroup"></a>
# **GetGroup**
> GroupDetails GetGroup (int? id)

Get group

One group with its equipment.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class GetGroupExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new GroupsApi();
            var id = 56;  // int? | Group ID

            try
            {
                // Get group
                GroupDetails result = apiInstance.GetGroup(id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling GroupsApi.GetGroup: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int?**| Group ID | 

### Return type

[**GroupDetails**](GroupDetails.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listgroups"></a>
# **ListGroups**
> List<Group> ListGroups (int? account = null, int? page = null, int? perPage = null)

List groups

User groups, optionally only for one lab.  Paged: use `page` and `per_page` (max 100). Totals are in the `X-Total-Records`, `X-Current-Page` and `X-Per-Page` response headers.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListGroupsExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new GroupsApi();
            var account = 56;  // int? | Lab account ID (optional) 
            var page = 56;  // int? | Page number (1-based, default 1). (optional)  (default to 1)
            var perPage = 56;  // int? | Records per page (1-100, default 100). (optional)  (default to 100)

            try
            {
                // List groups
                List&lt;Group&gt; result = apiInstance.ListGroups(account, page, perPage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling GroupsApi.ListGroups: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **account** | **int?**| Lab account ID | [optional] 
 **page** | **int?**| Page number (1-based, default 1). | [optional] [default to 1]
 **perPage** | **int?**| Records per page (1-100, default 100). | [optional] [default to 100]

### Return type

[**List<Group>**](Group.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
