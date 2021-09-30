import { _decorator, Component, Label, CCFloat, AudioClip, Game, AudioSource } from 'cc';
import { GameManager } from '../../script/GameManager';
const { ccclass, property } = _decorator;

@ccclass('MWTyper')
export class MWTyper extends Component {
    @property({type: CCFloat})
    typeInterval: number = 0.1;

    private _label: Label = new Label();
    private _defaultString: string = '';
    private _scheduleCount: number = 0;
    private _audioSource: AudioSource = new AudioSource();

    start() {
        this._init();
        this.show();
    }

    private _init() {
        this._changeLayer();
        this._initAudioSource();
    }

    private _initAudioSource() {
        this._audioSource = this.node.getComponent(AudioSource);
    }

    private _changeLayer() {
        /*
        Change the layer to UI_2D
        */
        this.node.layer = 1 << 25;
    }

    show() {
        this._label = this.node.getComponent(Label)!;
        this._defaultString = this._label.string;
        this._label.string = '';

        this._audioSource.play();
        this.schedule(this._typing, 
                    this.typeInterval, 
                    this._defaultString.length-1);
    }

    hide() {
        this.unschedule(this._typing);
        this.node.active = false;
    }

    setTypeInterval(seconds: number) {
        this.typeInterval = seconds;
    }

    private _typing () {
        this._label.string += this._defaultString[this._scheduleCount];
        this._scheduleCount++;

        if (this._scheduleCount == this._defaultString.length-1) {
            this._audioSource.stop();
        }
    }
}