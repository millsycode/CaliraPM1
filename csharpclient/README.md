# Calira.Api – C# client for the Calira REST API

A .NET client library for the Calira (formerly Clustermarket) REST API, generated with
[swagger-codegen](https://github.com/swagger-api/swagger-codegen) v3 from `calira-openapi.yaml`.

- **Target:** .NET Standard 1.3, so it works with .NET Framework 4.6+ and .NET Core / .NET 5–10.
- **Namespace:** `Calira.Api` (API classes in `Calira.Api.Api`, models in `Calira.Api.Model`,
  login and helpers in `Calira.Api.Client`).
- **Endpoints:** all 26 customer-facing endpoints, split across 9 API classes.

## Folder contents

| Path | What it is |
|---|---|
| `calira-openapi.yaml` | The OpenAPI 3 spec. **This is the source of truth** – edit it and regenerate. |
| `templates/Configuration.mustache` | Template override that fixes a generator bug (see Notes). |
| `src/Calira.Api/` | The generated C# project, plus two hand-written files (below). |
| `src/Calira.Api/Client/CaliraAuth.cs` | Hand-written: OAuth login, token refresh, saving/loading tokens. |
| `src/Calira.Api/Client/CaliraHelpers.cs` | Hand-written: time formatting, upload checksum, uploading file bytes. |
| `src/Calira.Api/bin/Release/netstandard1.3/Calira.Api.dll` | The built DLL (+ `Calira.Api.xml` for IntelliSense). |
| `dist/Calira.Api.1.0.0.nupkg` | NuGet package – the easiest way to reference the library (brings its dependencies). |
| `docs/` | Generated reference pages for every API class and model. |
| `.swagger-codegen-ignore` | Files regeneration must not overwrite (the project file, hand-written files, this README). |

## API classes

| Class | Methods |
|---|---|
| `UserApi` | `GetCurrentUser` |
| `AccountsApi` | `ListAccounts`, `GetAccount` |
| `ProjectsApi` | `ListProjects`, `GetProject` |
| `GroupsApi` | `ListGroups`, `GetGroup` |
| `UsersApi` | `ListLabUsers`, `ListEquipmentUsers` |
| `EquipmentApi` | `ListEquipment`, `GetEquipment`, `CreateEquipment`, `UpdateEquipment`, `ListEquipmentBookings`, `ListEquipmentContactPeople`, `ListBookingAddOns` |
| `BookingsApi` | `ListBookings`, `GetBooking`, `CreateBooking`, `UpdateBooking`, `GetAvailableSlots`, `RespondToBookingInvitation`, `GetCustomFormResponse` |
| `BookingNotesApi` | `CreateBookingNote`, `UpdateBookingNote` |
| `UploadsApi` | `RegisterUpload` |

Every method also has an `...Async` version and a `...WithHttpInfo` version (which returns the status
code and headers, e.g. the `X-Total-Records` paging header).

## Using it

Reference the NuGet package (add `dist` as a local package source) or the project. If you reference the
bare DLL instead, also add the NuGet packages `FubarCoder.RestSharp.Portable.HttpClient` 4.0.7,
`Newtonsoft.Json` 13.0.3 and `JsonSubTypes` 1.2.0.

```csharp
using Calira.Api.Api;
using Calira.Api.Client;
using Calira.Api.Model;

// 1. Log in (first time) -----------------------------------------------------------
var auth = new CaliraAuth(
    clientId:     "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    redirectUri:  "https://app.clustermarket.com/login",
    authorizeUrl: "https://app.clustermarket.com/oauth/authorize",
    tokenUrl:     "https://app.clustermarket.com/oauth/token",
    scopes:       "read_accounts read_bookings read_equipment read_projects read_user read_users write_bookings write_equipment");

if (!auth.LoadTokens("tokens.json"))           // also sets the file new tokens are saved to
{
    Console.WriteLine("Open this URL, approve access, then paste the 'code' value from the address bar:");
    Console.WriteLine(auth.GetAuthorizationUrl());
    await auth.ExchangeCodeAsync(Console.ReadLine().Trim());
}

// 2. Configure the API classes ----------------------------------------------------
var config = new Configuration { BasePath = "https://api.clustermarket.com/v1" };
await auth.ApplyToAsync(config);   // call again before later calls; it refreshes the token when expired

// 3. Call endpoints -----------------------------------------------------------------
var me = new UserApi(config).GetCurrentUser();
var equipment = new EquipmentApi(config).ListEquipment(account: 543, page: 1, perPage: 100);

var start = CaliraHelpers.ToApiTime(DateTime.UtcNow.AddDays(1).Date.AddHours(10));
var created = new BookingsApi(config).CreateBooking(new BookingCreateRequest(
    equipmentId: 18807, startTime: start, endTime: start.AddHours(1)));
Console.WriteLine($"Booking {created.Booking.Id}: {created.Message}");
```

Errors come back as `ApiException`: `ErrorCode` holds the HTTP status and `ErrorContent` holds the response body.

### Uploading a file (equipment photo or booking note attachment)

```csharp
byte[] bytes = File.ReadAllBytes("manual.pdf");
var upload = new UploadsApi(config).RegisterUpload(new UploadRegisterRequest(
    filename: "manual.pdf", contentType: "application/pdf", byteSize: bytes.Length,
    checksum: CaliraHelpers.ComputeChecksum(bytes), purpose: UploadRegisterRequest.PurposeEnum.Bookingnote));
await CaliraHelpers.UploadFileBytesAsync(upload.DirectUpload, bytes);   // step 2: send the bytes

new BookingNotesApi(config).CreateBookingNote(
    new BookingNoteRequest(bookingNote: new BookingNoteInput { NoteText = "See manual", NoteFileSignedId = upload.SignedId }),
    id: created.Booking.Id);   // CreateBookingNote: id = BOOKING id. UpdateBookingNote: id = NOTE id.
```

### Notes and gotchas

- **Models with required fields must be built with the constructor**, e.g.
  `new BookingCreateRequest(equipmentId: ..., startTime: ..., endTime: ...)`. Using an object
  initializer (`new BookingCreateRequest { ... }`) throws, because the required values are checked in the
  constructor. Models without required fields can use either.
- **Times:** pass every `start_time` / `end_time` through `CaliraHelpers.ToApiTime(...)`. The server
  rejects times without a time zone or with more than 3 decimal places, and `GetAvailableSlots`
  only accepts UTC.
- **Only set fields are sent.** Unset (null) properties are left out of the JSON, so `Update...`
  requests change only what you set.
- **Enums are only used on request models.** Response models use plain strings, so a new status value
  from the server won't break deserialisation.
- **Paging:** list methods take `page` / `perPage` (max 100). Use the `...WithHttpInfo` version to read
  the `X-Total-Records` header.

## Rebuilding / regenerating

Prerequisites: JDK 11+ (17 is installed), Maven, .NET SDK 8+.

**1. Build the swagger-codegen CLI** (only needed once, or after updating the swagger-codegen repo):

```bash
cd C:\Users\mills\Documents\Code\swagger\swagger-codegen
mvn clean package -DskipTests
```

**2. Generate the C# code from the spec** (run in this `csharpclient` folder):

```bash
java -jar C:\Users\mills\Documents\Code\swagger\swagger-codegen\modules\swagger-codegen-cli\target\swagger-codegen-cli.jar generate -i calira-openapi.yaml -l csharp -o . -t templates --additional-properties packageName=Calira.Api,packageVersion=1.0.0,targetFramework=v5.0,netCoreProjectFile=true,hideGenerationTimestamp=true
```

| Argument | Meaning |
|---|---|
| `generate` | Generate code (other commands: `langs`, `config-help -l csharp`, `version`). |
| `-i calira-openapi.yaml` | The input OpenAPI spec. |
| `-l csharp` | The C# client generator. |
| `-o .` | Output folder (this folder). |
| `-t templates` | Use templates in `templates/` instead of the built-in ones where present (fixes the timeout bug). |
| `packageName=Calira.Api` | Namespace, assembly and project name. |
| `packageVersion=1.0.0` | Assembly/package version. Raise it when the API changes. |
| `targetFramework=v5.0` | .NET Standard 1.3 (works with .NET Framework 4.6+ and modern .NET). |
| `netCoreProjectFile=true` | SDK-style `.csproj`, so it builds with `dotnet build`. |
| `hideGenerationTimestamp=true` | No timestamps in generated files, so regenerating gives clean diffs. |

**3. Build the DLL and the NuGet package:**

```bash
dotnet build src\Calira.Api\Calira.Api.csproj -c Release
```

```bash
dotnet pack src\Calira.Api\Calira.Api.csproj -c Release -o dist
```

**Notes on regenerating:**
- **Kept files:** the files in `.swagger-codegen-ignore` (`Calira.Api.csproj`, `CaliraAuth.cs`, `CaliraHelpers.cs`,
  this README) are never overwritten. If you change `packageVersion`, update `<Version>` in the `.csproj` by hand.
- **Removed models stay behind:** if you rename or remove a schema in the spec, the old model file isn't deleted. Remove it yourself.
- **The template fix:** `templates/Configuration.mustache` is the built-in template with one line changed. As generated,
  every call fails with "value ('00:00:00') must be greater than '00:00:00'", because the HTTP timeout
  is read back as 0.
