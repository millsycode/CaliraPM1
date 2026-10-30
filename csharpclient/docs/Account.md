# Calira.Api.Model.Account
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **int?** |  | 
**Name** | **string** |  | 
**AccountType** | **string** | Server default: lab.  Values: &#x60;organisation&#x60;, &#x60;department&#x60;, &#x60;lab&#x60;. | 
**Sector** | **string** | Values: &#x60;academia&#x60;, &#x60;industry&#x60;. | [optional] 
**Description** | **string** |  | [optional] 
**Website** | **string** |  | [optional] 
**Timezone** | **string** |  | [optional] 
**Department** | [**IdName**](IdName.md) |  | [optional] 
**Organisation** | [**IdName**](IdName.md) |  | [optional] 
**Labs** | [**List&lt;IdName&gt;**](IdName.md) |  | [optional] 
**Departments** | [**List&lt;IdName&gt;**](IdName.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

