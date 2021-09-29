
import { _decorator, Component, Node, EventTouch, UITransform, Vec3, systemEvent, SystemEvent, Touch } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('Player')
export class Player extends Component {
    coordinate: Vec3 = new Vec3(0, 0, 0);
    availableMoveDis: number = 1;


    onLoad() {
        this._init();
    }

    start () {
    }

    private _init() {

    }

    setCoordinate(c: Vec3) {
        this.coordinate = c;
    }

    setAvailableMoveDis(dis: number) {
        this.availableMoveDis = dis;
    }



}
