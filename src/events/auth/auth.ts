import Login from "./login/login";
import Register from "./register/register";

export default class Auth {
    constructor() {
        this.init();
    }

    init(): void {
        new Login;
        new Register;
    }
}
