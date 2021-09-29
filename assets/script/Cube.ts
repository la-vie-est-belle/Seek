
import { _decorator, Component, Node, EventTouch, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('Cube')
export class Cube extends Component {
    coordinate: Vec3 = new Vec3();

    onLoad() {
        this._init();
    }

    start () {

    }

    private _init() {

    }

    cubeUpDown() {
        let up = tween(this.node).by(1, {position: new Vec3(0, 0.1, 0)}, {easing: 'sineInOut'});
        let down = tween(this.node).by(1, {position: new Vec3(0, -0.1, 0)}, {easing: 'sineInOut'});
        tween(this.node).sequence(up, down).repeatForever().start();
    }

    setCoordinate(c: Vec3) {
        this.coordinate = c;
    }
}
