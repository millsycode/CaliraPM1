# Calira.Api.Api.ProjectsApi

All URIs are relative to *https://api.clustermarket.com/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetProject**](ProjectsApi.md#getproject) | **GET** /accounts/{account_id}/projects/{id} | Get project
[**ListProjects**](ProjectsApi.md#listprojects) | **GET** /accounts/{account_id}/projects | List projects

<a name="getproject"></a>
# **GetProject**
> Project GetProject (int? accountId, int? id)

Get project

One project with its funding codes and users.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class GetProjectExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new ProjectsApi();
            var accountId = 56;  // int? | Lab account ID
            var id = 56;  // int? | Project ID

            try
            {
                // Get project
                Project result = apiInstance.GetProject(accountId, id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling ProjectsApi.GetProject: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accountId** | **int?**| Lab account ID | 
 **id** | **int?**| Project ID | 

### Return type

[**Project**](Project.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listprojects"></a>
# **ListProjects**
> List<ProjectSummary> ListProjects (int? accountId, int? page = null, int? perPage = null)

List projects

Projects in a lab.  Paged: use `page` and `per_page` (max 100). Totals are in the `X-Total-Records`, `X-Current-Page` and `X-Per-Page` response headers.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListProjectsExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new ProjectsApi();
            var accountId = 56;  // int? | Lab account ID
            var page = 56;  // int? | Page number (1-based, default 1). (optional)  (default to 1)
            var perPage = 56;  // int? | Records per page (1-100, default 100). (optional)  (default to 100)

            try
            {
                // List projects
                List&lt;ProjectSummary&gt; result = apiInstance.ListProjects(accountId, page, perPage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling ProjectsApi.ListProjects: " + e.Message );
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

[**List<ProjectSummary>**](ProjectSummary.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
