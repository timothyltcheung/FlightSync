var numFlights = 1;

 document.addEventListener('DOMContentLoaded', function () {
   document.querySelector('#add_flight').setAttribute("onClick", "addFlight()")
   document.querySelector('#place_submit').setAttribute("onClick", "getPlaces()")
   document.querySelector('#routes_submit').setAttribute("onClick", "getRoutes()")
 });


function getPlaces() {
  // Place ID columns
  const placeVars = [
                      'CityId', 
                      'CountryId', 
                      'CountryName', 
                      'PlaceId', 
                      'PlaceName', 
                      'RegionId'
                    ]
  document.querySelector('#place_ids').innerHTML= '';
  const request = new XMLHttpRequest();
  request.open("POST", "/places", true);
  request.send(document.querySelector('#place').value);

  request.onload = () => {
    // Column headers
    var new_header = document.createElement('tr');
    placeVars.forEach(function(placeVar){
      var new_column = document.createElement('th');
      new_column.innerHTML = placeVar;
      new_header.append(new_column);
    });
    document.querySelector('#place_ids').append(new_header);

    // Fill rows with API return
    var data = JSON.parse(request.responseText);
    data.forEach(function (place) {
      var newRow = document.createElement('tr');
      placeVars.forEach(function (placeVar) {
        var newCell = document.createElement('td');
        newCell.innerHTML = place[placeVar];
        newRow.append(newCell);
      });
      document.querySelector('#place_ids').append(newRow);
    });
  };
};


function getRoutes() {
  // Routes columns
  const route_vars = [
                      'Direct', 
                      'OutboundDate', 
                      'OutboundCarrier', 
                      'OutboundOrigin', 
                      'OutboundDestination',
                      'InboundDate', 
                      'InboundCarrier', 
                      'InboundOrigin', 
                      'InboundDestination',
                      'MinPrice'
                    ];
  document.querySelector('#routes').innerHTML= '';

  // Concatenate all route request inputs
  var inputs = [];
  for (i = 1; i < numFlights+1; i++) {
    if (document.querySelector('#country'+i)) {
      inputs.push({
                    'country': document.querySelector('#country'+i).value,
                    'currency': document.querySelector('#currency'+i).value,
                    'locale': document.querySelector('#locale'+i).value,
                    'originPlace': document.querySelector('#originPlace'+i).value,
                    'destinationPlace': document.querySelector('#destinationPlace'+i).value,
                    'outboundPartialDate': document.querySelector('#outboundPartialDate'+i).value,
                    'inboundPartialDate': document.querySelector('#inboundPartialDate'+i).value
                  });
    }
  };

  const request = new XMLHttpRequest();
  request.open("POST", "/flightsingle", true);
  request.send(JSON.stringify(inputs));

  request.onload = () => {
    var data = JSON.parse(request.responseText);
      // for reach route
      data.forEach(function (routes) {
        // Column headers
        var new_header = document.createElement('tr');
        route_vars.forEach(function(route_var) {
          var new_column = document.createElement('th');
          new_column.innerHTML = route_var;
          new_header.append(new_column);
        });
        document.querySelector('#routes').append(new_header);

        routes.forEach(function (route) {
            // Fill rows with API return
          var newRow = document.createElement('tr');
          route_vars.forEach(function (route_var) {
            var newCell = document.createElement('td');
            newCell.innerHTML = route[route_var];
            newRow.append(newCell);
          });
        document.querySelector('#routes').append(newRow);
        });
    });
  };
};


function addFlight() {
  numFlights++;
  const newFlightButton = document.querySelector('#add_flight');
  const routesSubmitButton = document.querySelector('#routes_submit');
  const inputTypes = [
                      'country',
                      'currency',
                      'locale',
                      'originPlace',
                      'destinationPlace',
                      'outboundPartialDate',
                      'inboundPartialDate'
                    ];
  var newInputDiv = document.createElement('div');
  newInputDiv.id = "flight" + numFlights.toString();

  // create input fields
  inputTypes.forEach(function(item) {
    var newInput = document.createElement('input');
    newInput.type = "text";
    newInput.id = item + numFlights.toString();
    newInput.name = item + numFlights.toString();
    newInput.value = document.querySelector('#'+item+(1).toString()).value;
    newInputDiv.append(newInput);
  });
  document.querySelector('#routes_form').append(newInputDiv);

  // add remove flight button
  var newRemove = document.createElement('button');
  newRemove.innerHTML = 'REMOVE FLIGHT';
  newRemove.id = "remove" + numFlights.toString();
  newRemove.className = 'remove_flight';
  newRemove.setAttribute('onClick', "this.parentNode.remove()");
  newInputDiv.append(newRemove);
  newFlightButton.remove();
  document.querySelector('#routes_form').append(newFlightButton);
};
