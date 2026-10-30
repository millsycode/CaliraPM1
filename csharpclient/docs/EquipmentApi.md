# Calira.Api.Api.EquipmentApi

All URIs are relative to *https://api.clustermarket.com/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateEquipment**](EquipmentApi.md#createequipment) | **POST** /equipment | Create equipment
[**GetEquipment**](EquipmentApi.md#getequipment) | **GET** /equipment/{id} | Get equipment
[**ListBookingAddOns**](EquipmentApi.md#listbookingaddons) | **GET** /equipment/{id}/booking_add_ons | List booking add-ons
[**ListEquipment**](EquipmentApi.md#listequipment) | **GET** /equipment | List equipment
[**ListEquipmentBookings**](EquipmentApi.md#listequipmentbookings) | **GET** /equipment/{id}/bookings | List equipment bookings
[**ListEquipmentContactPeople**](EquipmentApi.md#listequipmentcontactpeople) | **GET** /equipment/contact_people | List equipment contact people
[**UpdateEquipment**](EquipmentApi.md#updateequipment) | **PATCH** /equipment/{id} | Update equipment

<a name="createequipment"></a>
# **CreateEquipment**
> EquipmentWriteResponse CreateEquipment (EquipmentCreateRequest body)

Create equipment

Create a piece of equipment. Rate limited to 30 requests/minute.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class CreateEquipmentExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new EquipmentApi();
            var body = new EquipmentCreateRequest(); // EquipmentCreateRequest | 

            try
            {
                // Create equipment
                EquipmentWriteResponse result = apiInstance.CreateEquipment(body);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling EquipmentApi.CreateEquipment: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**EquipmentCreateRequest**](EquipmentCreateRequest.md)|  | 

### Return type

[**EquipmentWriteResponse**](EquipmentWriteResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="getequipment"></a>
# **GetEquipment**
> Equipment GetEquipment (int? id)

Get equipment

Full details of one piece of equipment.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class GetEquipmentExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new EquipmentApi();
            var id = 56;  // int? | Equipment ID

            try
            {
                // Get equipment
                Equipment result = apiInstance.GetEquipment(id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling EquipmentApi.GetEquipment: " + e.Message );
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

[**Equipment**](Equipment.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listbookingaddons"></a>
# **ListBookingAddOns**
> BookingAddOnsResponse ListBookingAddOns (int? id)

List booking add-ons

Add-ons (e.g. consumables) the current user can add to a booking on this equipment.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListBookingAddOnsExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new EquipmentApi();
            var id = 56;  // int? | Equipment ID

            try
            {
                // List booking add-ons
                BookingAddOnsResponse result = apiInstance.ListBookingAddOns(id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling EquipmentApi.ListBookingAddOns: " + e.Message );
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

[**BookingAddOnsResponse**](BookingAddOnsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listequipment"></a>
# **ListEquipment**
> List<EquipmentSummary> ListEquipment (int? account = null, bool? excludeParents = null, int? page = null, int? perPage = null)

List equipment

Equipment, optionally only for one lab.  Paged: use `page` and `per_page` (max 100). Totals are in the `X-Total-Records`, `X-Current-Page` and `X-Per-Page` response headers.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListEquipmentExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new EquipmentApi();
            var account = 56;  // int? | Lab account ID (optional) 
            var excludeParents = true;  // bool? | Set to true to leave out parent equipment. (optional) 
            var page = 56;  // int? | Page number (1-based, default 1). (optional)  (default to 1)
            var perPage = 56;  // int? | Records per page (1-100, default 100). (optional)  (default to 100)

            try
            {
                // List equipment
                List&lt;EquipmentSummary&gt; result = apiInstance.ListEquipment(account, excludeParents, page, perPage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling EquipmentApi.ListEquipment: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **account** | **int?**| Lab account ID | [optional] 
 **excludeParents** | **bool?**| Set to true to leave out parent equipment. | [optional] 
 **page** | **int?**| Page number (1-based, default 1). | [optional] [default to 1]
 **perPage** | **int?**| Records per page (1-100, default 100). | [optional] [default to 100]

### Return type

[**List<EquipmentSummary>**](EquipmentSummary.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listequipmentbookings"></a>
# **ListEquipmentBookings**
> List<BookingSummary> ListEquipmentBookings (int? id, int? page = null, int? perPage = null)

List equipment bookings

Bookings on one piece of equipment.  Paged: use `page` and `per_page` (max 100). Totals are in the `X-Total-Records`, `X-Current-Page` and `X-Per-Page` response headers.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListEquipmentBookingsExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new EquipmentApi();
            var id = 56;  // int? | Equipment ID
            var page = 56;  // int? | Page number (1-based, default 1). (optional)  (default to 1)
            var perPage = 56;  // int? | Records per page (1-100, default 100). (optional)  (default to 100)

            try
            {
                // List equipment bookings
                List&lt;BookingSummary&gt; result = apiInstance.ListEquipmentBookings(id, page, perPage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling EquipmentApi.ListEquipmentBookings: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int?**| Equipment ID | 
 **page** | **int?**| Page number (1-based, default 1). | [optional] [default to 1]
 **perPage** | **int?**| Records per page (1-100, default 100). | [optional] [default to 100]

### Return type

[**List<BookingSummary>**](BookingSummary.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listequipmentcontactpeople"></a>
# **ListEquipmentContactPeople**
> ContactPeopleResponse ListEquipmentContactPeople (int? accountId, int? equipmentId = null)

List equipment contact people

Lab admins and instructors who can be set as equipment contacts (use their IDs in `contact_access_role_ids`).

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListEquipmentContactPeopleExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new EquipmentApi();
            var accountId = 56;  // int? | Lab account ID
            var equipmentId = 56;  // int? | Check rights to update this equipment (optional) 

            try
            {
                // List equipment contact people
                ContactPeopleResponse result = apiInstance.ListEquipmentContactPeople(accountId, equipmentId);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling EquipmentApi.ListEquipmentContactPeople: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **accountId** | **int?**| Lab account ID | 
 **equipmentId** | **int?**| Check rights to update this equipment | [optional] 

### Return type

[**ContactPeopleResponse**](ContactPeopleResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="updateequipment"></a>
# **UpdateEquipment**
> EquipmentWriteResponse UpdateEquipment (EquipmentUpdateRequest body, int? id)

Update equipment

Update a piece of equipment. Send only the fields to change. Rate limited to 30 requests/minute.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class UpdateEquipmentExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new EquipmentApi();
            var body = new EquipmentUpdateRequest(); // EquipmentUpdateRequest | 
            var id = 56;  // int? | Equipment ID

            try
            {
                // Update equipment
                EquipmentWriteResponse result = apiInstance.UpdateEquipment(body, id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling EquipmentApi.UpdateEquipment: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**EquipmentUpdateRequest**](EquipmentUpdateRequest.md)|  | 
 **id** | **int?**| Equipment ID | 

### Return type

[**EquipmentWriteResponse**](EquipmentWriteResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
