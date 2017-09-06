$(document).ready(function() {

    $('#add-expense .input-group.date').datepicker({
        format: 'dd-mm-yyyy',
        weekStart: 1,
        orientation: 'bottom left',
        daysOfWeekHighlighted: '0,6',
        todayHighlight: true
    });

    var $approveForm = $('.js-approve-family')
    $('.js-approve', $approveForm).on('click', function(e) {
        $('.js-user', $approveForm).val($('.js-email').html().trim());
        $('.js-input', $approveForm).val(true);
    });
    $('.js-reject', $approveForm).on('click', function(e) {
        $('.js-user', $approveForm).val($('.js-email').html().trim());
        $('.js-input', $approveForm).val(false);
    });

});
