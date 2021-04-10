interface IRegisterSettings {
    role: string;
    cashUponRegister: number;
    bankUponRegister: number;
}

export default class Globals {
    static registerSettings: IRegisterSettings = {
        role: 'user',
        cashUponRegister: 0,
        bankUponRegister: 500
    };
}
