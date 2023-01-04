// eslint-disable-next-line @typescript-eslint/no-var-requires
const PayLogo = require('../../../assets/images/pay-logo.jpg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const VisaLogo = require('../../../assets/images/visa-logo.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MCLogo = require('../../../assets/images/mc-logo.png');

import { createDiv } from '../../../helpers/createHTMLElements';
import { InputPatterns } from '../../../helpers/constants';
import { CardNumberFormatter, CardDateFormatter } from '../../../helpers/formatters';

export class ModalWindow {
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
        person.append(title, nameInput, phoneInput, addressInput, emailInput);
        return person;
    }

    private createCardDetails() {
        const payCard = createDiv('card-details');
        const payCardTitle = document.createElement('h2');
        payCardTitle.innerText = 'Credit card details';
        const cardData = createDiv('card-data');
        const cardNumber = createDiv('card-number');
        const cardNumberImg = document.createElement('img');
        cardNumberImg.src = PayLogo;
        cardNumberImg.alt = 'pay-logo';
        const cardNumberInput = this.createInputField('Card number', InputPatterns.CardNumber);
        cardNumberInput.addEventListener('keyup', (e) => {
            if (cardNumberInput.value[0] === '4') {
                cardNumberImg.src = VisaLogo;
            } else if (cardNumberInput.value[0] === '5') {
                cardNumberImg.src = MCLogo;
            } else {
                cardNumberImg.src = PayLogo;
            }
            CardNumberFormatter(e.target as HTMLInputElement);
        });
        cardNumber.append(cardNumberImg, cardNumberInput);
        const cardOther = createDiv('other-data');
        const cardTerm = createDiv('valid-data');
        cardTerm.innerText = ' VALID: ';
        const termInput = this.createInputField('Valid Thru', InputPatterns.CardDate);
        termInput.addEventListener('keyup', (e) => {
            CardDateFormatter(e.target as HTMLInputElement);
        });
        cardTerm.append(termInput);
        const cardCVV = createDiv('cvv-data');
        cardCVV.innerText = ' CVV: ';
        const CVVInput = this.createInputField('Code', InputPatterns.CardCvv);
        cardCVV.append(CVVInput);
        cardOther.append(cardTerm, cardCVV);
        cardData.append(cardNumber, cardOther);
        payCard.append(payCardTitle, cardData);
        return payCard;
    }

    private createInputBlock(addedClass: string, inputText: string, inputPattern?: string, inputType?: string) {
        const inputWrapper = createDiv('form-item');
        inputWrapper.classList.add(addedClass);
        const inputField = this.createInputField(inputText, inputPattern, inputType);
        const errorMessage = this.createErrorMessage('error-message');
        inputField.addEventListener('blur', () => {
            inputField.setCustomValidity('');
            if (!inputField.validity.valid) {
                inputWrapper.append(errorMessage);
            } else {
                errorMessage.remove();
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
}

// валидация (+Trello)
// error card блоки (!)
// как типизировать require
// реализован submit корзины, при этом появляется окно с timeout
