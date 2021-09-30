
import { _decorator, Component, Node, AudioClip, AudioSource, Button, EventHandler, find } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('Util')
export class Util extends Component {
    @property({ type: AudioClip })
    btnAudio: AudioClip = new AudioClip();

    @property({type: Node})
    timeProgressBar: Node = null!;

    audioSource: AudioSource = new AudioSource();

    start () {
    }

    hideBoard(e: EventHandler) {
        /* 隐藏所有类型板子的按钮回调函数 */
        e.target.parent.active = false;
        this.audioSource.playOneShot(this.btnAudio);
    }

    showTip(e: EventHandler) {
        /* 显示提示文本 */
        let tipLabel = find('Canvas/Tip Label');
        if (tipLabel.active) {
            tipLabel.active = false;
        }
        else {
            tipLabel.active = true;
            this.audioSource.playOneShot(this.btnAudio);
        }
    }

    startCountDown() {
        this.timeProgressBar.active = true;
    }
}