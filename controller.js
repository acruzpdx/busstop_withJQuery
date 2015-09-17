var controller = (function() {
    //---------------- Constants ----------------
    var HTTP_OK = 200;
    var RESPONSE_READY = 4;
    var ARRIVALS_URL =
        "http://developer.trimet.org/ws/V1/arrivals/json/true/locIDs/";
    var TRIP_URL =
        "http://developer.trimet.org/ws/V1/trips/tripplanner/maxIntineraries" +
        "/6/format/xml/mode/A/min/T";
    var APP_ID = "7B1823A54547CEA231EB6D333";

    //---------------- Variables ----------------
    var myView = null;

    //-------------- Public Methods -------------
    function setView(v) {
        if (v != null) {
            myView = v;
        }
    }
    function requestTripData(time, from, to) {
        var fullTripUrl = "";

        fullTripUrl = TRIP_URL +
            "/time/" + encodeURIComponent(time) + 
            "/fromPlace/" + encodeURIComponent(from) +
            "/toPlace/" + encodeURIComponent(to) +
            "/appId/" + APP_ID;
            $.ajax({
                        type: 'GET',
                        url	: fullTripUrl,
                        success: function(data) {
                            myView.updateWithXMLData(data);
                        }
            });
    }
    function requestArrivalsData(stopIDString) {
        var fullArrivalsURL = "";

        // Build the URL to send to server
        fullArrivalsURL = ARRIVALS_URL + encodeURIComponent(stopIDString) + 
            "/appID/" + APP_ID; 
        // Make request
				$.ajax({
							type: 'GET',
							url	: fullArrivalsURL,
							success: function(data) {
                                myView.updateWithJSONData(data);
							}
				});
    }

    // Expose Public methods
    return {
        setView : setView,
        requestArrivalsData : requestArrivalsData,
        requestTripData : requestTripData
    }
})();

