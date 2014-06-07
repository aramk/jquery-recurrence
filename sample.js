(function($) {

  $(function() {
    var $container = $('.container').recurrence({
    });
    var recurrence = $container.data('plugin_recurrence');
    $('button.submit').click(function () {
      var obj = recurrence.toObject();
      console.log('obj', obj);
    });
  });

})(jQuery);
