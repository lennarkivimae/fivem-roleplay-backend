import Log from './log';
import Transfer from './transfer';
import Weapon from './admin/give/weapon';
import Vehicle from './admin/spawn/vehicle';
import Login from './auth/login';
import Register from './auth/register';
import PlayerExists from './check/player/player-exists';

export default class Routes {
    constructor() {
        this.register();
    }

    register(): void {
        new Log();
        new Transfer();
        new Weapon();
        new Vehicle();
        new Login();
        new Register();
        new PlayerExists();
    }

}
