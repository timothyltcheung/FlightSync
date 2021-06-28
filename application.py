import os
import requests
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

headers = {
    'x-rapidapi-host': os.getenv('SKYSCANNER_HOST'),
    'x-rapidapi-key': os.getenv('SKYSCANNER_API_KEY')
    }


def get_place_id(place):
    """Returns place IDs as a list of dicts"""
    url = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/US/USD/en-US/"
    queryString = {"query": place}
    response = requests.request("GET", url, headers=headers, params=queryString)
    placeIDs = (response.json())
    return(placeIDs['Places'])


def browse_routes(country, currency, locale, originPlace, destinationPlace, outboundPartialDate, inboundPartialDate):
    """Returns dict of aggregated flight information"""
    url = r'''https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browseroutes/v1.0/{countryURL}/{currencyURL}/{localeURL}/{originPlaceURL}/{destinationPlaceURL}/{outboundPartialDateURL}/{inboundPartialDateURL}'''.format(countryURL=country, currencyURL=currency, localeURL=locale, originPlaceURL=originPlace, destinationPlaceURL=destinationPlace, outboundPartialDateURL=outboundPartialDate, inboundPartialDateURL=inboundPartialDate)
    response = requests.request("GET", url, headers=headers)
    routes = (response.json())
    return routes


@app.route("/", methods=['GET', 'POST'])
def index():
    return render_template("index.html")


@app.route("/places", methods=['GET', 'POST'])
def places():
    return jsonify(get_place_id(request.data.decode('UTF-8')))


@app.route("/flightsingle", methods=["POST"])
def flightsingle():
    # Trip is defined as one round trip flight
    # There can be multiple quotes returned for each trip (multiple flight options possible)
    tripDict = json.loads(request.data.decode('UTF-8'))
    tripList = []
    carrierDict = {}  # mapping from carrier ID to carrier name, key = ID, value = Carrier
    placeDict = {}  # mapping from place ID to place name, key = ID, value = Place

    for i in range(len(tripDict)):  # iterate for each trip
        quotesPerTrip = []
        routes = browse_routes(tripDict[i]['country'],
					tripDict[i]['currency'],
                    tripDict[i]['locale'],
                    tripDict[i]['originPlace'],
                    tripDict[i]['destinationPlace'],
                    tripDict[i]['outboundPartialDate'],
                    tripDict[i]['inboundPartialDate']
                    )

        for carrier in routes['Carriers']:
            carrierDict[carrier['CarrierId']] = carrier['Name']

        for place in routes['Places']:
            placeDict[place['PlaceId']] = place['Name']

        for quote in routes['Quotes']:
            quoteDict = {}
            quoteDict['QuoteId'] = quote['QuoteId']
            quoteDict['MinPrice'] = quote['MinPrice']
            quoteDict['Direct'] = quote['Direct']
            quoteDict['OutboundCarrier'] = (' '.join([carrierDict[x] for x in quote['OutboundLeg']['CarrierIds']]))
            quoteDict['OutboundOrigin'] = placeDict[quote['OutboundLeg']['OriginId']]
            quoteDict['OutboundDestination'] = placeDict[quote['OutboundLeg']['DestinationId']]
            quoteDict['OutboundDate'] = quote['OutboundLeg']['DepartureDate'][0:10]
            quoteDict['InboundCarrier'] = (' '.join([carrierDict[x] for x in quote['InboundLeg']['CarrierIds']]))
            quoteDict['InboundOrigin'] = placeDict[quote['InboundLeg']['OriginId']]
            quoteDict['InboundDestination'] = placeDict[quote['InboundLeg']['DestinationId']]
            quoteDict['InboundDate'] = quote['InboundLeg']['DepartureDate'][0:10]
            quotesPerTrip.append(quoteDict)
            # Aggregate all the quotes for each trip
        tripList.append(quotesPerTrip)

    # returning a list of dicts where every list is a trip and the dicts within are quotes
    return jsonify(tripList)