;
(function($, window, document, undefined) {

  var pluginName = 'recurrence',
      defaults = {
        modes: {
          weekly: {
            label: 'Weekly',
            init: function(mode, plugin) {
              var $em = $('<div class="' + mode.name + '"></div>');
              var $inputs = $('<div class="' + plugin.settings.weekInputClass + '"></div>');
              $em.append($inputs);
              $inputs.append('<span>Every </span>');
              var $weeks = mode.$weeks = $('<input type="text" />').val(1);
              $inputs.append($weeks);
              $inputs.append('<span> weeks(s) on:</span>');
              var $daysBox = $('<div class="days"></div>');
              var onChange = function() {
                plugin._triggerChange();
              };
              var lastValue = $weeks.val();
              var inputOnChange = function(e) {
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
              $weeks.on('keyup', function() {
                clearInterval(changeHandle);
                changeHandle = setTimeout(inputOnChange, plugin.settings.changeDelay);
              });
              plugin.settings._eachDay(function(name, day) {
                var $day = $('<button type="button" class="toggle">' + day.label + '</button>');
                $day.click(function() {
                  var selectedDays = mode.getSelectedDays(mode, plugin);
                  var newDays = _.without(selectedDays, name);
                  if (newDays.length == selectedDays.length) {
                    newDays.push(name);
                  }
                  // If new selection exceeds limit, remove first selection.
                  var maxDays = plugin.settings.maxDays;
                  if (newDays.length > maxDays) {
                    newDays.shift();
                  }
                  mode.setSelectedDays(mode, plugin, newDays);
                  onChange();
                });
                $em.append($day);
                day.$em = $day;
              });
              $em.append($daysBox);
              return $em;
            },
            getSelectedDays: function(mode, plugin) {
              var selectedDays = [];
              plugin.settings._eachDay(function(name, day) {
                if (day.$em.hasClass(plugin.settings.buttonActiveClass)) {
                  selectedDays.push(name);
                }
              });
              return selectedDays;
            },
            setSelectedDays: function(mode, plugin, selectedDays) {
              if (!mode.isValidDays(selectedDays, plugin)) {
                throw new Error('Invalid days set: [' + selectedDays + ']');
              }
              plugin.settings._eachDay(function(name, day) {
                day.$em.toggleClass(plugin.settings.buttonActiveClass,
                        selectedDays.indexOf(name) >= 0);
              });
            },
            toObject: function(mode, plugin) {
              return {
                weeks: parseInt(mode.$weeks.val()),
                days: mode.getSelectedDays(mode, plugin)
              };
            },
            toRule: function(mode, plugin) {
              var obj = mode.toObject(mode, plugin);
              return new RRule({
                freq: RRule.WEEKLY,
                interval: obj.weeks,
                byweekday: obj.days.map(function(day) {
                  return plugin.settings.days[day].rule;
                })
              });
            },
            fromRule: function(mode, plugin, rule) {
              var options = rule.options;
              mode.$weeks.val(options.interval);
              var selectedDays = [];
              plugin.settings._eachDay(function(name, day) {
                if (options.byweekday.indexOf(day.rule.weekday) >= 0) {
                  selectedDays.push(name);
                }
              });
              mode.setSelectedDays(mode, plugin, selectedDays);
            },
            isRule(rule) {
              return rule.options.freq === RRule.WEEKLY;
            },
            isValidDays: function(days, plugin) {
              var minDays = plugin.settings.minDays;
              var maxDays = plugin.settings.maxDays;
              return !(typeof minDays === 'number' && days.length < minDays ||
                  typeof maxDays === 'number' && days.length > maxDays);
            }
          },


          monthly: {
            label: 'Monthly',
            init: function(mode, plugin) {
              var $em = $('<div class="' + mode.name + '"></div>');
              var $inputs = $('<div class="' + plugin.settings.monthInputClass + '"></div>');
              $em.append($inputs);
              $inputs.append('<span>Every </span>');
              var $months = mode.$months = $('<input type="text" />').val(1);
              $inputs.append($months);
              $inputs.append('<span> months(s) on:</span>');
              var onChange = function() {
                plugin._triggerChange();
              };
              var lastValue = $months.val();
              var inputOnChange = function(e) {
                var value = $months.val();
                value = value.replace(/[^\d]/g, '');
                $months.val(value);
                if (lastValue !== value) {
                  onChange();
                }
                lastValue = value;
                // Prevent change event from bubbling since we handle that manually in onChange.
                e && e.stopPropagation();
              };
              var changeHandle;
              $months.on('change', inputOnChange);
              $months.on('keyup', function() {
                clearInterval(changeHandle);
                changeHandle = setTimeout(inputOnChange, plugin.settings.changeDelay);
              });
              return $em;
            },
            toObject: function(mode, plugin) {
              return {
                months: parseInt(mode.$months.val()),
              };
            },
            toRule: function(mode, plugin) {
              var obj = mode.toObject(mode, plugin);
              return new RRule({
                freq: RRule.MONTHLY,
                interval: obj.months,
              });
            },
            fromRule: function(mode, plugin, rule) {
              var options = rule.options;
              mode.$months.val(options.interval);
            },
            isRule(rule) {
              return rule.options.freq === RRule.MONTHLY;
            },
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
        _eachDay: function(callback, scope) {
          return Object.keys(this.days).forEach(function(name) {
            callback.call(scope, name, this.days[name]);
          }, this);
        },
        buttonActiveClass: 'active',
        weekInputClass: 'week',
        monthInputClass: 'month',
        changeDelay: 200,
        minDays: 1
      };

  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend(true, {}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.currentMode = null;
    this.init();
  }

  Plugin.prototype = {

    init: function() {
      var $em = $(this.element).addClass(pluginName);
      var $freqSelect = this.$freqSelect = $('<select class="mode"></select>');
      $em.append($freqSelect);

      var $body = $('<div class="modes"></div>');
      $em.append($body);
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
      // Ensure initial state is consistent.
      var rule = this.toRule();
      this.fromRule(rule.toString());
    },

    hideAll: function() {
      var modes = this.settings.modes;
      Object.keys(modes).forEach(function(name) {
        var mode = modes[name];
        mode.$em.hide();
      });
    },

    _delegateToMode: function(method) {
      if (!this.currentMode) {
        return {};
      }
      var modes = this.settings.modes,
          mode = modes[this.currentMode];
      var args = [mode, this];
      // Clone remaining args and pass to the method.
      var _args = Array.prototype.slice.call(arguments, 1);
      args = args.concat(_args);
      return mode[method].apply(this, args);
    },

    toObject: function() {
      return this._delegateToMode('toObject');
    },

    toRule: function() {
      return this._delegateToMode('toRule');
    },

    fromRule: function(arg) {
      var rule = typeof arg === 'string' ? new RRule(RRule.parseString(arg)) : arg;
      if (!(rule instanceof RRule)) {
        throw new Error('Invalid argument - must be a string or RRule object: ' + arg);
      }
      for (var modeKey in this.settings.modes) {
        var mode = this.settings.modes[modeKey];
        if (mode.isRule(rule)) {
          this.currentMode = modeKey;
          continue;
        }
      }
      // TODO(aramk) Select the current mode based on the "freq" option of the rule.
      this._delegateToMode('fromRule', rule);
      this.$freqSelect.val(this.currentMode).trigger('change');
      this._triggerChange();
    },

    _triggerChange: function() {
      $(this.element).trigger('change');
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
