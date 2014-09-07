(function($) {

  $(function() {
    var constructArgs = {
      '#recurrence-1': {
      },
      '#recurrence-2': {
        limitSingleDay: true
      }
    };
    Object.keys(constructArgs).forEach(function (selector) {
      var $recurrence = $(selector).recurrence({
        limitSingleDay: true
      });
      var recurrence = $recurrence.data('plugin_recurrence');
      $recurrence.on('change', function () {
        var obj = recurrence.toObject();
        console.log('obj', obj);
        var rule = recurrence.toRule();
        var text = rule.toText().replace(/^\w/, function(m) {return m.toUpperCase()});
        $recurrence.next('.text').text(text);
      });
      $recurrence.trigger('change');
    });
  });

})(jQuery);
