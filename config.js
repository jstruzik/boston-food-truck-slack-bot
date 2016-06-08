var config = {};

// Truck locations by ID. See: http://bostonfeed.me/backend/getLocation.php
config.locations =  [
	'dewey',
	'greenway-dewey-congress',
	// 'financial-pearl-franklin',
	// 'greenway-roweswharf',
	// 'prudential',
	// 'clarendon-trinity',
	// 'bostoncommon',
	// 'stuart-trinity',
	// 'bu-east',
	// 'mgh',
	// 'watertown-arsenal',
	// 'constantcontact',
	// 'seaport-wormwood',
	// 'fenway-landmark',
	// 'dewey',
	// 'harvard-science',
	// 'cityhallplaza',
	// 'innovationdistrict',
	// 'bostonpubliclibrary',
	// 'chinatown-gate',
	// 'bmc',
	// 'watertown-athena',
	// 'longwood',
	// 'alewife-vecna',
	// 'lexington',
	// 'burlington',
	// 'greenway-carouse',
	// 'watertown-arsenal',
	// 'clarendon-trinity',
];

// The incoming Slack webhook URL.
config.slack_url = process.env.SLACK_URL || 'https://slack_webhook_url_goes_here';

config.slack_bot_name = 'FoodTruckBot';
config.slack_bot_emoji = ':truck:';

module.exports = config;