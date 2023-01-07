// eslint-disable-next-line @typescript-eslint/no-var-requires
const PayLogo = require('../../../assets/images/pay-logo.jpg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const VisaLogo = require('../../../assets/images/visa-logo.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MCLogo = require('../../../assets/images/mc-logo.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MirLogo = require('../../../assets/images/mir-logo.jpeg');

import { createDiv } from '../../../helpers/createHTMLElements';
import { InputPatterns } from '../../../helpers/constants';
import { CardDateFormatter, ccFormat, cvvFormat } from '../../../helpers/formatters';
import { CardDataFieldsNames, classNames, getErrorTextForField } from './modalConstants';

export class ModalWindow {
    private personDetailsFields: HTMLDivElement[] = [];
    private cardDataFields: HTMLDivElement[] = [];

    public createModalWindow(submitDoneHandler: () => void) {
        const modalWrapper = createDiv('modal-wrapper');
        const modalWindow = createDiv('modal');
        const modalContent = this.createModalWindowContent(submitDoneHandler);
        modalWindow.append(modalContent);
        modalWrapper.append(modalWindow);
        modalWrapper.addEventListener('click', (e) => {
            if (!e.composedPath().includes(modalContent)) {
                modalWrapper.remove();
            }
        });
        return modalWrapper;
    }

    private createModalWindowContent(submitDoneHandler: () => void) {
        const content = createDiv('modal-content');
        const modalContentWrapper = createDiv('modal-content-wrapper');
        const modalForm = document.createElement('form');
        modalForm.classList.add(classNames.INFO_FORM);

        const personDetailsBlock = this.createPersonDetails();
        const cardDetailsBlock = this.createCardDetails();

        const formButton = this.createConfirmButton();

        modalForm.append(personDetailsBlock, cardDetailsBlock, formButton);
        modalContentWrapper.append(modalForm);
        content.append(modalContentWrapper);

        modalForm.noValidate = true;

        modalForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const cardInfoErrors = this.isCardInfoHasErrors();
            const personDataErrors = this.isPersonalInfoFieldsError();
            if (!cardInfoErrors || !personDataErrors) {
                submitDoneHandler();
            }
        });

        return content;
    }

    private createConfirmButton() {
        const formButton = document.createElement('button');
        formButton.innerText = 'CONFIRM';
        formButton.type = 'submit';

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

        this.personDetailsFields.push(nameInput, phoneInput, addressInput, emailInput);
        person.append(title, ...this.personDetailsFields);

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
        payCard.append(payCardTitle, cardData, this.renderErrorBlock());

        return payCard;
    }

    private createCardNumberField() {
        const cardNumber = createDiv(CardDataFieldsNames.cardNumber);

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
            } else if (cardNumberInput.value[0] === '2') {
                cardNumberImg.src = MirLogo;
            } else {
                cardNumberImg.src = PayLogo;
            }

            const number = inputEl.value;
            inputEl.value = ccFormat(number);
            this.checkCardFieldValidity(cardNumber);
        });

        cardNumberInput.addEventListener('blur', () => {
            this.checkCardFieldValidity(cardNumber);
        });

        cardNumber.append(cardNumberImg, cardNumberInput);

        this.cardDataFields.push(cardNumber);

        return cardNumber;
    }

    private createCVVField() {
        const cardCVV = createDiv(CardDataFieldsNames.cvv);
        cardCVV.innerText = ' CVV: ';

        const CVVInput = this.createInputField('Code', InputPatterns.CardCvv);
        CVVInput.maxLength = 3;

        CVVInput.addEventListener('input', (e) => {
            const inputEl = e.target as HTMLInputElement;
            inputEl.value = cvvFormat(inputEl.value);
            if (inputEl.value) {
                this.checkCardFieldValidity(cardCVV);
            }
        });

        CVVInput.addEventListener('blur', () => {
            this.checkCardFieldValidity(cardCVV);
        });

        cardCVV.append(CVVInput);

        this.cardDataFields.push(cardCVV);

        return cardCVV;
    }

    private createValidThruField() {
        const cardTerm = createDiv(CardDataFieldsNames.validThru);
        cardTerm.innerText = ' VALID: ';

        const termInput = this.createInputField('Valid Thru', InputPatterns.CardDate);

        termInput.addEventListener('input', (e) => {
            const input = e.target as HTMLInputElement;
            input.value = CardDateFormatter(input.value);
            this.checkCardFieldValidity(cardTerm);
        });
        termInput.addEventListener('blur', () => {
            this.checkCardFieldValidity(cardTerm);
        });

        cardTerm.append(termInput);

        this.cardDataFields.push(cardTerm);

        return cardTerm;
    }

    private checkCardFieldValidity(inputEl: HTMLDivElement) {
        const input: HTMLInputElement | null = inputEl.getElementsByTagName('input')[0];
        if (!input.validity.valid) {
            this.showCardInfoError(inputEl);
        } else {
            this.deleteErrorFromErrorBlock(inputEl);
        }
    }

    private createInputBlock(addedClass: string, inputText: string, inputPattern?: string, inputType?: string) {
        const inputWrapper = createDiv('form-item');
        inputWrapper.classList.add(addedClass);

        const inputField = this.createInputField(inputText, inputPattern, inputType);

        inputField.addEventListener('input', () => {
            inputField.setCustomValidity('');
            this.showPersonalInfoError(inputWrapper);
        });
        inputField.addEventListener('blur', () => {
            inputField.setCustomValidity('');
            this.showPersonalInfoError(inputWrapper);
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

    private showCardInfoError(cardInfoField: HTMLDivElement) {
        const errorBlock: HTMLElement | null = document.querySelector('.card-data__error-wrapper');

        const textError = getErrorTextForField(cardInfoField.className as CardDataFieldsNames);

        if (!this.isErrorInErrorsBlock(textError)) {
            const errorEl = this.createErrorMessage('error-message', textError);
            errorBlock?.append(errorEl);
        }
    }

    private showPersonalInfoError(inputFieldWrapper: HTMLDivElement) {
        const errorMessage = this.createErrorMessage(classNames.VALIDITY_ERROR);
        const inputField: HTMLInputElement | null = inputFieldWrapper.getElementsByTagName('input')[0];

        inputField.setCustomValidity('');

        const isErrorExist: HTMLElement | null = inputFieldWrapper.querySelector(`.${classNames.VALIDITY_ERROR}`);
        if (!inputField.validity.valid && !isErrorExist) {
            inputFieldWrapper.append(errorMessage);
        } else if (inputField.validity.valid) {
            const errorMessages = inputFieldWrapper.querySelectorAll(`.${classNames.VALIDITY_ERROR}`);
            errorMessages.forEach((error) => {
                error.remove();
            });
        }
    }

    private renderErrorBlock(): HTMLElement {
        const cardDetailInfoEl = document.querySelector('.card-details');
        let errorBlock: HTMLElement | null = document.querySelector('.card-data__error-wrapper');

        if (errorBlock) {
            errorBlock.innerHTML = '';
        } else {
            errorBlock = createDiv('card-data__error-wrapper');
            cardDetailInfoEl?.append(errorBlock);
        }

        return errorBlock;
    }

    private isCardInfoHasErrors(): boolean {
        const allOk: boolean[] = [];
        this.renderErrorBlock();

        this.cardDataFields.forEach((cardInfoField: HTMLDivElement) => {
            const input: HTMLInputElement | null = cardInfoField.getElementsByTagName('input')[0];
            if (input.value === '' || !input.validity.valid) {
                this.showCardInfoError(cardInfoField);
                allOk.push(false);
            } else if (input.validity.valid) {
                allOk.push(true);
            }
        });

        return allOk.includes(false);
    }

    private isPersonalInfoFieldsError(): boolean {
        const allOk: boolean[] = [];

        for (const field of this.personDetailsFields) {
            const input = field.getElementsByTagName('input');
            const currentField = input[0];

            const isErrorExist: HTMLElement | null = field.querySelector('.error-message');
            if (isErrorExist) {
                allOk.push(false);
            }

            if (!currentField.validity.valid) {
                allOk.push(false);
                this.showPersonalInfoError(field);
            } else if (currentField.validity.valid) {
                allOk.push(true);
            }
        }

        return allOk.includes(false);
    }

    private isErrorInErrorsBlock(errorText: string) {
        const errorBlock: HTMLElement | null = document.querySelector('.card-data__error-wrapper');

        const errorsDiv = errorBlock?.children;
        if (errorsDiv) {
            for (const error of errorsDiv) {
                if (error.textContent === errorText) {
                    return true;
                }
            }
        }

        return false;
    }

    private deleteErrorFromErrorBlock(cardInfoField: HTMLDivElement) {
        const textError = getErrorTextForField(cardInfoField.className as CardDataFieldsNames);
        const errorBlock: HTMLElement | null = document.querySelector('.card-data__error-wrapper');

        const errorsDiv = errorBlock?.children;
        if (errorsDiv) {
            for (const error of errorsDiv) {
                if (error.textContent === textError) {
                    error.remove();
                }
            }
        }
    }

    createSubmitMessage(orderDoneHandler: () => void) {
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
            orderDoneHandler();
        }, 5000);
        wrapper.append(message);
        return wrapper;
    }
}

// валидация (+Trello)
// error card блоки (!)
// как типизировать require
// реализован submit корзины, при этом появляется окно с timeout
