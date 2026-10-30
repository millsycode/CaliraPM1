# Calira.Api.Api.BookingNotesApi

All URIs are relative to *https://api.clustermarket.com/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateBookingNote**](BookingNotesApi.md#createbookingnote) | **POST** /booking/notes/{id} | Create booking note
[**UpdateBookingNote**](BookingNotesApi.md#updatebookingnote) | **PATCH** /booking/notes/{id} | Update booking note

<a name="createbookingnote"></a>
# **CreateBookingNote**
> BookingNoteResponse CreateBookingNote (BookingNoteRequest body, int? id)

Create booking note

Add a note (optionally with an attached file) to a booking. `id` is the BOOKING ID.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class CreateBookingNoteExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingNotesApi();
            var body = new BookingNoteRequest(); // BookingNoteRequest | 
            var id = 56;  // int? | Booking ID

            try
            {
                // Create booking note
                BookingNoteResponse result = apiInstance.CreateBookingNote(body, id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingNotesApi.CreateBookingNote: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**BookingNoteRequest**](BookingNoteRequest.md)|  | 
 **id** | **int?**| Booking ID | 

### Return type

[**BookingNoteResponse**](BookingNoteResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
<a name="updatebookingnote"></a>
# **UpdateBookingNote**
> BookingNoteResponse UpdateBookingNote (BookingNoteRequest body, int? id)

Update booking note

Change a booking note. `id` is the NOTE ID (booking_note.note_id from create), not the booking ID.

### Example
```csharp
using System;
using System.Diagnostics;
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

namespace Example
{
    public class UpdateBookingNoteExample
    {
        public void main()
        {
            // Configure OAuth2 access token for authorization: oauth
            Configuration.Default.AccessToken = "YOUR_ACCESS_TOKEN";

            var apiInstance = new BookingNotesApi();
            var body = new BookingNoteRequest(); // BookingNoteRequest | 
            var id = 56;  // int? | Note ID

            try
            {
                // Update booking note
                BookingNoteResponse result = apiInstance.UpdateBookingNote(body, id);
                Debug.WriteLine(result);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BookingNotesApi.UpdateBookingNote: " + e.Message );
            }
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | [**BookingNoteRequest**](BookingNoteRequest.md)|  | 
 **id** | **int?**| Note ID | 

### Return type

[**BookingNoteResponse**](BookingNoteResponse.md)

### Authorization

[oauth](../README.md#oauth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
