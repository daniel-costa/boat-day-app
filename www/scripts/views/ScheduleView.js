define([
'views/BaseView',
'text!templates/ScheduleTemplate.html'
], function(BaseView, ScheduleTemplate){
	var ScheduleView = BaseView.extend({

		className: 'screen-schedule',

		template: _.template(ScheduleTemplate),

		events: {},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			return this;
		}

	});
	return ScheduleView;
});