var App = function () {
    this.$checkPersonForm  = $('#check-person-form');
    this.$validationModal = $('#validation-error-modal');

    this.accessToSurveyStepsForm = true;
    this.activeTabIndex = 1;
};

App.prototype.init = function () {
    $('.check-person-form-holder').fadeIn('slow');
    this.PerFormDependInit();

    //all forms stop submitting
    $( "form" ).submit(function( event ) {
        event.preventDefault();
    });
};

/**
 *  First Step logic
 */
// person form dependencies init 
App.prototype.PerFormDependInit = function () {
    var form = this.$checkPersonForm,
        self = this;

    form.find('#pharmacist-country').on('change', function (e) {
        var country = $(this).val();
        var addInput = $(this).parent().find('.additional-input-holder');
        self.toggleHiddenClass(addInput, ( country === "Other" ) );
    });
    form.find('#pharmacists-stock-no').on('change', function (e) {
        var addInput = $(this).closest('div.form-group').find('.additional-input-holder');

        self.toggleHiddenClass(addInput, !$(this).is(":checked") );
    });

    form.find('button[type="submit"]').click(function (e) {
        var validStatus = self.formValidate( form );

        if ( validStatus == false )
            return;

        self.checkAccessToSurveyForm();
        form.parent().hide('fast');
        //if this person not for us
        if ( !self.accessToSurveyStepsForm )
        {
            //$('#terminate-modal').modal();
            $('#terminate-message').removeClass('hidden');
            return;
        }
        self.surveyStepsInit();
    });
};

App.prototype.checkAccessToSurveyForm = function () {
    var form = this.$checkPersonForm,
        countryInput            = form.find('#pharmacist-country'),
        expirienceSelect        = form.find('#pharmacist-experience'),
        drugsDistributeCheckbox = form.find('#drugs-distribute-none'),
        familiarRadio           = form.find('input[name=familiar-with-prices]:checked');

    this.accessToSurveyStepsForm =
        !(  countryInput.val()          == 'Other'      ||
            expirienceSelect.val()      == '< 2 years'  ||
            drugsDistributeCheckbox.is(":checked")      ||
            familiarRadio.val()         == 'No' );
};


/**
 *  Second Step logic
 */
App.prototype.surveyStepsInit = function () {
    //var self =this;
    $('.main-survey-holder').fadeIn('fast');
    this.nextStepToggle();
    this.prevNextNavInit();
};

App.prototype.nextStepToggle = function () {
    $('.tab-panel:visible').fadeOut('fast');
    this.navControl();

    //call current step form Dependencies builder
    if (typeof this['step'+this.activeTabIndex+'FormDependInit'] === 'function' )
        this['step'+this.activeTabIndex+'FormDependInit']();
    var $nextTab = $('#tab' + this.activeTabIndex++);
    this.scrollToTop();
    if( $nextTab.length ) {
        $nextTab.fadeIn('normal');
        return;
    }
    this.surveyStepsFinish();
};

App.prototype.step1FormDependInit = function () {
    var $form = $('form#step1'),
        self = this,
        $addQuestion = $form.find('.toggle-by-first-q');

    $form.find('input[name=step1Q1-radio]').on('change', function () {
        //var val = $(':checked', this).val();
        var val = $(this).filter(':checked').val();

        self.toggleHiddenClass($addQuestion, ( val != "There is no public healthcare system/coverage" ) );
    });

    $form.find('button[type="submit"]').click(function (e) {
        self.surveyFormSubmitAction( $form );
    });
};
App.prototype.step2FormDependInit = function () {
    var $form = $('form#step2'),
        self = this,
        $addQuestion = $form.find('.additional-question'),
        targetInputs = [
        'step2Q1-radio',
        'step2Q2-radio',
        'step2Q3-radio'
    ];
    
    $.each(targetInputs, function (index, value) {
        $form.find('input[name='+value+']').on('change', function () {
            questionToggle();
        });
    });

    function questionToggle() {
        $.each(targetInputs, function (index, name) {
            var val = $form.find('input[name='+name+']:checked').val();

            self.toggleHiddenClass( $addQuestion, (val == 'Yes') );
        });
    }

    $.each(
        $form.find('.question-5 input'),
        function (i, el) {
            $(el).inputmask('Regex', { regex: "^[1-9][0-9]?$|^100$" });
        }
    );

    $form.find('button[type="submit"]').click(function (e) {
        self.surveyFormSubmitAction( $form );
    });

};
App.prototype.step3FormDependInit = function () {
    var $form = $('form#step3'),
        self = this;

    $form.find('button[type="submit"]').click(function (e) {
        self.surveyFormSubmitAction( $form );
    });
};
App.prototype.step4FormDependInit = function () {
    var $form = $('form#step4'),
        self = this,
        $addQuestion = $form.find('.additional-question'),
        targetInputs = ['step4Q1-radio', 'step4Q2-radio'];

    $.each(targetInputs, function (index, value) {
        $form.find('input[name='+value+']').on('change', function () {
            questionToggle();
        });
    });

    function questionToggle() {
        $.each(targetInputs, function (index, name) {
            var val = $form.find('input[name='+name+']:checked').val();

            if (typeof val == 'undefined' ) return;

            if (val.indexOf('Yes') !== -1) {
                self.toggleHiddenClass( $addQuestion, true);
                return false;
            }
            self.toggleHiddenClass( $addQuestion, false);
        });
    }

    $form.find('button[type="submit"]').click(function (e) {
        self.surveyFormSubmitAction( $form );
    });
};
App.prototype.step5FormDependInit = function () {
    var $form = $('form#step5'),
        self = this,
        $addQuestion = $form.find('.additional-question');

    $form.find('input[name=step5Q2-radio]').on('change', function () {
        var val = $form.find('input[name=step5Q2-radio]:checked').val();
        self.toggleHiddenClass( $addQuestion, (val == 'Yes'));
    });

    $form.find('button[type="submit"]').click(function (e) {
        self.surveyFormSubmitAction( $form );
    });
};
App.prototype.step6FormDependInit = function () {
    var $form = $('form#step6'),
        firstQ_val,
        mess = '<h3>Please, describe in additional comments - why?</h3>',
        self = this;

    $form.find('input[name=step6Q1-radio]').on('change', function () {
        firstQ_val = $form.find('input[name=step6Q1-radio]:checked').val();
        if (firstQ_val == 'Yes') {
            self.showValidationErrorModal(mess);
        }
    });

    $form.find('button[type="submit"]').click(function (e) {
        var addComm = $form.find('#step6Q1-comments').val();
        if (firstQ_val == 'Yes' && (addComm == '') ) {
            self.showValidationErrorModal(
                '<h3>First question "Additional comments" is empty!</h3><br><p>Please, fix this.</p>'
            );
            return;
        }
        self.surveyFormSubmitAction( $form );
    });
};


App.prototype.surveyFormSubmitAction = function ( form ) {
    var self = this,
        validStatus = self.formValidate( form );

    if ( validStatus == false )
        return;

    self.nextStepToggle();
};

App.prototype.surveyStepsFinish = function () {
    $('.finish-message').removeClass('hidden');
    $('ul.prev-next-nav').addClass('hidden');
    var data = this.getAllData();

    console.log(data);
    $.ajax(
        {
            url: "send.php",
            type: "POST",
            //contentType: "application/json",
            dataType:'json',
            //async: true,
            data: {
                //'data': JSON.stringify(data)
                data: data//JSON.stringify(data)
            }
        }

    )
    .done(function() {
        //alert( "second success" );
    })
    .fail(function() {
        //alert( "error" );
    })
    .always(function() {
        //alert( "finished" );
    });
};
/**
 * fast tabs navigation hardcode (must be changed)!!!
 */
App.prototype.prevNextNavInit = function () {
    var $ul = $("ul.prev-next-nav "),
        self = this,
        activeTab;

    $ul.removeClass('hidden')
        .on('click', 'a', function (e)
        {
            activeTab = $('ul.survey-steps li.active');
            var curEditingTab = $('ul.survey-steps li.editing'),
                targetLi = (curEditingTab.length > 0) ? curEditingTab : activeTab;

            if ($(this).hasClass('prev'))
            {
                var prevTab = targetLi.prev();
                if (prevTab.length > 0)
                {
                    curEditingTab.removeClass('editing');
                    prevTab.toggleClass('editing');
                    $('.tab-panel:visible').hide().prev().fadeIn('fast').find('button').fadeOut();
                }
            }
            else
            {
                var nextTab = targetLi.next();
                if (nextTab.length > 0)
                {
                    if (nextTab.hasClass('done'))
                    {
                        curEditingTab.removeClass('editing');
                        nextTab.toggleClass('editing');
                        $('.tab-panel:visible').hide().next().fadeIn('fast').find('button').fadeOut();
                    }
                    if (nextTab.hasClass('active'))
                    {
                        curEditingTab.removeClass('editing');
                        $('.tab-panel:visible').hide().next().fadeIn('fast');
                    }
                }
            }

            e.preventDefault();
            return false;
        });
};

/**
 * Additional functions
 */
App.prototype.navControl = function () {
    var $activeTab = $('.survey-steps li.active');
    if ( !$activeTab.length ) {
        $('.survey-steps li:first').addClass('active');
        return;
    }

    $activeTab
        .removeClass('active')
        .addClass('done')
        .next()
        .addClass('active');
};

App.prototype.scrollToTop = function () {
    if ( $(window).scrollTop() > 0 )
    {
        setTimeout(function () {
            $("html, body").animate({ scrollTop: 0 }, "slow");
        }, 250)
    }
};

App.prototype.toggleHiddenClass = function ( obj, status ) {
    var target = (obj instanceof jQuery) ? obj : $(obj);
    if ( status ) {
        target.removeClass('hidden');
        return;
    }
    if ( !target.hasClass('hidden') ) target.addClass('hidden');
};

App.prototype.showValidationErrorModal = function ( message ) {
    var modal = this.$validationModal,
        messHold = modal.find('.message-holder');

    messHold
        .html('')
        .html( message );
    modal.modal();
};

App.prototype.formValidate = function (form) {
    var status = true,
        mess = '<h3>Please give an answer to all questions!</h3>',
        notAnswered = [],
        questions = form.find('[class*=question-]:visible');

    console.log('---------Start Validate----------');
    $.each(questions, function (index, question) {
        var qClassSplit = $(question).attr("class").split('question-'),
            questionId;

        questionId = ( qClassSplit.length > 0 ) ? qClassSplit[1].charAt(0) : alert('No class "question-x"');

        console.log('question', questionId);
        var inputs = $(question).find('input,select,textarea');
        if ( !hasAnswerForQuestion(inputs) ){
            notAnswered.push(parseInt(questionId));
        }
    });
    console.log('---------Stop Validate----------');

    form.find('[class*=question-]:visible').removeClass('Not-answered');

    if( notAnswered.length != 0 ) {
        status = false;

        $.each(notAnswered, function (ind, qInd) {
            form.find('.question-'+qInd).addClass('Not-answered');
        });
        this.showValidationErrorModal( mess );
    }
    
    function hasAnswerForQuestion( inputs ) {
        var hasAnswer = false;

        $.each(inputs, function (index, el) {
            // here can return after first success case
            switch (el.type){
                case 'select-one':
                    if ( $(el).val() != "" ) {
                        console.log('--->select-one', $(el).val());
                        hasAnswer = true;
                    }
                    break;
                case 'checkbox':
                    if ( $(el).is(':checked') ) {
                        console.log('--->checkbox:checked', $(el).val());
                        hasAnswer = true;
                    }
                    break;
                case 'radio':
                    if ( $(el).is(':checked') ){
                        console.log('--->radio:checked', $(el).val());
                        hasAnswer = true;
                    }
                    break;
                case 'text':
                    if ( $(el).val() != "" ) {
                        console.log('--->text', $(el).val());
                        hasAnswer = true;
                    }
                    break;
                case 'number':
                    if ( $(el).val() != "" ) {
                        console.log('--->number', $(el).val());
                        hasAnswer = true;
                    }
                    break;
                case 'textarea':
                    if ( $(el).val() != "" ) {
                        console.log('--->textarea', $(el).val());
                        hasAnswer = true;
                    }
                    break;
            }
        });
        //console.log("----hasAnswer =",hasAnswer);
        return hasAnswer;
    }

    return status;
};

App.prototype.getAllData = function () {
    var checkPersonFormQuestions = $('#check-person-form').find('[class*=question-]:not(.hidden)'),
        surveyStepForms = $('.main-survey-holder form'),
        data = {},
        checkPersonData = [],
        surveyStepsData = {};

    // Check person data
    $.each(checkPersonFormQuestions, function( i, q ) {
        checkPersonData.push(parseItem( q ));
    });

    // Survey Step data
    $.each(surveyStepForms, function (i, form) {
        var formData = [];
        $.each( $(form).find('[class*=question-]:not(.hidden)'), function (i, qHolder) {
            formData[i] = parseItem(qHolder);
        });
        surveyStepsData['step-'+(i+1)] = formData;
    });

    data.checkPerson = checkPersonData;
    data.surveySteps = surveyStepsData;

    return data;

    function parseItem( qHolder ) {
        var question = $(qHolder).find('.question').text(),
            inputs = $(qHolder).find('input,select,textarea'),
            answers = [];

        $.each(inputs, function (index, el) {
            switch (el.type){
                case 'select-one':
                    if ( $(el).val() != "" ) {
                        answers.push( buildAnswerItem(el) );
                    }
                    break;
                case 'checkbox':
                    if ( $(el).is(':checked') ) {
                        answers.push( buildAnswerItem(el) );
                    }
                    break;
                case 'radio':
                    if ( $(el).is(':checked') ){
                        answers.push( buildAnswerItem(el) );
                    }
                    break;
                case 'text':
                    if ( $(el).val() != "" ) {
                        answers.push( buildAnswerItem(el) );
                    }
                    break;
                case 'number':
                    if ( $(el).val() != "" ) {
                        answers.push( buildAnswerItem(el) );
                    }
                    break;
                case 'textarea':
                    if ( $(el).val() != "" ) {
                        answers.push( buildAnswerItem(el) );
                    }
                    break;
            }
        });

        function buildAnswerItem( el ) {
            var $el = $(el);
            return {
                type: el.type,
                id: $el.prop('id'),
                value: $(el).val()
            }
        }

        return {
            question: question,
            answers: answers
        }
    }
};