jQuery(function($) {

  var cardWrapper = $('#cardWrapper'),
  cardForm = $('#cardForm'),
  formError = $('#cardFormError'),
  cardFormBtn = cardForm.find('button');

  if(cardWrapper.length > 0){
    $("input[name=plan]:radio").change(function (e) {
      if(this.value == 'free'){
        cardWrapper.hide();
      } else {
        cardWrapper.show();
      }
    });
    if($("input:radio[name=plan]:checked").val() == 'free'){
      cardWrapper.hide();
    }
  }

  $('#card-num').payment('formatCardNumber');

  var validateDetails = function() {
    // set variables for the expiry date validation, cvc validation and expiry date 'splitter'
    var cardNum = $('#card-num');
    var validateNumber = $.payment.validateCardNumber(cardNum.val());
    if (validateNumber) {
      // if the cvc is valid add the identified class
      cardNum.closest('.form-group').addClass('has-success').removeClass('has-error');
    } else {
      // remove again if the cvc becomes invalid
      cardNum.closest('.form-group').addClass('has-error').removeClass('has-success');
    }

  }
  // this runs the above function every time stuff is entered into the card inputs
  $('.paymentInput').bind('change paste keyup', function() {
    validateDetails();
  });


  cardForm.submit(function(e) {
    e.preventDefault();

    var cardNum,
    cardMonth,
    cardYear,
    cardCVC;

    if(cardForm.find("input:radio[name=plan]:checked").val() != 'free'){
      cardFormBtn.prop('disabled', true);

      cardNum = $('#card-num').val();
      cardMonth = $('#card-month').val();
      cardYear = $('#card-year').val();
      cardCVC = $('#card-cvc').val();

      Stripe.card.createToken({
        number: cardNum,
        exp_month: cardMonth,
        exp_year: cardYear,
        cvc: cardCVC
      }, function(status, response) {
        if (response.error) {
          formError.find('p').text(response.error.message);
          formError.removeClass('hidden');
          cardForm.find('button').prop('disabled', false);
        } else {
          var token = response.id;
          cardForm.append($('<input type="hidden" name="stripeToken" />').val(token));
          cardForm.get(0).submit();
        }

      });

      return false;
    }
  });
});
