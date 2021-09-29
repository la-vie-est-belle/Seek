
import { _decorator, Component, Node, NodePool, Prefab, instantiate, Vec3, systemEvent, SystemEvent, EventTouch, Touch, Camera, PhysicsSystem, BoxCollider, tween, AudioClip, AudioSource, Label } from 'cc';
import { Player } from './Player';
import { Cube } from './Cube';
import { LevelMaker } from './LevelMaker';
const { ccclass, property } = _decorator;

 
@ccclass('GameManager')
export class GameManager extends Component {
    @property({type: Node})
    player: Node = null!;

    @property({type: Node})
    levelMaker: Node = null!;

    @property({type: Node})
    coordinateLabel: Node = null!;

    @property({type: AudioClip})
    moveAudio: AudioClip = null!;
    @property({type: AudioClip})
    clickAudio: AudioClip = null!;

    cubeArray: Node[] = [];
    cubeNodePool: NodePool = new NodePool();
    audioSource: AudioSource = new AudioSource();

    private _playerCamera: Node = new Node();
    private _touchStartPos: Vec3 = new Vec3();
    private _lastSelectedCube: Node = null;

    onLoad() {
        this._init();
    }

    start () {
    }

    private _init() {
        this._initNodes();
        this._initEvents();
        this._initComponents();
        this._initLevel();
    }

    private _initNodes() {
        this._playerCamera = this.player.children[0];
    }

    private _initEvents() {
        systemEvent.on(SystemEvent.EventType.TOUCH_START, this._onTouchStart, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this._onTouchMove, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this._onTouchEnd, this); 
    }

    private _initComponents() {
        this.audioSource = this.node.getComponent(AudioSource);
    }

    private _initLevel() {
        this.levelMaker.getComponent(LevelMaker).makeLevelEnvironment(1);
    }

    private _onTouchStart(t: Touch, e: EventTouch) { 
        let x = e.getLocation().x;
        let y = e.getLocation().y;
        this._touchStartPos = new Vec3(x, y, 0);
        
        /* 判断是否移动 */
        this._checkMove(x, y);
    }

    private _onTouchMove(t: Touch, e: EventTouch) {
        /* 旋转相机视角 */
        let x = e.getLocation().x;
        let y = e.getLocation().y;

        if (x > this._touchStartPos.x) {
            this.player.setRotationFromEuler(this.player.eulerAngles.x,
                                              this.player.eulerAngles.y-1,
                                              this.player.eulerAngles.z);
        }
        else if (x < this._touchStartPos.x) {
            this.player.setRotationFromEuler(this.player.eulerAngles.x,
                                              this.player.eulerAngles.y+1,
                                              this.player.eulerAngles.z);
        }

        if (y > this._touchStartPos.y) {
            this.player.setRotationFromEuler(this.player.eulerAngles.x-1,
                                              this.player.eulerAngles.y,
                                              this.player.eulerAngles.z);
        }
        else if (y < this._touchStartPos.y) {
            this.player.setRotationFromEuler(this.player.eulerAngles.x+1,
                                              this.player.eulerAngles.y,
                                              this.player.eulerAngles.z);
        }
    }

    private _onTouchCancel(t: Touch, e: EventTouch) {
    }

    private _onTouchEnd(t: Touch, e: EventTouch) {
    }

    private _checkMove(x: number, y: number) {
        /* 判断是否双击了某个方块，是则移动方块 */
        let currentSelectedCube = this._getTouchCube(x, y);
        if (!currentSelectedCube) {
            return;
        }

        if (this._lastSelectedCube && this._lastSelectedCube.uuid == currentSelectedCube.uuid) {
            /* 
            移动到目标方块后，缓动还原该方块。
            */
            this._moveToTargetCube(currentSelectedCube);
            tween(this._lastSelectedCube).by(0.2, {position: new Vec3(0, -0.3, 0)}, {easing: 'sineInOut'}).start();
            this._lastSelectedCube = null;
        }
        else {
            /* 
            说明第一次点击到这个方块。
            先缓动还原之前的方块。
            再给新的方块添加缓动。
            */
            tween(this._lastSelectedCube).by(0.2, {position: new Vec3(0, -0.3, 0)}, {easing: 'sineInOut'}).start();
            this._lastSelectedCube = this._getTouchCube(x, y);
            tween(this._lastSelectedCube).by(0.2, {position: new Vec3(0, 0.3, 0)}, {easing: 'sineInOut'}).start();
            
            /* 根据距离调节音量 */
            let dis = Vec3.distance(this._lastSelectedCube.position, this.player.position);
            this.audioSource.playOneShot(this.clickAudio, 4/dis);
        }
    }

    private _moveToTargetCube(cube: Node) {
        /* 
        移动到目标方块位置。
        需要判断目标方块是否在可移动范围内。
        默认可移动范围为1，可通过修改Player组件中的availableMoveDis来修改。
         */
        let cubeCoordinate = cube.getComponent(Cube).coordinate;
        let playerCoordinate = this.player.getComponent(Player).coordinate;
        let playerAvailbleMoveDis = this.player.getComponent(Player).availableMoveDis;

        if (cubeCoordinate.y == playerCoordinate.y && cubeCoordinate.z == playerCoordinate.z && Math.abs(cubeCoordinate.x - playerCoordinate.x) <= playerAvailbleMoveDis ||
            cubeCoordinate.y == playerCoordinate.y && cubeCoordinate.x == playerCoordinate.x && Math.abs(cubeCoordinate.z - playerCoordinate.z) <= playerAvailbleMoveDis ||
            cubeCoordinate.y == playerCoordinate.y &&  Math.abs(cubeCoordinate.x - playerCoordinate.x) <= playerAvailbleMoveDis &&  Math.abs(cubeCoordinate.z - playerCoordinate.z) <= playerAvailbleMoveDis) {

                this._changeCoordinateLable(cubeCoordinate);
                this.player.getComponent(Player).setCoordinate(cubeCoordinate);
                this.player.setPosition(new Vec3(cube.position).add3f(0, 1.7, 0));
                console.log('移动成功')
                console.log(this.player.getComponent(Player).coordinate);
                this.audioSource.playOneShot(this.moveAudio);
        }
        else {
            console.log('太远啦！')
        }

    }

    private _getTouchCube(x: number, y:number) {
        /* 
        通过射线检测获取到目标方块。
        */
        let ray = this._playerCamera.getComponent(Camera).screenPointToRay(x, y);

        if (PhysicsSystem.instance.raycast(ray)) {
            let results = PhysicsSystem.instance.raycastResults
            let closestNode = results[0].collider.node;

            /* 返回名称为Cube且不是玩家正站着的方块 */
            let closetNodeCoordinate = closestNode.getComponent(Cube).coordinate;
            let playerCoordinate = this.player.getComponent(Player).coordinate;
            if (closestNode.name.startsWith('Cube') && (closetNodeCoordinate.x != playerCoordinate.x || closetNodeCoordinate.y != playerCoordinate.y || closetNodeCoordinate.z != playerCoordinate.z)) {
                return closestNode;
            }
        }

        return null;
    }
 
    private _changeCoordinateLable(pos: Vec3) {
        /* 更改屏幕坐标显示文本 */
        let label = new Label();
        label = this.coordinateLabel.getComponent(Label);
        label.string = `${pos.x.toString()}-${pos.y.toString()}-${pos.z.toString()}`;
    }

    private _win() {
        
    }

    private _lose() {

    }

    update(deltaTime: number) {
        // let playerCoordinate = this.player.getComponent(Player).coordinate;

        // if (this._playerLastCoordinate != playerCoordinate) {
        //     for (let i=0; i<this.cubeArray.length; i++) {
        //         if (this.cubeArray[i][1].x ==  playerCoordinate.x && this.cubeArray[i][1].y == playerCoordinate.y && this.cubeArray[i][1].z - playerCoordinate.z == 1 ||
        //             this.cubeArray[i][1].z == playerCoordinate.z && this.cubeArray[i][1].y == playerCoordinate.y && this.cubeArray[i][1].x - playerCoordinate.x == 1
        //         ) {
        //             this.cubeArray[i][0].getComponent(Cube).cubeUpDown();
        //         }
        //     }
            
        //     this._playerLastCoordinate = playerCoordinate;
        // }

    }
}