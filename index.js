schedule = require('node-schedule');
request = require('request');
config = require('./config');

// BostonFeed URLs
location_url = 'http://bostonfeed.me/backend/getLocation.php';
truck_url = 'http://bostonfeed.me/backend/getTruck.php';

// Sets up and sends the populated food truck list to Slack.
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
							for (var j = 0; j < config.locations.length; j++) {
								if (truck.location_id === config.locations[j]) {
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

// Maps the truck information with the found location trucks.
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

// Parses the Yelp rating into :star: emojis.
function parseYelpRating(rating) {
	var rating_int = parseInt(rating);
	var rating_str = ':star:';

	for (var i = 0; i < rating_int - 1; i++) {
		rating_str = rating_str + ':star:';
	}

	return rating_str;
}

// Parses the food truck type and returns a message based on it.
function parseType(type) {
	return type;
}

// Sends the Slack message via an incoming webhook.
function sendSlackReponse(found_trucks) {
	var slack_message = buildSlackMessage(found_trucks);

	request.post({url: config.slack_url, body: slack_message}, function (error, response, body) {
		console.log(body);
	});
}

// Builds the Slack message to send.
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
		username: config.slack_bot_name,
		icon_emoji: config.slack_bot_emoji,
		text: text
	}

	return JSON.stringify(json_obj);
}

// Schedule a job every Mon-Fri at 17:00 UTC (12:00PM EST).
schedule.scheduleJob('00 17 * * 1-5', function(){
	sendFoodTruckList();
});
