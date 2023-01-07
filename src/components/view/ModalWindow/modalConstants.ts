export const enum CardDataFieldsNames {
    cardNumber = 'card-number',
    cvv = 'cvv-data',
    validThru = 'valid-data',
}

export const getErrorTextForField = (field: CardDataFieldsNames): string => {
    let errorText: string;

    switch (field) {
        case CardDataFieldsNames.cardNumber:
            errorText = 'Card number - error';
            break;
        case CardDataFieldsNames.cvv:
            errorText = 'Card CVV - error';
            break;
        case CardDataFieldsNames.validThru:
            errorText = 'Card valid thru - error';
            break;
        default:
            errorText = 'Error';
    }

    return errorText;
};

export const classNames = {
    VALIDITY_ERROR: 'error-message',
    INFO_FORM: 'customer-info',
};
