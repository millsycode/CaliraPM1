# Calira.Api.Api.AccountsApi

All URIs are relative to *https://api.clustermarket.com/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**GetAccount**](AccountsApi.md#getaccount) | **GET** /accounts/{id} | Get account
[**ListAccounts**](AccountsApi.md#listaccounts) | **GET** /accounts | List accounts

<a name="getaccount"></a>
# **GetAccount**
> Account GetAccount (int? id)

Get account

Full details of one account.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class GetAccountExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new AccountsApi();
            var id = 56;  // int? | Account ID

            try
            {
                // Get account
                Account result = apiInstance.GetAccount(id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling AccountsApi.GetAccount: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int?**| Account ID | 

### Return type

[**Account**](Account.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listaccounts"></a>
# **ListAccounts**
> List<AccountSummary> ListAccounts (int? page = null, int? perPage = null)

List accounts

Accounts (organisations, departments, labs) the application can access.  Paged: use `page` and `per_page` (max 100). Totals are in the `X-Total-Records`, `X-Current-Page` and `X-Per-Page` response headers.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListAccountsExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new AccountsApi();
            var page = 56;  // int? | Page number (1-based, default 1). (optional)  (default to 1)
            var perPage = 56;  // int? | Records per page (1-100, default 100). (optional)  (default to 100)

            try
            {
                // List accounts
                List&lt;AccountSummary&gt; result = apiInstance.ListAccounts(page, perPage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling AccountsApi.ListAccounts: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int?**| Page number (1-based, default 1). | [optional] [default to 1]
 **perPage** | **int?**| Records per page (1-100, default 100). | [optional] [default to 100]

### Return type

[**List<AccountSummary>**](AccountSummary.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
