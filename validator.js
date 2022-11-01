function Validator(options) {

    // Lấy div cha của input để selector thẻ span
    function getParent(inputElement, selector) {
        while (inputElement.parentElement) {
            if (inputElement.parentElement.matches(selector)) {
                return inputElement.parentElement;
            }
            else inputElement = inputElement.parentElement;
        }
    }


    // Hàm hiện message khi validate
    function validate(inputElement, errorMessage) {
        var validation = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        if (errorMessage) {
            validation.innerText = errorMessage;
            inputElement.classList.add('invalid');
        }

        return errorMessage;
    }

    // Hàm loại bỏ message validate
    function invalidate(inputElement) {
        var validation = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        validation.innerText = '';
        inputElement.classList.remove('invalid');

    }

    /*------------------- -----------------------------------*/
    // Lấy element Form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        var formData = {};
        // Su kien SUBMIT Form
        formElement.onsubmit = function (e) {
            //1. Ngan can hanh dong submit 
            e.preventDefault();

            var errorCount = 0;
            //2. Validate toàn bộ form khi nhấn submit
            options.rules.forEach(function (rule) {

                switch (formElement.querySelector(rule.selector).type) {
                    case 'checkbox':
                    case 'radio':
                        var inputElement = formElement.querySelector(rule.selector + ':checked');
                        if (!inputElement) {
                            validate(formElement.querySelector(rule.selector), "Chọn trường này");
                            errorCount++;
                        }
                        break;
                    default:
                        var inputElement = formElement.querySelector(rule.selector);
                        var errorMessage = rule.test(inputElement.value);
                        validate(inputElement, errorMessage);

                        // Xác định form đã được validate hết chưa
                        if (validate(inputElement, errorMessage)) errorCount++;

                }

            })

            //3. Lấy data khi form valid
            if (errorCount === 0) {
                var inputLists = formElement.querySelectorAll('[name]');

                // Lây dữ liệu form đưa vào object formData
                Array.from(inputLists).forEach(function (input) {
                    switch (input.type) {
                        case 'checkbox':
                            // Lấy dữ liệu checkbox form
                            if (input.checked) {
                                if (Array.isArray(formData[input.name])) {
                                    formData[input.name].push(input.value)
                                } else {
                                    formData[input.name] = [input.value];
                                }
                            }
                            break;
                        case 'radio':
                            // Lấy dữ liệu radio form
                            if (input.checked) {
                                formData[input.name] = input.value;
                            }
                            break;
                        case 'file':
                            formData[input.name] = input.files;
                            break;
                        default:
                            formData[input.name] = input.value;
                    }
                });

                // Gửi data khi submit
                if (typeof options.getInfoForm === 'function') {
                    options.getInfoForm(formData)
                }
            }
            // } else {
            //     alert('Vui lòng điền đầy đủ thông tin')
            // }
        }
        //----------------------------------------------------------- 
        // Lặp qua từng rule thêm sự kiện vào rule
        options.rules.forEach(function (rule) {
            switch (formElement.querySelector(rule.selector).type) {
                // case này chỉ cần tương tác vào thì xoá message validate
                case 'checkbox':
                case 'radio':
                case 'file':
                    var inputElements = formElement.querySelectorAll(rule.selector);

                    for (var i = 0; i < inputElements.length; i++) {
                        inputElements[i].onclick = function () {
                            invalidate(this)
                        }
                    }
                    break;
                // case mặc định thẻ text, password,...
                default:
                    var inputElement = formElement.querySelector(rule.selector);
                    if (inputElement) {

                        // Xử lý khi blur ra ngoài thẻ input
                        inputElement.onblur = function () {
                            var errorMessage = rule.test(inputElement.value);
                            validate(this, errorMessage);
                        }

                        // Xử lý khi bắt đầu nhập
                        inputElement.oninput = function () {
                            invalidate(this)
                        }
                    }
            }
        })
    }
}

/*----------------------------------------------------*/

// Rule bắt buộc nhập trường này
Validator.isRequired = function (selector, message = 'Vui lòng nhập trường này.') {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message;
        }
    };
}

// Rule xác thực email hợp lệ
Validator.isEmail = function (selector, message = 'Vui lòng nhập đúng email') {
    return {
        selector: selector,
        test: function (value) {
            const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (value === '') return 'Nhập email';
            else return value.match(mailFormat) ? undefined : 'Vui lòng nhập đúng email'
        }
    };
}

// Rule xác thực nhập vào mật khẩu
Validator.isPassword = function (selector, length, message = 'Nhập mật khẩu') {
    return {
        selector: selector,
        test: function (value) {
            if (value === '') return message;
            else return value.length >= length ? undefined : `Sử dụng ${length} ký tự cho mật khẩu `;
        }
    };
}

// Rule xác thực nhập lại đúng giá trị
Validator.isConfirm = function (selector, getPass, message = 'Mật khẩu nhập lại không đúng') {
    return {
        selector: selector,
        test: function (value) {
            if (value === '') return 'Nhập trường này'
            return value == getPass() ? undefined : message;
        }
    };
}

