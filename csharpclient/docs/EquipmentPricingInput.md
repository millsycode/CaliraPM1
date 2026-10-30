# Calira.Api.Model.EquipmentPricingInput
## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Pricing** | **bool?** | Whether charging is enabled for this equipment.  Server default: False. | [optional] 
**Currency** | **string** | ISO currency code for all prices on this equipment.  Server default: GBP.  Values: &#x60;GBP&#x60;, &#x60;USD&#x60;, &#x60;EUR&#x60;, &#x60;AED&#x60;, &#x60;AUD&#x60;, &#x60;BRL&#x60;, &#x60;CAD&#x60;, &#x60;CHF&#x60;, &#x60;CLP&#x60;, &#x60;DKK&#x60;, &#x60;HKD&#x60;, &#x60;ILS&#x60;, &#x60;INR&#x60;, &#x60;ISK&#x60;, &#x60;JPY&#x60;, &#x60;NOK&#x60;, &#x60;NZD&#x60;, &#x60;PLN&#x60;, &#x60;RUB&#x60;, &#x60;SEK&#x60;, &#x60;SGD&#x60;, &#x60;TRY&#x60;, &#x60;ZAR&#x60;. | [optional] 
**AvailableInternally** | **bool?** | Whether internal lab users can book at internal rates.  Server default: True. | [optional] 
**ChargingType** | **string** | How the base price is charged.  Server default: perHour.  Values: &#x60;perHour&#x60;, &#x60;perDay&#x60;. | [optional] 
**PurchasePrice** | **decimal?** |  | [optional] 
**CustomAddons** | [**List&lt;EquipmentPricingAddon&gt;**](EquipmentPricingAddon.md) | Optional add-on charges. Alias of &#x60;other_attributes&#x60;. | [optional] 
**OtherAttributes** | [**List&lt;EquipmentPricingAddon&gt;**](EquipmentPricingAddon.md) | Optional add-on charges. Alias of &#x60;custom_addons&#x60;. | [optional] 
**PriceDetails** | [**EquipmentPriceDetails**](EquipmentPriceDetails.md) |  | [optional] 
**AdvancePricing** | [**EquipmentAdvancePricing**](EquipmentAdvancePricing.md) |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)

