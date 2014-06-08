Package.describe({
  summary: "A jQuery widget for specifying event recurrences in scheduling systems."
});

Package.on_use(function (api) {
  api.use('jquery', 'client');
  api.use('rrule', 'client');
  api.add_files(['jquery.recurrence.js', 'jquery.recurrence.less'], 'client');
});
