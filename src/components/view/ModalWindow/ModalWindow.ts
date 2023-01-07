// eslint-disable-next-line @typescript-eslint/no-var-requires
const PayLogo = require('../../../assets/images/pay-logo.jpg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const VisaLogo = require('../../../assets/images/visa-logo.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MCLogo = require('../../../assets/images/mc-logo.png');

import { createDiv } from '../../../helpers/createHTMLElements';
import { InputPatterns } from '../../../helpers/constants';
import { CardDateFormatter, ccFormat } from '../../../helpers/formatters';
import { CardDataFieldsNames, getErrorTextForField } from './modalConstants';

export class ModalWindow {
    private errorsTexts: Set<string> = new Set();
    private fields: HTMLDivElement[] = [];
    private cardDataFields: HTMLDivElement[] = [];

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

        const formButton = this.createConfirmButton();

        modalForm.append(personDetailsBlock, cardDetailsBlock, formButton);
        modalContentWrapper.append(modalForm);
        content.append(modalContentWrapper);

        modalForm.noValidate = true;

        modalForm.addEventListener('submit', (ev) => {
            const hasErrors = this.isCardInfoHasErrors();
            if (!hasErrors) {
                ev.preventDefault();
            }
        });

        return content;
    }

    private createConfirmButton() {
        const formButton = document.createElement('button');
        formButton.innerText = 'CONFIRM';
        formButton.type = 'submit';

        // formButton.addEventListener('click', (ev) => {
        //     const hasErrors = this.isCardInfoHasErrors();
        //     if (!hasErrors) {
        //         document.body.append(this.createSubmitMessage());
        //     }
        // });
        //     // this.checkCardInfos();

        //     for (const field of this.fields) {
        //         const input = field.getElementsByTagName('input');
        //         const currentField = input[0];
        //         const isErrorExist: HTMLElement | null = field.querySelector('.error-message');

        //         if (!currentField.value) {
        //             const errorMessage = this.createErrorMessage('error-message');
        //             currentField.setCustomValidity('');
        //             if (!currentField.validity.valid && !isErrorExist) {
        //                 currentField.setCustomValidity('');
        //                 field.append(errorMessage);
        //             } else if (currentField.validity.valid) {
        //                 const errorMessages = field.querySelectorAll('.error-message');
        //                 errorMessages.forEach((error) => {
        //                     error.remove();
        //                 });
        //             }
        //         }
        //     }
        // });

        return formButton;
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
        const cardNumber = createDiv(CardDataFieldsNames.cardNumber);
        const textError = getErrorTextForField(CardDataFieldsNames.cardNumber);

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
            this.checkValidity(cardNumberInput, textError);
        });

        cardNumber.append(cardNumberImg, cardNumberInput);

        this.cardDataFields.push(cardNumber);

        return cardNumber;
    }

    private createCVVField() {
        const textError = getErrorTextForField(CardDataFieldsNames.cvv);
        const cardCVV = createDiv(CardDataFieldsNames.cvv);
        cardCVV.innerText = ' CVV: ';
        const CVVInput = this.createInputField('Code', InputPatterns.CardCvv);
        CVVInput.addEventListener('input', () => {
            this.checkValidity(CVVInput, textError);
        });
        cardCVV.append(CVVInput);

        this.cardDataFields.push(cardCVV);

        return cardCVV;
    }

    private createValidThruField() {
        const cardTerm = createDiv(CardDataFieldsNames.validThru);
        const textError = getErrorTextForField(CardDataFieldsNames.validThru);
        cardTerm.innerText = ' VALID: ';

        const termInput = this.createInputField('Valid Thru', InputPatterns.CardDate);
        termInput.addEventListener('input', (e) => {
            const currentDate = (e.target as HTMLInputElement).value;

            CardDateFormatter(e.target as HTMLInputElement);

            if (Number(currentDate.slice(0, 2)) > 12) {
                this.errorsTexts.add(textError);
                this.showCardInfoErrors();
            }
        });
        termInput.addEventListener('blur', () => {
            this.checkValidity(termInput, textError);
        });
        cardTerm.append(termInput);

        this.cardDataFields.push(cardTerm);

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
            const errorEl = this.createErrorMessage('error-message', errorText);
            errorBlock?.append(errorEl);
        }
    }

    private createInputBlock(addedClass: string, inputText: string, inputPattern?: string, inputType?: string) {
        const inputWrapper = createDiv('form-item');
        inputWrapper.classList.add(addedClass);

        const inputField = this.createInputField(inputText, inputPattern, inputType);
        const errorMessage = this.createErrorMessage('error-message');

        inputField.addEventListener('input', () => {
            inputField.setCustomValidity('');

            const isErrorExist: HTMLElement | null = inputWrapper.querySelector('.error-message');
            if (!inputField.validity.valid && !isErrorExist) {
                inputWrapper.append(errorMessage);
            } else if (inputField.validity.valid) {
                const errorMessages = inputWrapper.querySelectorAll('.error-message');
                errorMessages.forEach((error) => {
                    error.remove();
                });
            }
        });

        inputWrapper.append(inputField);

        return inputWrapper;
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

    private isCardInfoHasErrors(): boolean {
        const allOk: boolean[] = [];
        const cardDetailInfoEl = document.querySelector('.card-details');
        let errorBlock: HTMLElement | null = document.querySelector('.card-data__error-wrapper');

        if (errorBlock) {
            errorBlock.innerHTML = '';
        } else {
            errorBlock = createDiv('card-data__error-wrapper');
            cardDetailInfoEl?.append(errorBlock);
        }

        this.cardDataFields.forEach((cardInfoField: HTMLDivElement) => {
            const input: HTMLInputElement | null = cardInfoField.getElementsByTagName('input')[0];
            if (input.value === '' || !input.validity.valid) {
                const textError = getErrorTextForField(cardInfoField.className as CardDataFieldsNames);

                const errorEl = this.createErrorMessage('error-message', textError);
                errorBlock?.append(errorEl);
                allOk.push(true);
            } else if (input.validity.valid) {
                allOk.push(false);
            }
        });

        if (allOk.includes(false)) {
            // this.formValidated = false;
            return true;
        } else {
            // this.formValidated = true;
            return false;
        }
    }

    createSubmitMessage() {
        const wrapper = createDiv('message-wrapper');
        const message = createDiv('submit-message');
        let time = 5;
        message.innerText = `Thanks for your order. Redirect to the store after ${time} sec`;
        const timer = setInterval(() => {
            message.innerText = `Thanks for your order. Redirect to the store after ${--time} sec`;
        }, 1000);
        setTimeout(() => {
            clearInterval(timer);
            wrapper.remove();
        }, 5000);
        wrapper.append(message);
        return wrapper;
    }
}

// валидация (+Trello)
// error card блоки (!)
// как типизировать require
// реализован submit корзины, при этом появляется окно с timeout
