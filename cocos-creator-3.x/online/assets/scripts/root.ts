import { _decorator, Button, Color, Component, Graphics, Label, Node, NodeEventType, UITransform, Vec3 } from 'cc';
import CidiSdk from './cidi-sdk';

const { ccclass, property } = _decorator;

@ccclass('Root')
export class Root extends Component {
    @property
    rewardedAdTimeout = 30000;

    @property
    autoCreateButtons = true;

    onLoad() {
        CidiSdk.configure({
            rewardedAdTimeout: this.rewardedAdTimeout
        });

        if (this.autoCreateButtons) {
            this.createDemoButtons();
        }
    }

    createDemoButtons() {
        const items = [
            { title: 'Init CIDI SDK', handler: this.initCidiSdk },
            { title: 'Show Rewarded Ad', handler: this.showRewardedAd }
        ];

        this.createTitle('CIDI Online SDK Demo', new Vec3(0, 240, 0));

        items.forEach((item, index) => {
            this.createButton(item.title, new Vec3(0, 170 - index * 52, 0), item.handler.bind(this));
        });
    }

    initCidiSdk() {
        CidiSdk.initCidiSdk()
            .then(() => {
                console.log('[CIDI Demo] CIDI SDK initialized.');
            })
            .catch((error) => this.logError('Init CIDI SDK failed', error));
    }

    showRewardedAd() {
        CidiSdk.showRewardedAd(this.rewardedAdTimeout)
            .then(() => {
                console.log('[CIDI Demo] Rewarded ad completed.');
            })
            .catch((error) => this.logError('Show rewarded ad failed', error));
    }

    private createTitle(text: string, position: Vec3) {
        const node = new Node('Title');
        node.setParent(this.node);
        node.setPosition(position);

        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = 28;
        label.lineHeight = 34;
    }

    private createButton(text: string, position: Vec3, handler: () => void) {
        const buttonNode = new Node(text);
        buttonNode.setParent(this.node);
        buttonNode.setPosition(position);

        const transform = buttonNode.addComponent(UITransform);
        transform.setContentSize(320, 42);

        const background = buttonNode.addComponent(Graphics);
        background.fillColor = new Color(36, 115, 220, 255);
        background.roundRect(-160, -21, 320, 42, 6);
        background.fill();

        const button = buttonNode.addComponent(Button);
        button.transition = Button.Transition.NONE;
        this.bindButtonScaleFeedback(buttonNode);
        buttonNode.on('click', handler, this);

        const labelNode = new Node('Label');
        labelNode.setParent(buttonNode);
        labelNode.setPosition(Vec3.ZERO);

        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(320, 42);

        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 18;
        label.lineHeight = 42;
    }

    private logError(action: string, error: unknown) {
        const detail = error as { code?: string; message?: string };
        const code = detail && detail.code ? detail.code : 'UNKNOWN_ERROR';
        const message = detail && detail.message ? detail.message : String(error);
        console.error('[CIDI Demo]', action, code, message);
    }

    private bindButtonScaleFeedback(buttonNode: Node) {
        const normalScale = new Vec3(1, 1, 1);
        const pressedScale = new Vec3(0.96, 0.96, 1);
        const press = () => buttonNode.setScale(pressedScale);
        const release = () => buttonNode.setScale(normalScale);

        buttonNode.on(NodeEventType.TOUCH_START, press, this);
        buttonNode.on(NodeEventType.TOUCH_END, release, this);
        buttonNode.on(NodeEventType.TOUCH_CANCEL, release, this);
        buttonNode.on(NodeEventType.MOUSE_LEAVE, release, this);
    }
}
