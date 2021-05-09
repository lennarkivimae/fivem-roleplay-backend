import './log';
import Log from './log';
import Transfer from './transfer';
import PlayerExists from './check/player/player-exists';
import Teleport from './admin/teleport';
import Kick from './admin/kick';
import Vehicle from './admin/spawn/vehicle';
import Weapon from './admin/give/weapon';
import Login from './auth/login';
import Register from './auth/register';

export default class Routes {
    constructor() {
        this.register;
    }

    register(): void {
        new Log();
        new Transfer();
        new PlayerExists();
        new Teleport();
        new Kick();
        new Vehicle();
        new Weapon();
        new Login();
        new Register();
    }
}
