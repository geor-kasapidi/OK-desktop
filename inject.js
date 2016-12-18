setTimeout(function() {
	var browserNotifications = require("OK/messages/BrowserNotifications");
	browserNotifications.show = function() {};

	var pushController = require("OK/messages/MessagesPushController");

	pushController._setNewContent_orig = pushController.setNewContent;

	pushController.setNewContent = function (content) {
		var _content = content.substring(0);

		this._setNewContent_orig(content);

		var obj = OK.util.parseJSON(_content);

		var unreadCount = obj.unreadCount.conv;
		window.setBadgeValue(unreadCount > 0 ? '' + unreadCount : '');

		var notifications = obj.alerts.notifications;
		if (Array.isArray(notifications)) {
			notifications.forEach(function(n) {
				var notification = new Notification(n.title, {
					body: n.body,
					icon: n.icon
				});

				setTimeout(function() {
					notification.close()
				}, 1000 * 5);
			});
		}
	};
}, 1000 * 2);
