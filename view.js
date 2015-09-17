var view = (function() {
    //---------------- Variables ----------------
    var myController = null;
    // UI variables - used to communicate with the browser's DOM elements.
    var $arrivalsTab,
        $tripTab,
        $getTripButton,
        $resetTripButton,
        $getArrivalsButton,
        $resetArrivalsButton,
        $arrivalsMain,   // section that contains the arrivals form
        $tripMain,       // section that contains the trip form
        $arrivalsData,    // section that contains arrival data
        $tripData,       // section that contains trip data
        $stopID,
        $startAddress,
        $endAddress;

    // Set up tab (anchor links) event listeners
        $arrivalsTab = $("#arrivals");
        $arrivalsTab.on("click",_arrivalsTabHandler);

        $tripTab = $("#trip");
        $tripTab.on("click",_tripTabHandler);
        
        // Set up form button event listeners
        $getTripButton =  $("#getTripButton");
        $getTripButton.on("click",_getTripButtonHandler);

        $resetTripButton =  $("#tripResetButton");
        $resetTripButton.on("click",_resetTripButtonHandler);

        $getArrivalsButton =  $("#getArrivalsButton");
        $getArrivalsButton.on("click",_getArrivalsButtonHandler);

        $resetArrivalsButton =  $("#arrivalsResetButton");
        $resetArrivalsButton.on("click",_resetArrivalsButtonHandler);

    // Set up for form switching
        $arrivalsMain = $("#arrivals-main");
        $arrivalsData = $("#arrival_data");

        $tripMain = $("#trip-main");
        $tripData = $("#trip_data");

    // Reference to the form input fields
        $stopID = $("#stopID");
        $startAddress = $("#start_address");
        $endAddress = $("#end_address");


    //-------------- Private Methods -------------
    function _arrivalsTabHandler(evt) {
        
        evt.preventDefault();

        $stopID.val("");
        $arrivalsData.empty();
        $arrivalsMain.removeClass("not_shown");
        $arrivalsMain.addClass("shown");
        $arrivalsTab.removeClass("back");
        $arrivalsTab.addClass("fore");
        
        $tripMain.removeClass("shown");
        $tripMain.addClass("not_shown");
        $tripTab.removeClass("fore");
        $tripTab.addClass("back");
    }
    function _tripTabHandler(evt) {
        
        evt.preventDefault();
        $startAddress.val("");
        $endAddress.val("");
        $tripData.empty();
        $tripMain.removeClass("not_shown");
        $tripMain.addClass("shown");
        $tripTab.removeClass("back");
        $tripTab.addClass("fore");
        
        $arrivalsMain.removeClass("shown");
        $arrivalsMain.addClass("not_shown");
        $arrivalsTab.removeClass("fore");
        $arrivalsTab.addClass("back");
    }
    function _getTripButtonHandler(evt) {
        evt.preventDefault();
        var timeString, fromString, toString;
        var now = null;

        if (($startAddress.val() === "") || ($endAddress.val() === "")) {
            return;
        } else {
            // Get the time
            now = new Date();
            timeString = now.toLocaleTimeString();

            // Get the start address
            fromString = $startAddress.val();

            // Get the end address
            toString = $endAddress.val();

            myController.requestTripData(timeString, fromString, toString); 
        }
    }
    function _resetTripButtonHandler(evt) {
        evt.preventDefault();
        $tripData.empty();
        $startAddress.val("");
        $endAddress.val("");
    }
    function _getArrivalsButtonHandler(evt) {
        evt.preventDefault();
        // Get stop entered by User in the Arrivals form
        var stopIDString = $stopID.val();
        if (stopIDString ==="") {
            return;
        } else {
            myController.requestArrivalsData(stopIDString);
        }
    }
    function _resetArrivalsButtonHandler(evt) {
        evt.preventDefault();
        $stopID.val("");
        $arrivalsData.empty();
    }
    //-------------- Public Methods -------------
    function setController(ctrl) {
        if (ctrl != null) {
            myController = ctrl;
        }
    }
    function updateWithJSONData(jsonObj) {
        var $ul, $liEl;
        var bus;

        $arrivalsData.empty();
        bus = jsonObj.resultSet.arrival;
        if (typeof(bus)!= "undefined") {
                ul = $('<ul></ul>');
                for(i=0;i<bus.length;i+=1){
                    liEl = $('<li></li>');
                    //parse the hour and format it
                    hr = parseInt(bus[i].scheduled.slice(11,13));
                    if (hr < 12) {
                        ampm = "AM";
                    } else if (hr>=12) {
                        ampm= "PM";
                    }
                    if (hr==0) {
                        hr=12;
                    } else if (hr>12) {
                        hr = hr-12;
                    }
                    if (hr<10) {
                        hrStr = "0"+hr;
                    } else {
                        hrStr = hr.toString();
                    }
                    //parse the minute and format it
                    min = parseInt(bus[i].scheduled.slice(14,16));
                    if (min<10) {
                        minStr = "0"+min;
                    } else {
                        minStr = min.toString();
                    }
                    //liEl.innerHTML = "["+ hrStr +":"+ minStr+ ampm+ "] " + bus[i].fullSign;
                    $(liEl).text("["+ hrStr +":"+ minStr+ ampm+ "] " + bus[i].fullSign);
                    $(ul).append(liEl);				
                }
                $arrivalsData.append(ul);
        } else {
        $arrivalsData.text("No upcoming arrivals found for this stop");
        }
    }
    function _getXMLNodeValue(el,tag) {
        //returns value of first node of type 'tag' in XML element 'el'
        //basically used when we are sure there is only one node
        var temp;
        temp = el[0].getElementsByTagName(tag);
        if (temp.length != 0) {
                return temp[0].firstChild.nodeValue;
        } else {
            return "";
        }
    }
    function updateWithXMLData(xmlData) {
        // jQuery object variables
        var $xmlObject, $itineraries, $legs, $tempEl,
            $olEl, $liEl;
        // counters
        var i, j;
        // strings
        var desc, mode, toLocation, routeName,
            msg, stop, startTime;


        // Clear the old data
        $tripData.empty();
        $xmlObject = $(xmlData);
        if ( $xmlObject.find("response").attr("success") ==="true")
        {
            $itineraries = $xmlObject.find("itinerary");
            for (var i = 0; i < $itineraries.length; i+=1)
            {
                $tempEl = $('<p></p>');
                $tempEl.text("Plan: " + $itineraries.eq(i).attr("id") +
                    " Bus: " + $itineraries.eq(i).attr("viaRoute"));
                $tripData.append($tempEl);
                $legs= $itineraries.eq(i).find("leg");
                $olEl = $('<ol></ol>');
                for(j=0; j< $legs.length; j+=1) {
                    // Pull out the appropriate string values
                    mode = $legs.eq(j).attr("mode");
                    desc = $legs.eq(j).find("to description").text();
                    toLocation = $legs.eq(j).find("to").text();
                    routeName = $legs.eq(j).find("route").find("name").text();

                    $liEl = $('<li></li>');
                    if ( mode === "Walk") {
                            msg	 = "Walk to " + desc;
                            if (toLocation != "" ) {
                                msg = msg + " (stop:" + toLocation + ")";
                            }
                            $liEl.text(msg);
                    } else if (mode ==="Bus") {
                        startTime = $legs.eq(j).find("time-distance").find("startTime").text();
                        $liEl.text("["+startTime+"] " + routeName +" to " +desc);
                    } else if (mode==="Light Rail") {
                        starttime = $legs.eq(j).find("time-distance").find("startTime").text();
                        $liEl.text("["+startTime+"] " + routeName +" to " + desc);
                    } else {
                        $liEl.text("Take " + mode  + " to " + desc);
                    }
                    $olEl.append($liEl);
                }
                $tripData.append($olEl);
            }	
        } else {
            
                $tempEl = $('<p></p>');
                $tempEl.text("Trimet has determined that your trip is not possible. Please try a different set of starting and ending addresses.");
                $tripData.append($tempEl);
        }


    }

    // Expose Public Methods
    return {
        setController: setController,
        updateWithJSONData: updateWithJSONData,
        updateWithXMLData: updateWithXMLData
    }
})();
