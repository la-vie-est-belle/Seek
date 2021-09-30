import LevelConfig from '../config/LevelConfig';
import { _decorator, Component, Node, Prefab, instantiate, Vec3, Label, tween, ProgressBar } from 'cc';
import { GameManager } from './GameManager';
import { Cube } from './Cube';
const { ccclass, property } = _decorator;
 
@ccclass('LevelMaker')
export class LevelMaker extends Component {
    @property({type: Prefab})
    cubePrefab: Prefab =  null!;

    @property({type: Prefab})
    upPrefab: Prefab =  null!;

    @property({type: Prefab})
    downPrefab: Prefab =  null!;

    @property({type: Node})
    timeProgressBar: Node = null!;

    @property({type: Node})
    tipLabel: Node = null!;

    @property({type: Node})
    introLabel: Node = null!;

    private _cubeGap: number = 0;
    private _upPos: any[] = [];
    private _downPos: any[] = [];
    private _levelTime: number = 0;
    private _leftTime: number = 0;
    private _game: GameManager = new GameManager();

    onLoad() {
    }

    start() {
    }

    getLeftTime() {
        return this._leftTime;
    }

    getLevelConfig() {
        return {
            levelTime: this._levelTime,
            upPos: this._upPos,
            downPos: this._downPos,
            cubeGap: this._cubeGap
        }
    }

    makeLevelEnvironment(num: number) {
        /* 生成关卡环境 */
        this._setTime(num);
        this._setCubes(num);
        this._setIntro(num);
        this._setTip(num);
        // switch (num) {
        //     case 0:

        //         break;
        //     case 2:
        //         break;
        // }
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

    private _setCubes(num: number) {
        /* 根据关卡配置文件摆放方块 */
        this._makeAllCubes(num);
        this._hideBlankCubes(num);
        this._addDirectionalCones(num);
    }

    private _setTime(num: number) {
        /* 设置关卡规定时间 */
        let currentLevel = LevelConfig.levels[num];
        this._levelTime = currentLevel.time;
        this._leftTime = this._levelTime;

        this.schedule(this._updateTime, 0.1);
    }

    private _updateTime() {
        /* 更新进度条 */
        if (!this.timeProgressBar.active) {
            return;
        }

        this._leftTime -= 0.1;
        let progressBar = new ProgressBar();
        progressBar = this.timeProgressBar.getComponent(ProgressBar);
        progressBar.progress = this._leftTime / this._levelTime;

        /* 时间到，游戏失败 */
        if (this._leftTime <= 0) {
            this.unschedule(this._updateTime);
        }
    }

    private _makeAllCubes(num: number) {
        let currentLevel = LevelConfig.levels[num];
        let lengthNum = currentLevel.lengthNum;
        let widthNum = currentLevel.widthNum;
        let heightNum = currentLevel.heightNum;
        this._cubeGap = currentLevel.cubeGap;

        /* 摆放方块 */
        for (let x=0; x<lengthNum; x++) {
            for (let y=0; y<widthNum; y++) {
                for (let z=0; z<heightNum; z++) {
                    let cube = this._spawnCube();
                    this.node.addChild(cube);
                    this._game.cubeArray.push(cube);
                    cube.setPosition(x*this._cubeGap , y*this._cubeGap , z*this._cubeGap);
                    cube.getComponent(Cube).setCoordinate(new Vec3(x, y, z));
                }
            }
        }
    }

    private _hideBlankCubes(num: number) {
        /* 去掉挖空的方块 */
        let currentLevel = LevelConfig.levels[num];
        let blankPos = currentLevel.blankPos;

        for (let i=0; i<blankPos.length; i++) {
            for (let j=0; j<this._game.cubeArray.length; j++) {
                if (this._game.cubeArray[j].getComponent(Cube).coordinate.x == blankPos[i][0] && 
                    this._game.cubeArray[j].getComponent(Cube).coordinate.y == blankPos[i][1] &&
                    this._game.cubeArray[j].getComponent(Cube).coordinate.z == blankPos[i][2]) {
                        this._game.cubeArray[j].active = false;
                    }
            }
        }
    }

    private _addDirectionalCones(num: number) {
        /* 添加方向指示圆锥 */
        let currentLevel = LevelConfig.levels[num];
        this._upPos = currentLevel.upPos;
        this._downPos = currentLevel.downPos;

        for (let i=0; i<this._upPos.length; i++) {
            for (let j=0; j<this._game.cubeArray.length; j++) {
                if (this._game.cubeArray[j].getComponent(Cube).coordinate.x == this._upPos[i][0] && 
                    this._game.cubeArray[j].getComponent(Cube).coordinate.y == this._upPos[i][1] &&
                    this._game.cubeArray[j].getComponent(Cube).coordinate.z == this._upPos[i][2]) {
                        /* 设置位置 */
                        let cone = instantiate(this.upPrefab);
                        this.node.addChild(cone);
                        cone.setPosition(new Vec3(this._game.cubeArray[j].position).add3f(0, 1.2, 0));
                        
                        /* 设置动作 */
                        let up = tween(cone).by(2, {position: new Vec3(0, 0.5, 0)}, {easing: 'sineInOut'});
                        let down = tween(cone).by(2, {position: new Vec3(0, -0.5, 0)}, {easing: 'sineInOut'});
                        tween(cone).sequence(up, down).repeatForever().start();
                    }
            }
        }

        for (let i=0; i<this._downPos.length; i++) {
            for (let j=0; j<this._game.cubeArray.length; j++) {
                if (this._game.cubeArray[j].getComponent(Cube).coordinate.x == this._downPos[i][0] && 
                    this._game.cubeArray[j].getComponent(Cube).coordinate.y == this._downPos[i][1] &&
                    this._game.cubeArray[j].getComponent(Cube).coordinate.z == this._downPos[i][2]) {
                        /* 设置位置 */
                        let cone = instantiate(this.downPrefab);
                        this.node.addChild(cone);
                        cone.setPosition(new Vec3(this._game.cubeArray[j].position).add3f(0, 1.2, 0));
                        
                        /* 设置动作 */
                        let up = tween(cone).by(2, {position: new Vec3(0, 0.5, 0)}, {easing: 'sineInOut'});
                        let down = tween(cone).by(2, {position: new Vec3(0, -0.5, 0)}, {easing: 'sineInOut'});
                        tween(cone).sequence(up, down).repeatForever().start();
                    }
            }
        }
    }
   
    private _setIntro(num: number) {
        /* 设置关卡介绍文本 */
        let currentLevel = LevelConfig.levels[num];
        let intro = currentLevel.intro;

        let label = new Label();
        label = this.introLabel.getComponent(Label);
        label.string = intro;
    }

    private _setTip(num: number) {
        /* 设置关卡提示文本 */
        let currentLevel = LevelConfig.levels[num];
        let tip = currentLevel.tip;

        let label = new Label();
        label = this.tipLabel.getComponent(Label);
        label.string = tip;
    }
}
