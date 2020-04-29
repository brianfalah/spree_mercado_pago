var paymentData, frm, displayableForm, ccName,
    docType, docNumber, ccNumber,
    ccCvv, expirationMonth,
    expirationYear, ccInstallments,
    checkoutForm, currentBin;

$(function() {
  paymentData = {
    payment_method_id: "",
    payment_type_id: "",
    issuer: {
      id: "",
      name: ""
    }
  };

  frm = $('.mp-creditcard-form');
  displayableForm = $('.mercadopago-credit-card');
  ccName = displayableForm.find('#mp_cc_name');
  docType = displayableForm.find('#mp_doc_type');
  docNumber = displayableForm.find('#mp_doc_number');
  ccNumber = displayableForm.find('#mp_cc_number');
  ccCvv = displayableForm.find('#mp_cc_cvv');
  expirationMonth = displayableForm.find('#mp_expiration_month');
  expirationYear = displayableForm.find('#mp_expiration_year');
  ccInstallments = displayableForm.find('#mp_cc_installments');

  checkoutForm = $('#checkout_form_payment');
  currentBin = "";

  var hiddenFields = [
    {name: "cardNumber", target: ccNumber},
    {name: "securityCode", target: ccCvv},
    {name: "cardExpirationMonth", target: expirationMonth},
    {name: "cardExpirationYear", target: expirationYear},
    {name: "cardholderName", target: ccName},
    {name: "docType", target: docType},
    {name: "docNumber", target: docNumber}
  ];

  $.each(hiddenFields, function(key, value){
    value.target.on('keyup change', function(){
      $('#' + value.name).val(value.target.val());
    });
  });

  ccNumber.keyup(function() {
    var ccNumberVal = $(this).val().replace(/[ .-]/g, '');

    if(binChanged(ccNumberVal) && ccNumberVal.length >= 6) {
      getInstallments();
    } else if(ccNumberVal.length < 6) {
      cleanInstallmentsOptions(true);
    }
  });

  var binChanged = function(ccNumber){
    var bin = ccNumber.slice(0, 6);

    if(bin === currentBin){
      return false;
    } else {
      currentBin = bin;
      return true;
    }
  };

  var getCftParsed = function(cft){
    cft = cft.replace(/_/g, " ");
    cft = cft.replace("|", " | ");
    return cft
  };

  var displayInstallmentOptions = function(status, response) {

    cleanInstallmentsOptions(false);

    if( status === 200 ) {
      paymentData.payment_method_id = response[0].payment_method_id;
      paymentData.payment_type_id = response[0].payment_type_id;
      paymentData.issuer = { id: response[0].issuer.id, name: response[0].issuer.name };

      $.each(response[0].payer_costs, function(key, plan){
        addOptionsToInstallmentsSelect({
          value: plan.installments,
          text: plan.recommended_message,
          cft: getCftParsed(plan.labels[0]),
          installment_rate:
          plan.installment_rate,
          financed_total: plan.total_amount
        });
      });

      ccInstallments.val("1");
    } else {
      cleanInstallmentsOptions(false);
      addOptionsToInstallmentsSelect({ text: "Hay un problema con el número de tarjeta que ingresaste", value: ""});
    }
  };

  var getInstallments = function() {
    if(currentBin.length >= 6) {
      client.getInstallments( { bin: currentBin, amount: amount }, displayInstallmentOptions )
    }
  };

  var cleanInstallmentsOptions = function(addDefault) {
    ccInstallments.html('');

    if(addDefault) {
      addOptionsToInstallmentsSelect({value: "", text: "Ingresá tu tarjeta de crédito para conocer las cuotas disponibles'"});
    }
  };

  var addOptionsToInstallmentsSelect = function(item) {
    ccInstallments.append($('<option>', {value: item.value, text: item.text}));
  };

  var continueButton = checkoutForm.find('input[type="submit"]');

  var hideMercadoPago = function() {
    $('.mercado-pago').remove();
    continueButton.show();
  };

  var showMercadoPago = function() {
    $('.mercado-pago').remove();
    continueButton.after('<span onclick="generateToken()" class="mercado-pago button ' + continueButton.attr('class') + '">Pagar</span>');
    continueButton.hide()
  };

  var toggleMercadoPago = function(currentPayment){
    if(parseInt(currentPayment) === mpPaymentId) {
      showMercadoPago();
    } else {
      hideMercadoPago();
    }
  };

  toggleMercadoPago($('#payment-method-fields').find('input:checked').val());

  $('div[data-hook="checkout_payment_step"] input[type="radio"]').click(function (e) {
    toggleMercadoPago(e.target.value);
  });
});

var generateToken = function() {

  var _callbackTokenizeCard = function(status, response) {
    checkoutForm.append('<input type="hidden" name="payment_source[' + mpPaymentId + '][token]" value="' + response.id + '" />');
    checkoutForm.append('<input type="hidden" name="payment_source[' + mpPaymentId + '][installments]" value="' + ccInstallments.val() + '" />');
    checkoutForm.append('<input type="hidden" name="payment_source[' + mpPaymentId + '][collected_amount]" value="' + amount + '" />');
    checkoutForm.append('<input type="hidden" name="payment_source[' + mpPaymentId + '][transaction_type]" value="' + paymentData.payment_type_id + '" />');
    checkoutForm.append('<input type="hidden" name="payment_source[' + mpPaymentId + '][card_name]" value="' + paymentData.payment_method_id + '" />');
    checkoutForm.append('<input type="hidden" name="payment_source[' + mpPaymentId + '][doc_type]" value="' + docType.val() + '" />');
    checkoutForm.append('<input type="hidden" name="payment_source[' + mpPaymentId + '][doc_number]" value="' + docNumber.val() + '" />');
    checkoutForm.append('<input type="hidden" name="payment_source[' + mpPaymentId + '][last_four]" value="' + ccNumber.val().slice(-4) + '" />');
    checkoutForm.submit();
  };

  client.createToken( frm.find('.mp-fields'), _callbackTokenizeCard );
};