var CidiSdk = require('cidi.sdk');

cc.Class({
    extends: cc.Component,

    properties: {
        proxyApiKey: '',
        rewardedAdTimeout: 30000,
        tournamentScore: 100,
        gameTaskMetadata: '{}',
        gameTaskBizDate: '',
        autoCreateButtons: true
    },

    onLoad: function () {
        CidiSdk.configure({
            apiKey: this.proxyApiKey,
            rewardedAdTimeout: this.rewardedAdTimeout
        });

        if (this.autoCreateButtons) {
            this.createDemoButtons();
        }
    },

    createDemoButtons: function () {
        var items = [
            { title: 'Init CIDI SDK', handler: this.initCidiSdk },
            { title: 'Login', handler: this.login },
            { title: 'Show Rewarded Ad', handler: this.showRewardedAd },
            { title: 'Report Medal', handler: this.reportMedal },
            { title: 'Query Medal Ownership', handler: this.queryMedalOwnership },
            { title: 'Report Tournament Score', handler: this.reportTournamentScore },
            { title: 'Report Game Task', handler: this.reportGameTask },
            { title: 'Query Game Task Result', handler: this.queryGameTaskResult }
        ];

        this._createTitle('CIDI Offline SDK Demo', cc.v2(0, 240));

        for (var i = 0; i < items.length; i += 1) {
            this._createButton(items[i].title, cc.v2(0, 170 - i * 52), items[i].handler.bind(this));
        }
    },

    initCidiSdk: function () {
        CidiSdk.initCidiSdk()
            .then(function () {
                cc.log('[CIDI Demo] CIDI SDK initialized.');
            })
            .catch(this._logError.bind(this, 'Init CIDI SDK failed'));
    },

    showRewardedAd: function () {
        CidiSdk.showRewardedAd(this.rewardedAdTimeout)
            .then(function () {
                cc.log('[CIDI Demo] Rewarded ad completed.');
            })
            .catch(this._logError.bind(this, 'Show rewarded ad failed'));
    },

    login: function () {
        CidiSdk.login()
            .then(function () {
                cc.log('[CIDI Demo] Login completed.');
            })
            .catch(this._logError.bind(this, 'Login failed'));
    },

    reportMedal: function () {
        CidiSdk.reportMedal()
            .then(function () {
                cc.log('[CIDI Demo] Medal report completed.');
            })
            .catch(this._logError.bind(this, 'Report medal failed'));
    },

    queryMedalOwnership: function () {
        CidiSdk.queryMedalOwnership()
            .then(function (result) {
                cc.log('[CIDI Demo] Medal ownership result:', JSON.stringify(result));
            })
            .catch(this._logError.bind(this, 'Query medal ownership failed'));
    },

    reportTournamentScore: function () {
        CidiSdk.reportTournamentScore(this.tournamentScore)
            .then(function () {
                cc.log('[CIDI Demo] Tournament score report completed.');
            })
            .catch(this._logError.bind(this, 'Report tournament score failed'));
    },

    reportGameTask: function () {
        CidiSdk.reportGameTask(this._getGameTaskMetadata())
            .then(function () {
                cc.log('[CIDI Demo] Game task report completed.');
            })
            .catch(this._logError.bind(this, 'Report game task failed'));
    },

    queryGameTaskResult: function () {
        CidiSdk.queryGameTaskResult(this.gameTaskBizDate)
            .then(function (result) {
                cc.log('[CIDI Demo] Game task result:', JSON.stringify(result));
            })
            .catch(this._logError.bind(this, 'Query game task result failed'));
    },

    _getGameTaskMetadata: function () {
        if (!this.gameTaskMetadata) {
            return {};
        }

        try {
            return JSON.parse(this.gameTaskMetadata);
        } catch (error) {
            cc.warn('[CIDI Demo] Invalid gameTaskMetadata JSON, use raw string.');
            return this.gameTaskMetadata;
        }
    },

    _createTitle: function (text, position) {
        var node = new cc.Node('Title');
        node.parent = this.node;
        node.setPosition(position);

        var label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 28;
        label.lineHeight = 34;
    },

    _createButton: function (text, position, handler) {
        var buttonNode = new cc.Node(text);
        buttonNode.parent = this.node;
        buttonNode.setPosition(position);
        buttonNode.setContentSize(320, 42);

        var background = buttonNode.addComponent(cc.Graphics);
        background.fillColor = new cc.Color(36, 115, 220, 255);
        background.roundRect(-160, -21, 320, 42, 6);
        background.fill();

        var button = buttonNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.NONE;
        buttonNode.on('click', handler, this);

        var labelNode = new cc.Node('Label');
        labelNode.parent = buttonNode;
        labelNode.setPosition(cc.v2(0, 0));

        var label = labelNode.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 18;
        label.lineHeight = 42;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
    },

    _logError: function (action, error) {
        var code = error && error.code ? error.code : 'UNKNOWN_ERROR';
        var message = error && error.message ? error.message : String(error);
        cc.error('[CIDI Demo]', action, code, message);
    }
});
