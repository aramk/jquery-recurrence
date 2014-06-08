;
(function($, window, document, undefined) {

  var pluginName = 'recurrence',
      defaults = {
        modes: {
          weekly: {
            label: 'Weekly',
            init: function(mode, plugin) {
              var $em = $('<div class="' + mode.name + '"></div>');
              var $weeksBox = $('<div class="' + plugin.settings.weekInputClass + '"></div>');
              $em.append($weeksBox);
              $weeksBox.append('<span>Every </span>');
              var $weeks = mode.$weeks = $('<input type="text" />').val(1);
              $weeksBox.append($weeks);
              $weeksBox.append('<span> weeks(s) on:</span>');
              var $daysBox = $('<div class="days"></div>'),
                  days = plugin.settings.days,
                  onChange = function () {
                    $(plugin.element).trigger('change');
                  },
                  lastValue = $weeks.val(),
                  inputOnChange = function (e) {
                    var value = $weeks.val();
                    value = value.replace(/[^\d]/g, '');
                    $weeks.val(value);
                    if (lastValue !== value) {
                      onChange();
                    }
                    lastValue = value;
                    // Prevent change event from bubbling since we handle that manually in onChange.
                    e && e.stopPropagation();
                  };
              var changeHandle;
              $weeks.on('change', inputOnChange);
              $weeks.on('keyup', function () {
                clearInterval(changeHandle);
                changeHandle = setTimeout(inputOnChange, plugin.settings.changeDelay);
              });
              Object.keys(days).forEach(function(name) {
                var day = days[name];
                var $day = $('<button class="toggle">' + day.label + '</button>');
                $day.click(function() {
                  $day.toggleClass(plugin.settings.buttonActiveClass);
                  onChange();
                });
                $em.append($day);
                day.$em = $day;
              });
              $em.append($daysBox);
              return $em;
            },
            getSelectedDays: function (mode, plugin) {
              var selectedDays = [],
                  days = plugin.settings.days;
              Object.keys(days).forEach(function(name) {
                if (days[name].$em.hasClass(plugin.settings.buttonActiveClass)) {
                  selectedDays.push(name);
                }
              });
              return selectedDays;
            },
            toObject: function(mode, plugin) {
              return {
                weeks: parseInt(mode.$weeks.val()),
                days: mode.getSelectedDays(mode, plugin)
              };
            },
            toRule: function (mode, plugin) {
              var obj = mode.toObject(mode, plugin);
              return new RRule({
                freq: RRule.WEEKLY,
                interval: obj.weeks,
                byweekday: obj.days.map(function (day) {
                  return plugin.settings.days[day].rule;
                })
              });
            }
          }
        },
        days: {
          monday: {label: 'M', rule: RRule.MO},
          tuesday: {label: 'T', rule: RRule.TU},
          wednesday: {label: 'W', rule: RRule.WE},
          thursday: {label: 'T', rule: RRule.TH},
          friday: {label: 'F', rule: RRule.FR},
          saturday: {label: 'S', rule: RRule.SA},
          sunday: {label: 'S', rule: RRule.SU}
        },
        buttonActiveClass: 'active',
        weekInputClass: 'week',
        changeDelay: 200
      };

  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.currentMode = null;
    this.init();
  }

  Plugin.prototype = {

    init: function() {
      var $em = $(this.element).addClass(pluginName);
      var $freqBox = $('<div></div>');
      $em.append($freqBox);
      var $freqSelect = $('<select></select>');

      $freqBox.append($freqSelect);

      var $body = $('<div></div>');
      var modes = this.settings.modes;
      Object.keys(modes).forEach(function(name) {
        var mode = modes[name];
        mode.name = name;
        var $mode = mode.init.call(this, mode, this);
        var $option = '<option value="' + name + '">' + mode.label + '</option>';
        $freqSelect.append($option);
        $body.append($mode.hide());
        mode.$em = $mode;
      }, this);
      $freqSelect.on('change', function() {
        var val = $freqSelect.val();
        var mode = modes[val];
        if (!mode) {
          throw new Error('Unknown mode selected: ' + val);
        }
        this.hideAll();
        mode.$em.show();
        this.currentMode = val;
      }.bind(this));
      $freqSelect.trigger('change');

      $em.append($freqBox);
      $em.append($body);
    },

    hideAll: function() {
      var modes = this.settings.modes;
      Object.keys(modes).forEach(function(name) {
        var mode = modes[name];
        mode.$em.hide();
      });
    },

    _delegateToMode: function (method) {
      if (!this.currentMode) {
        return {};
      }
      var modes = this.settings.modes,
          mode = modes[this.currentMode];
      return mode[method].call(this, mode, this);
    },

    toObject: function() {
      return this._delegateToMode('toObject');
    },

    toRule: function () {
      return this._delegateToMode('toRule');
    }

  };

  $.fn[ pluginName ] = function(options) {
    this.each(function() {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
    return this;
  };

})(jQuery, window, document);
