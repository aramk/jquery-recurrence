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
              var $days = $('<div class="days"></div>');
              var days = plugin.settings.days;
              Object.keys(days).forEach(function(name) {
                var day = days[name];
                var $day = $('<button class="toggle">' + day.label + '</button>');
                $day.click(function() {
                  $day.toggleClass(plugin.settings.buttonActiveClass);
                });
                $em.append($day);
                day.$em = $day;
              });
              $em.append($days);
              return $em;
            },
            toObject: function(mode, plugin) {
              var selectedDays = [],
                  days = plugin.settings.days;
              Object.keys(days).forEach(function(name) {
                if (days[name].$em.hasClass(plugin.settings.buttonActiveClass)) {
                  selectedDays.push(name);
                }
              });
              return {
                weeks: mode.$weeks.val(),
                days: selectedDays
              };
            }
          }
        },
        days: {
          monday: {label: 'M'},
          tuesday: {label: 'T'},
          wednesday: {label: 'W'},
          thursday: {label: 'T'},
          friday: {label: 'F'},
          saturday: {label: 'S'},
          sunday: {label: 'S'}
        },
        buttonActiveClass: 'active',
        weekInputClass: 'week'
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

    toObject: function() {
      if (!this.currentMode) {
        return {};
      }
      var modes = this.settings.modes,
          mode = modes[this.currentMode];
      return mode.toObject.call(this, mode, this);
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
