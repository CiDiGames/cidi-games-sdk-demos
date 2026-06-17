import { _decorator, Button, Color, Component, Graphics, Label, Node, NodeEventType, UITransform, Vec3 } from 'cc';
import CidiSdk from './cidi-sdk';

const { ccclass, property } = _decorator;

@ccclass('Root')
export class Root extends Component {
    @property
    proxyApiKey = '';

    @property
    rewardedAdTimeout = 30000;

    @property
    tournamentScore = 100;

    @property
    gameTaskMetadata = '{}';

    @property
    gameTaskBizDate = '';

    @property
    autoCreateButtons = true;

    onLoad() {
        CidiSdk.configure({
            apiKey: this.proxyApiKey,
            rewardedAdTimeout: this.rewardedAdTimeout
        });

        if (this.autoCreateButtons) {
            this.createDemoButtons();
        }
    }

    createDemoButtons() {
        const items = [
            { title: 'Init CIDI SDK', handler: this.initCidiSdk },
            { title: 'Login', handler: this.login },
            { title: 'Show Rewarded Ad', handler: this.showRewardedAd },
            { title: 'Report Medal', handler: this.reportMedal },
            { title: 'Query Medal Ownership', handler: this.queryMedalOwnership },
            { title: 'Report Tournament Score', handler: this.reportTournamentScore },
            { title: 'Report Game Task', handler: this.reportGameTask },
            { title: 'Query Game Task Result', handler: this.queryGameTaskResult }
        ];

        this.createTitle('CIDI Offline SDK Demo', new Vec3(0, 240, 0));

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

    login() {
        CidiSdk.login()
            .then(() => {
                console.log('[CIDI Demo] Login completed.');
            })
            .catch((error) => this.logError('Login failed', error));
    }

    showRewardedAd() {
        CidiSdk.showRewardedAd(this.rewardedAdTimeout)
            .then(() => {
                console.log('[CIDI Demo] Rewarded ad completed.');
            })
            .catch((error) => this.logError('Show rewarded ad failed', error));
    }

    reportMedal() {
        CidiSdk.reportMedal()
            .then(() => {
                console.log('[CIDI Demo] Medal report completed.');
            })
            .catch((error) => this.logError('Report medal failed', error));
    }

    queryMedalOwnership() {
        CidiSdk.queryMedalOwnership()
            .then((result) => {
                console.log('[CIDI Demo] Medal ownership result:', JSON.stringify(result));
            })
            .catch((error) => this.logError('Query medal ownership failed', error));
    }

    reportTournamentScore() {
        CidiSdk.reportTournamentScore(this.tournamentScore)
            .then(() => {
                console.log('[CIDI Demo] Tournament score report completed.');
            })
            .catch((error) => this.logError('Report tournament score failed', error));
    }

    reportGameTask() {
        CidiSdk.reportGameTask(this.getGameTaskMetadata())
            .then(() => {
                console.log('[CIDI Demo] Game task report completed.');
            })
            .catch((error) => this.logError('Report game task failed', error));
    }

    queryGameTaskResult() {
        CidiSdk.queryGameTaskResult(this.gameTaskBizDate)
            .then((result) => {
                console.log('[CIDI Demo] Game task result:', JSON.stringify(result));
            })
            .catch((error) => this.logError('Query game task result failed', error));
    }

    private getGameTaskMetadata(): unknown {
        if (!this.gameTaskMetadata) {
            return {};
        }

        try {
            return JSON.parse(this.gameTaskMetadata);
        } catch (error) {
            console.warn('[CIDI Demo] Invalid gameTaskMetadata JSON, use raw string.');
            return this.gameTaskMetadata;
        }
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

    private logError(action: string, error: unknown) {
        const detail = error as { code?: string; message?: string };
        const code = detail && detail.code ? detail.code : 'UNKNOWN_ERROR';
        const message = detail && detail.message ? detail.message : String(error);
        console.error('[CIDI Demo]', action, code, message);
    }
}
