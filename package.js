Package.describe({
  summary: "A jQuery widget for specifying event recurrences in scheduling systems."
});

Package.on_use(function (api) {
  api.add_files('jquery.recurrence.js', 'client');
  api.add_files('jquery.recurrence.less', 'client');
});
