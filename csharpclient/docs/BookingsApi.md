# Calira.Api.Api.BookingsApi

All URIs are relative to *https://api.clustermarket.com/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateBooking**](BookingsApi.md#createbooking) | **POST** /bookings | Create booking
[**GetAvailableSlots**](BookingsApi.md#getavailableslots) | **GET** /equipment_available_slots/{equipment_id} | Get available slots
[**GetBooking**](BookingsApi.md#getbooking) | **GET** /bookings/{id} | Get booking
[**GetCustomFormResponse**](BookingsApi.md#getcustomformresponse) | **GET** /custom_form_responses/{id} | Get custom form response
[**ListBookings**](BookingsApi.md#listbookings) | **GET** /bookings | List bookings
[**RespondToBookingInvitation**](BookingsApi.md#respondtobookinginvitation) | **POST** /bookings/{id}/invitation | Respond to booking invitation
[**UpdateBooking**](BookingsApi.md#updatebooking) | **PATCH** /bookings/{id} | Update booking

<a name="createbooking"></a>
# **CreateBooking**
> BookingWriteResponse CreateBooking (BookingCreateRequest body)

Create booking

Book a piece of equipment. Business-rule failures return 403. Rate limited to 30 requests/minute.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class CreateBookingExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingsApi();
            var body = new BookingCreateRequest(); // BookingCreateRequest | 

            try
            {
                // Create booking
                BookingWriteResponse result = apiInstance.CreateBooking(body);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingsApi.CreateBooking: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**BookingCreateRequest**](BookingCreateRequest.md)|  | 

### Return type

[**BookingWriteResponse**](BookingWriteResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="getavailableslots"></a>
# **GetAvailableSlots**
> AvailableSlotsResponse GetAvailableSlots (int? equipmentId, DateTime? startTime, DateTime? endTime)

Get available slots

Free time on a piece of equipment between `start_time` and `end_time`.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class GetAvailableSlotsExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingsApi();
            var equipmentId = 56;  // int? | Equipment ID
            var startTime = 2013-10-20T19:20:30+01:00;  // DateTime? | Start of the search window (ISO 8601).
            var endTime = 2013-10-20T19:20:30+01:00;  // DateTime? | End of the search window (ISO 8601).

            try
            {
                // Get available slots
                AvailableSlotsResponse result = apiInstance.GetAvailableSlots(equipmentId, startTime, endTime);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingsApi.GetAvailableSlots: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **equipmentId** | **int?**| Equipment ID | 
 **startTime** | **DateTime?**| Start of the search window (ISO 8601). | 
 **endTime** | **DateTime?**| End of the search window (ISO 8601). | 

### Return type

[**AvailableSlotsResponse**](AvailableSlotsResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="getbooking"></a>
# **GetBooking**
> Booking GetBooking (int? id)

Get booking

Full details of one booking.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class GetBookingExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingsApi();
            var id = 56;  // int? | Booking ID

            try
            {
                // Get booking
                Booking result = apiInstance.GetBooking(id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingsApi.GetBooking: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int?**| Booking ID | 

### Return type

[**Booking**](Booking.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="getcustomformresponse"></a>
# **GetCustomFormResponse**
> CustomFormResponse GetCustomFormResponse (int? id)

Get custom form response

Answers given on a booking form. IDs are listed in each booking's `custom_form_responses`.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class GetCustomFormResponseExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingsApi();
            var id = 56;  // int? | Custom form response ID

            try
            {
                // Get custom form response
                CustomFormResponse result = apiInstance.GetCustomFormResponse(id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingsApi.GetCustomFormResponse: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **int?**| Custom form response ID | 

### Return type

[**CustomFormResponse**](CustomFormResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="listbookings"></a>
# **ListBookings**
> List<BookingSummary> ListBookings (int? providerAccount = null, int? page = null, int? perPage = null)

List bookings

Bookings the user can see, optionally only for one lab.  Paged: use `page` and `per_page` (max 100). Totals are in the `X-Total-Records`, `X-Current-Page` and `X-Per-Page` response headers.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class ListBookingsExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingsApi();
            var providerAccount = 56;  // int? | Providing lab account ID (optional) 
            var page = 56;  // int? | Page number (1-based, default 1). (optional)  (default to 1)
            var perPage = 56;  // int? | Records per page (1-100, default 100). (optional)  (default to 100)

            try
            {
                // List bookings
                List&lt;BookingSummary&gt; result = apiInstance.ListBookings(providerAccount, page, perPage);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingsApi.ListBookings: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **providerAccount** | **int?**| Providing lab account ID | [optional] 
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
<a name="respondtobookinginvitation"></a>
# **RespondToBookingInvitation**
> BookingInvitationRespondResponse RespondToBookingInvitation (BookingInvitationRespondRequest body, int? id)

Respond to booking invitation

Accept or reject an invitation to a group booking. The token user must be the invitee. Rate limited to 30 requests/minute.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class RespondToBookingInvitationExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingsApi();
            var body = new BookingInvitationRespondRequest(); // BookingInvitationRespondRequest | 
            var id = 56;  // int? | Booking ID

            try
            {
                // Respond to booking invitation
                BookingInvitationRespondResponse result = apiInstance.RespondToBookingInvitation(body, id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingsApi.RespondToBookingInvitation: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**BookingInvitationRespondRequest**](BookingInvitationRespondRequest.md)|  | 
 **id** | **int?**| Booking ID | 

### Return type

[**BookingInvitationRespondResponse**](BookingInvitationRespondResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="updatebooking"></a>
# **UpdateBooking**
> BookingWriteResponse UpdateBooking (BookingUpdateRequest body, int? id)

Update booking

Change a booking. Send only the fields to change. Rate limited to 30 requests/minute.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class UpdateBookingExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingsApi();
            var body = new BookingUpdateRequest(); // BookingUpdateRequest | 
            var id = 56;  // int? | Booking ID

            try
            {
                // Update booking
                BookingWriteResponse result = apiInstance.UpdateBooking(body, id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingsApi.UpdateBooking: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**BookingUpdateRequest**](BookingUpdateRequest.md)|  | 
 **id** | **int?**| Booking ID | 

### Return type

[**BookingWriteResponse**](BookingWriteResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, text/html

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
