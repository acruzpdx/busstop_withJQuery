/*------------------------------------------------------------------*
 * File: 		bus.js
 * Author: 		Agapito Cruz (agapito.cruz@gmail.com)
 * Comments:	This file was written to demonstrate proficiency
 * 				in the Javascript and jQuery and in the use of 
 * 				various techniques and design patterns common
 * 				in web app construction, including use of AJAX,XML,
 * 				and JSON techniques.
 * 				This is one of three files needed to access Trimet
 * 				data. The other three are: index.html and
 * 				bus.css.
 ------------------------------------------------------------------*/

var bus=(function() {

		/*------------------------------------------------------------------*
		 * Function: 	init()
		 * Contents:	Set up the event listeners for the form buttons.
		 * 				Set up the onreadystatechange listeners for both
		 * 				XMLHTTPRequest objects.
		 ------------------------------------------------------------------*/
		function init() {
			// Set up tab (anchor links) event listeners
			$("#arrivals").on("click",function(evt) {
				
				evt.preventDefault();
				$("#arrival_data").empty();
				$("#arrivals-main").removeClass("not_shown").addClass("shown");
				$(this).removeClass("back").addClass("fore");
				
				$("#trip-main").removeClass("shown").addClass("not_shown");
				$("#trip").removeClass("fore").addClass("back");
				
			});

			$("#trip").on("click",function(evt) {
				
				evt.preventDefault();
				$("#trip-data").empty();
				$("#trip-main").removeClass("not_shown").addClass("shown");
				$(this).removeClass(".back").addClass(".fore");
				
				$("#arrivals-main").removeClass("shown").addClass("not_shown");
				$("#arrivals").removeClass("fore").addClass("back");
				
			});

			// Set up form button event listeners
			$("#getTripButton").on("click",function(evt) {
				evt.preventDefault();
				var tripUrl = "http://developer.trimet.org/ws/V1/trips/tripplanner/maxIntineraries/6/format/xml/mode/A/min/T",
			

				fromPlaceStr = "/fromPlace/",
				fromEl=null,
				toPlaceStr = "/toPlace/",
				toEl = null,
				appID = "7B1823A54547CEA231EB6D333",
				t = new Date();

				tStr = "/time/"+encodeURIComponent(t.toLocaleTimeString());
				fromEl = $("#start_address");
				fromPlaceStr=fromPlaceStr+encodeURIComponent($(fromEl).val());
				toEl = $("#end_address");
				toPlaceStr=toPlaceStr+encodeURIComponent($(toEl).val());
				tripUrl = tripUrl+tStr+fromPlaceStr+toPlaceStr+"/appID/"+appID;
				$.ajax({
						type:'GET',
						url:tripUrl,
						success: function(data) {
							processXML(data);
						} 
				});
			});

			$("#tripResetButton").on("click",function(evt) {
				var fromEl,
					toEl;

				evt.preventDefault();
				$("#trip_data").empty();
				fromEl = $("#start_address");
				toEl = $("#end_address");
				fromEl.val("");
				toEl.val("");
			});

			$("#getArrivalsButton").on("click",function(evt) {
				var	stopIDStr = "/locIDs/",
					stopEl=$("#stopID"),
					stop=$(stopEl).val(),
					appID = "7B1823A54547CEA231EB6D333",
					arrivalsUrl ="http://developer.trimet.org/ws/V1/arrivals/json/true";
				stopIDStr=stopIDStr+encodeURIComponent(stop);
				arrivalsUrl = arrivalsUrl+stopIDStr+"/appID/"+appID;

				evt.preventDefault();
				$.ajax({
							type: 'GET',
							url	: arrivalsUrl,
							success: function(data) {
								processJSON(data)
							}
				});
			});

			$("#arrivalsResetButton").on("click",function(evt) {
				var	stopEl=$("#stopID");

				evt.preventDefault();
				$("#arrival_data").empty();
				$(stopEl).val("");
			});

		}

		/*------------------------------------------------------------------*
		 * Function: 	processJSON()
		 * Contents:	Takes the arrivals_xhr responseText and parses out
		 * 				the time and bus data, then adds it to the page 	
		 ------------------------------------------------------------------*/
		function processJSON(jsonObj){
			var arrivalDiv,
				bus,
				i,
				ul,
				ulEl,
				liEl,
				time,
				min,
				hr,
				hrStr,
				minStr,
				ampm,
				jsonObj;

			$("#arrival_data").empty();
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
					$("#arrival_data").append(ul);
			} else {
			$("#arrival_data").text("No upcoming arrivals found for this stop");
			}
		}

		/*------------------------------------------------------------------*
		 * Function: 	processXML()
		 * Contents:	Takes the trip_xhr responseXML and parses out
		 * 				the trip data, then adds it to the page 	
		 ------------------------------------------------------------------*/
		function processXML(xmlData){
			var success,
				itineraries,
				itineraries_length,
				legs,
				legs_length,
				tempEl,
				olEl,
				liEl,
				RouteName,
				i,
				j,
				desc,
				mode,
				toEl,
				fromEl,
				routeEl,
				msg,
				stop,
				startTime,
				timeDistanceEl;


			// Clear the old data
			$("#trip_data").empty();
			success = $(xmlData).find("response").attr("success");
			if ( success ==="true")
			{
				itineraries = $(xmlData).find("itinerary");
				itineraries_length=itineraries.length;
				for (var i = 0; i < itineraries_length; i+=1)
				{
					tempEl = $('<p></p>');
					$(tempEl).text("Plan: " + $(itineraries[i]).attr("id") +" Bus: "+$(itineraries[i]).attr("viaRoute"));
					$("#trip_data").append(tempEl);
					legs= $(itineraries[i]).find("leg");
					legs_length = legs.length;
					olEl = $('<ol></ol>');
					for(j=0; j< legs_length; j+=1) {
						mode = $(legs[j]).attr("mode");
						desc = $(legs[j]).find("to description");
						toEl = $(legs[j]).find("to");
						routeEl = $(legs[j]).find("route");

						liEl = $('<li></li>');
						if ( mode === "Walk") {
								msg	 = "Walk to " + $(desc).text();
								if ((stop = $(toEl).find("stopId").text()) != "" ) {
									msg = msg + " (stop:" + stop + ")";
								}
								$(liEl).text(msg);
						} else if (mode ==="Bus") {
							timeDistanceEl = $(legs[j]).find("time-distance");
							startTime = $(timeDistanceEl).find("startTime").text();
							$(liEl).text("["+startTime+"] " + $(routeEl).find("name").text() +" to " +desc.text());
						} else if (mode==="Light Rail") {
							timeDistanceEl = $(legs[j]).find("time-distance");
							startTime = $(timeDistanceEl).find("startTime").text();
							$(liEl).text("["+startTime+"] " + $(routeEl).find("name").text() +" to " +desc.text());
						} else {
							$(liEl).text("Take " + mode  + " to " +desc.text());
						}
						$(olEl).append(liEl);
					}
					$("#trip_data").append(olEl);
				}	
			} else {
				
					tempEl = $('<p></p>');
					tempEl.text("Trimet has determined that your trip is not possible. Please try a different set of starting and ending addresses.");
					$("#trip_data").append(tempEl);
			}
		}

		//return the bus object interface
		return {
				init:init
		}
	})();

/*------------------------------------------------------------------*
 * Function: 	
 * Contents:	After page loads, initialize the XMLHTTPRequest 
 * 				objects and set up the event listeners for the
 * 				form buttons.
 ------------------------------------------------------------------*/
window.addEventListener("load",function(){

	bus.init();
});
