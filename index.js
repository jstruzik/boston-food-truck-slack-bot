schedule = require('node-schedule');
request = require('request');

location_url = 'http://bostonfeed.me/backend/getLocation.php';
truck_url = 'http://bostonfeed.me/backend/getTruck.php';
slack_url = process.env.SLACK_URL;
valid_locations = ['dewey', 'greenway-dewey-congress'];

function sendFoodTruckList() {
	request(truck_url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			truck_info = JSON.parse(body);

			var found_trucks = [];
			var current_date = new Date();
			var current_day = current_date.getDay();

			request(location_url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					body = JSON.parse(body);
					truck_arr = Object.keys(body).map(function(k) { return body[k] });

					for (var i = 0; i < truck_arr.length; i++) {
						truck = truck_arr[i];
						days = truck.day.split(',');

						if (days.indexOf(current_day.toString()) > -1) {
							for (var j = 0; j < valid_locations.length; j++) {
								if (truck.location_id === valid_locations[j]) {
									truck = mapTruck(truck_info, truck);

									if (!(truck.location in found_trucks)) {
										found_trucks[truck.location] = [truck];
									} else {
										found_trucks[truck.location].push(truck);
									}
								}
							}
						}
					}
				}


				sendSlackReponse(found_trucks);
			});
		}
	});
}

function mapTruck(truck_info, found_truck) {
	for (var i = 0; i < truck_info.length; i++) {
		if (truck_info[i].route_name === found_truck.truck_route) {
			found_truck.name_url = 'https://twitter.com/' + truck_info[i].twitter;
			found_truck.yelp_rating_emoji = parseYelpRating(truck_info[i].yelp_rating);
			found_truck.type_emoji = parseType(truck_info[i].type_name);
		}
	}

	return found_truck;
}

function parseYelpRating(rating) {
	var rating_int = parseInt(rating);
	var rating_str = ':star:';

	for (var i = 0; i < rating_int - 1; i++) {
		rating_str = rating_str + ':star:';
	}

	return rating_str;
}

function parseType(type) {
	return type;
}

function sendSlackReponse(found_trucks) {
	var slack_message = buildSlackMessage(found_trucks);

	console.log(slack_message);

	request.post({url: slack_url, body: slack_message}, function (error, response, body) {
		console.log(body);
	});
}

function buildSlackMessage(found_trucks) {
	var text = '';

	for (var location in found_trucks) {
		text = text + '*' + location + '*' + '\n';
		trucks_arr = found_trucks[location];
		for (var i = 0; i < trucks_arr.length; i++) {
			truck = trucks_arr[i];
			text = text + '> *' + truck.truck_name + ':* ' + truck.name_url + ' ' + truck.yelp_rating_emoji + '\n'
		}
	}

	var json_obj = {
		username: 'FoodTruckBot',
		icon_emoji: ':truck:',
		text: text
	}

	return JSON.stringify(json_obj);
}


schedule.scheduleJob('00 17 * * 1-5', function(){
	sendFoodTruckList();
});