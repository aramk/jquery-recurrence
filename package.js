Package.describe({
  name: 'aramk:jquery-recurrence',
  summary: 'A jQuery widget for specifying event recurrences in scheduling systems.',
  version: '0.1.0',
  git: 'https://github.com/aramk/jquery-recurrence',
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@0.9.0');
  api.use(['jquery', 'underscore'], 'client');
  api.use('aramk:rrule@2.1.0', 'client');
  api.add_files(['jquery.recurrence.js', 'jquery.recurrence.less'], 'client');
});
