(function($) {

  $(function() {
    var $container = $('.container').recurrence({
    });
    var recurrence = $container.data('plugin_recurrence');
    $container.on('change', function () {
      var obj = recurrence.toObject();
      console.log('obj', obj);
      var rule = recurrence.toRule();
      var text = rule.toText().replace(/^\w/, function(m) {return m.toUpperCase()});
      $('.text').text(text);
      recurrence.fromRule(rule.toString());
    });
  });

})(jQuery);
