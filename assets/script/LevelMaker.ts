import PrimaryLevel from '../config/level/PrimaryLevel';
import { _decorator, Component, Node, Prefab, instantiate, Vec3, Label } from 'cc';
import { GameManager } from './GameManager';
import { Cube } from './Cube';
const { ccclass, property } = _decorator;
 
@ccclass('LevelMaker')
export class LevelMaker extends Component {
    @property({type: Prefab})
    cubePrefab: Prefab =  null!;

    @property({type: Node})
    tipLabel: Node = null!;
    @property({type: Node})
    introLabel: Node = null!;

    private _game: GameManager = new GameManager();
    onLoad() {
    }

    start() {
    }

    makeLevelEnvironment(level: number) {
        /* 生成关卡环境 */
        switch (level) {
            case 1:
                this._makeCubes();
                this._setIntro('这是第一关，你怕了吗？');
                this._setTip('一生二，二生三，三生万物。');
                break;
            case 2:
                break;
        }
    }

    private _spawnCube() {
        /* 生成方块 */
        let cube = new Node();

        if (this._game.cubeNodePool.size() > 0) {
            cube = this._game.cubeNodePool.get();
        }
        else {
            cube = instantiate(this.cubePrefab);
        }

        return cube;
    }

    private _makeCubes() {
        /* 根据关卡配置文件摆放方块 */
        let level = PrimaryLevel.levels[0];
        let cubeGap = level.cubeGap;

        for (let x=0; x<level.lengthNum; x++) {
            for (let y=0; y<level.widthNum; y++) {
                for (let z=0; z<level.heightNum; z++) {
                    let cube = this._spawnCube();
                    this.node.addChild(cube);
                    this._game.cubeArray.push(cube);
                    cube.setPosition(x*cubeGap, y*cubeGap, z*cubeGap);
                    cube.getComponent(Cube).setCoordinate(new Vec3(x, y, z));
                }
            }
        }
    }
   
    private _setIntro(content: string) {
        /* 设置关卡介绍文本 */
        let label = new Label();
        label = this.introLabel.getComponent(Label);
        label.string = content;
    }

    private _setTip(content: string) {
        /* 设置关卡提示文本 */
        let label = new Label();
        label = this.tipLabel.getComponent(Label);
        label.string = content;
    }
}
