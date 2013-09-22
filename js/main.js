var Dashboard = {};
Dashboard.Clock = ( function () {

	function getTime () {
		var currentTime = new Date ( );
		var currentHours = currentTime.getHours ( );
		var currentMinutes = currentTime.getMinutes ( );
		var currentSeconds = currentTime.getSeconds ( );
		// var timeOfDay = ( currentHours < 12 ) ? 'AM' : 'PM';
		currentMinutes = ( currentMinutes < 10 ? '0' : '' ) + currentMinutes;
		currentSeconds = ( currentSeconds < 10 ? '0' : '' ) + currentSeconds;
		currentHours = ( currentHours > 12 ) ? currentHours - 12 : currentHours;
		currentHours = ( currentHours == 0 ) ? 12 : currentHours;
		var currentTimeString = currentHours + ':' + currentMinutes + ':' + currentSeconds;

	 	return currentTimeString;
	}

	return {
		init: function () {
			$('#clock').text(getTime());
			setInterval(function() {$('#clock').text(getTime());}, 1000);
		}
	}

})();

Dashboard.Weather = ( function () {
	var woeid;

	function behaviors () {
		$('div.switch').on('click', 'input[name=unit]' , function (){ 
			var toggle = $('span.slide-button');
			var unit = $(this).val();
			if(toggle.attr('data-unit') != unit) {
				toggle.attr('data-unit', unit);
				localStorage.setItem('unit', unit);
				loadWeather($('#forecast').attr('data-woeid'), unit);
			}
		});

		$('#weather-search').on('submit', function (e) {
			var location = $.trim($('input[name=location]').val());
			if(location != ''){
				searchWeather(location);
			}
			e.preventDefault();
		});
	}

	function setWOEID (location) {
		var url = 'http://query.yahooapis.com/v1/public/yql';

		return $.getJSON(url, {'q': 'select * from geo.places where text="' + location + '"', 'format': 'json'}, function (data) {
			if (data.query.count == 0) {
				woeid = '';
				localStorage.removeItem('woeid');
				var error = 'Sorry, we could not find your location';
				$('#forecast').html('<p>' + error + '</p>').attr('data-woeid','');
				$('#weather').removeClass('loaded').addClass('error');
			} else {
				if (data.query.count > 1) {
					woeid = data.query.results.place[0].woeid;
				} else {
					woeid = data.query.results.place.woeid;
				}
				localStorage.setItem('woeid', woeid);
			}
		});
	}

	/*
	Initialize unit toggle
	*/
	function initUnitToggle (unit) {
		if (unit == 'f') {
			$('#fahrenheit').trigger('click');
		} else {
			$('#celcius').trigger('click');
		}
	}

	function getUnit () {
		var unit = localStorage.getItem('unit');

		if (unit == null) { // unit is not stored in local storage
			unit = $('input[name=unit]:checked').val();
			localStorage.setItem('unit', unit);
		} else { // unit is stored in local storage, initialize unit toggle position
			initUnitToggle(unit);
		}

		return unit;	
	}

	function getImage (code) {
		return 'http://l.yimg.com/a/i/us/nws/weather/gr/' + code + 'd.png';
	}

	function searchWeather(location) {
		$.when(setWOEID(location)).done(function() {
			if(woeid != undefined && woeid != '') {
				loadWeather(woeid, getUnit());
			}
		});
	}

	function loadWeather (woeid, unit) {
		$.simpleWeather({
		    // zipcode: '43035',
		    woeid: woeid,
		    unit: unit,
		    success: function(weather) {
		    	var html;
		        html = '<h2> Weather for ' + weather.city + ', ' + (weather.region == '' ? weather.country : weather.region) + '</h2>';
		        html += '<h3>Today</h3>';
		        html += '<img style="float:left;" width="125px" src="' + weather.image + '">';
		        html += '<p>' + weather.temp + '&deg; ' + weather.units.temp + '<br /><span>' + weather.currently + '</span></p>';
		        // TODO need to use tempAlt to display F and C
		        for (var i = 1; i < weather.forecast.length; i++) {
		        	var code = weather.forecast[i].code;
		        	html += '<h3>' + weather.forecast[i].day + '</h3>';
		        	html += '<img style="float:left;" width="125px" src="'+ getImage(code) + '">';
		        	html += '<p>High: ' + weather.forecast[i].high + '&deg; Low: ' + weather.forecast[i].low + '&deg;' + weather.units.temp + '<br /><span>'+weather.forecast[i].text + '</span></p>';
		        }
		        $('#forecast').html(html).attr('data-woeid', woeid);
		        $('#weather').addClass('loaded').removeClass('error');
		    },
		    error: function(error) {
		        $('#forecast').html('<p>' + error + '</p>').attr('data-woeid', '');
		        $('#weather').addClass('error');
		    }
		});
	}

	function initWeather () {
		var localwoeid = localStorage.getItem('woeid');
		var unit = localStorage.getItem('unit');

		if (localwoeid != null) {
			initUnitToggle(unit);
			loadWeather(localwoeid, unit);
		} 
	}

	return {
		init: function () {
			behaviors();
			initWeather();
		}
	}

})();


(function(){
	Dashboard.Clock.init();
	Dashboard.Weather.init();
})();