// eslint-disable-next-line @typescript-eslint/no-var-requires
const PayLogo = require('../../../assets/images/pay-logo.jpg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const VisaLogo = require('../../../assets/images/visa-logo.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MCLogo = require('../../../assets/images/mc-logo.png');

import { createDiv } from '../../../helpers/createHTMLElements';
import { InputPatterns } from '../../../helpers/constants';
import { CardDateFormatter, ccFormat } from '../../../helpers/formatters';

export class ModalWindow {
    private errorsTexts: Set<string> = new Set();
    private fields: HTMLDivElement[] = [];

    public createModalWindow() {
        const modalWrapper = createDiv('modal-wrapper');
        const modalWindow = createDiv('modal');
        const modalContent = this.createModalWindowContent();
        modalWindow.append(modalContent);
        modalWrapper.append(modalWindow);
        modalWrapper.addEventListener('click', (e) => {
            if (!e.composedPath().includes(modalContent)) {
                modalWrapper.remove();
            }
        });
        return modalWrapper;
    }

    private createModalWindowContent() {
        const content = createDiv('modal-content');
        const modalContentWrapper = createDiv('modal-content-wrapper');
        const modalForm = document.createElement('form');

        const personDetailsBlock = this.createPersonDetails();
        const cardDetailsBlock = this.createCardDetails();

        const formButton = document.createElement('button');
        formButton.innerText = 'CONFIRM';
        formButton.type = 'submit';
        formButton.addEventListener('click', () => {
            for (const field of this.fields) {
                const input = field.getElementsByTagName('input');
                const currentField = input[0];
                const isErrorExist: HTMLElement | null = field.querySelector('.error-message');

                if (!currentField.value) {
                    const errorMessage = this.createErrorMessage('error-message');
                    currentField.setCustomValidity('');
                    if (!currentField.validity.valid && !isErrorExist) {
                        field.append(errorMessage);
                    } else {
                        console.log('In SUBMIT');
                        const errorMessages = field.querySelectorAll('.error-message');
                        errorMessages.forEach((error) => {
                            error.remove();
                        });
                    }
                }
            }
        });

        modalForm.append(personDetailsBlock, cardDetailsBlock, formButton);
        modalContentWrapper.append(modalForm);
        content.append(modalContentWrapper);

        return content;
    }

    private createPersonDetails() {
        const person = createDiv('person-details');
        const title = document.createElement('h2');
        title.innerText = 'Personal details ';

        const nameInput = this.createInputBlock('person-name', 'Name', InputPatterns.Name);
        const phoneInput = this.createInputBlock('phone-number', 'Phone number', InputPatterns.PhoneNumber);
        const addressInput = this.createInputBlock('address', 'Delivery address', InputPatterns.Address, 'text');
        const emailInput = this.createInputBlock('email', 'E-mail', InputPatterns.Email, 'email');

        this.fields.push(nameInput, phoneInput, addressInput, emailInput);
        person.append(title, ...this.fields);

        return person;
    }

    private createCardDetails() {
        const payCard = createDiv('card-details');
        const payCardTitle = document.createElement('h2');
        payCardTitle.innerText = 'Credit card details';

        const cardData = createDiv('card-data');
        const cardNumber = this.createCardNumberField();

        const cardOther = createDiv('other-data');
        const cardTerm = this.createValidThruField();
        const cardCVV = this.createCVVField();

        cardOther.append(cardTerm, cardCVV);
        cardData.append(cardNumber, cardOther);
        payCard.append(payCardTitle, cardData);

        return payCard;
    }

    private createCardNumberField() {
        const cardNumber = createDiv('card-number');

        const cardNumberImg = document.createElement('img');
        cardNumberImg.src = PayLogo;
        cardNumberImg.alt = 'pay-logo';

        const cardNumberInput = this.createInputField('Card number', InputPatterns.CardNumber);
        cardNumberInput.addEventListener('input', (e) => {
            const inputEl = e.target as HTMLInputElement;

            if (cardNumberInput.value[0] === '4') {
                cardNumberImg.src = VisaLogo;
            } else if (cardNumberInput.value[0] === '5') {
                cardNumberImg.src = MCLogo;
            } else {
                cardNumberImg.src = PayLogo;
            }

            const number = inputEl.value;
            inputEl.value = ccFormat(number);
        });

        cardNumberInput.addEventListener('blur', () => {
            this.checkValidity(cardNumberInput, 'Card number');
        });

        cardNumber.append(cardNumberImg, cardNumberInput);

        return cardNumber;
    }

    private createCVVField() {
        const cardCVV = createDiv('cvv-data');
        cardCVV.innerText = ' CVV: ';
        const CVVInput = this.createInputField('Code', InputPatterns.CardCvv);
        CVVInput.addEventListener('blur', () => {
            this.checkValidity(CVVInput, 'Card CVV');
        });
        cardCVV.append(CVVInput);
        return cardCVV;
    }

    private createValidThruField() {
        const cardTerm = createDiv('valid-data');
        cardTerm.innerText = ' VALID: ';

        const termInput = this.createInputField('Valid Thru', InputPatterns.CardDate);
        const TERM_INPUT_ERROR_TEXT = 'Card valid thru';
        termInput.addEventListener('input', (e) => {
            const currentDate = (e.target as HTMLInputElement).value;

            CardDateFormatter(e.target as HTMLInputElement);
            // if (this.errorsTexts.has('valid')) {
            //     if (termInput.validity.valid) {
            //         this.errorsTexts.delete(TERM_INPUT_ERROR_TEXT);
            //         this.showCardInfoErrors();
            //     }
            // }

            if (Number(currentDate.slice(0, 2)) > 12) {
                this.errorsTexts.add(TERM_INPUT_ERROR_TEXT);
                this.showCardInfoErrors();
            }
        });
        termInput.addEventListener('blur', () => {
            this.checkValidity(termInput, TERM_INPUT_ERROR_TEXT);
        });
        cardTerm.append(termInput);
        return cardTerm;
    }

    private checkValidity(inputEl: HTMLInputElement, errorText: string) {
        inputEl.setCustomValidity('');
        if (!inputEl.validity.valid) {
            this.errorsTexts.add(errorText);
        } else {
            this.errorsTexts.delete(errorText);
        }
        this.showCardInfoErrors();
    }

    private createErrorCardInfo(errorField: string) {
        const errorString = `${errorField} - error`;

        const errorDiv = createDiv('card-info__error');
        errorDiv.innerText = errorString;

        return errorDiv;
    }

    private showCardInfoErrors() {
        const cardDetailInfoEl = document.querySelector('.card-details');
        let errorBlock: HTMLElement | null = document.querySelector('.card-data__error-wrapper');

        if (errorBlock) {
            errorBlock.innerHTML = '';
        } else {
            errorBlock = createDiv('card-data__error-wrapper');
            cardDetailInfoEl?.append(errorBlock);
        }

        for (const errorText of this.errorsTexts) {
            const errorEl = this.createErrorCardInfo(errorText);
            errorBlock?.append(errorEl);
        }
    }

    private createInputBlock(addedClass: string, inputText: string, inputPattern?: string, inputType?: string) {
        const inputWrapper = createDiv('form-item');
        inputWrapper.classList.add(addedClass);

        const inputField = this.createInputField(inputText, inputPattern, inputType);
        const errorMessage = this.createErrorMessage('error-message');

        inputField.addEventListener('blur', () => {
            inputField.setCustomValidity('');
            this.addErrorToField(inputWrapper, errorMessage);
            // const isErrorExist: HTMLElement | null = inputWrapper.querySelector('.error-message');
            // if (!inputField.validity.valid && !isErrorExist) {
            //     inputWrapper.append(errorMessage);
            // } else {
            //     const errorMessages = inputWrapper.querySelectorAll('.error-message');
            //     errorMessages.forEach((error) => {
            //         error.remove();
            //     });
            // }
        });

        inputWrapper.append(inputField);

        return inputWrapper;
    }

    private addErrorToField(wrapper: HTMLDivElement, error: HTMLDivElement) {
        // const isErrorExist: HTMLElement | null = wrapper.querySelector('.error-message');

        const input = wrapper.getElementsByTagName('input');

        if (!input[0].validity.valid) {
            wrapper.append(error);
        } else {
            // const errorMessages = wrapper.querySelectorAll('.error-message');
            // errorMessages.forEach((error) => {
            // if (JSON.stringify(error) !== JSON.stringify(isErrorExist)) {
            error.remove();
            // }
            // });
        }
    }

    private createInputField(fieldText: string, setPattern?: string, innerType?: string) {
        const inputElement = document.createElement('input');
        if (innerType) {
            inputElement.type = innerType;
        } else {
            inputElement.type = 'text';
        }
        inputElement.placeholder = fieldText;
        inputElement.setAttribute('required', '');
        if (setPattern) {
            inputElement.pattern = setPattern;
        }
        return inputElement;
    }

    private createErrorMessage(messageClass: string, message?: string) {
        const error = createDiv(messageClass);
        if (message) {
            error.innerText = message;
        } else {
            error.innerText = ' error ';
        }
        return error;
    }
}

// валидация (+Trello)
// error card блоки (!)
// как типизировать require
// реализован submit корзины, при этом появляется окно с timeout
