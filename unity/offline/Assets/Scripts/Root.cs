using System;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Root : MonoBehaviour
{
    private const string BridgeObjectName = "CidiOfflineDemo";

    [SerializeField] private string proxyApiKey = "";
    [SerializeField] private string tournamentScore = "100";
    [SerializeField] private string gameTaskMetadata = "{}";
    [SerializeField] private string gameTaskBizDate = "";

    private InputField _apiKeyInput;
    private InputField _scoreInput;
    private InputField _metadataInput;
    private InputField _bizDateInput;
    private Text _logText;
    private ScrollRect _logScroll;

#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void CidiBridge_Configure(string baseUrl, string apiKey, int rewardedAdTimeout);

    [DllImport("__Internal")]
    private static extern void CidiBridge_Init(string callbackObject);

    [DllImport("__Internal")]
    private static extern void CidiBridge_Login(string callbackObject);

    [DllImport("__Internal")]
    private static extern void CidiBridge_ShowRewardedAd(string callbackObject, int timeout);

    [DllImport("__Internal")]
    private static extern void CidiBridge_ReportMedal(string callbackObject);

    [DllImport("__Internal")]
    private static extern void CidiBridge_QueryMedalOwnership(string callbackObject);

    [DllImport("__Internal")]
    private static extern void CidiBridge_ReportTournamentScore(string callbackObject, string score);

    [DllImport("__Internal")]
    private static extern void CidiBridge_ReportGameTask(string callbackObject, string metadata);

    [DllImport("__Internal")]
    private static extern void CidiBridge_QueryGameTaskResult(string callbackObject, string bizDate);
#endif

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void Bootstrap()
    {
        if (FindObjectOfType<Root>() != null)
        {
            return;
        }

        var go = new GameObject(BridgeObjectName);
        go.AddComponent<Root>();
        DontDestroyOnLoad(go);
    }

    private void Awake()
    {
        gameObject.name = BridgeObjectName;
    }

    private void Start()
    {
        BuildUi();
        Log("Unity offline SDK demo ready.");
        Log("Set the proxy apiKey before calling proxy APIs.");
    }

    public void OnBridgeSuccess(string payload)
    {
        Log("Success: " + payload);
    }

    public void OnBridgeError(string payload)
    {
        Log("Error: " + payload);
    }

    private void ConfigureBridge()
    {
        proxyApiKey = _apiKeyInput.text.Trim();
        tournamentScore = _scoreInput.text.Trim();
        gameTaskMetadata = _metadataInput.text.Trim();
        gameTaskBizDate = _bizDateInput.text.Trim();

#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_Configure("https://elf-proxy.cidi.games/api/v1", proxyApiKey, 30000);
#else
        Log("Editor mode: bridge configure skipped.");
#endif
    }

    private void InitCidiSdk()
    {
        ConfigureBridge();
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_Init(BridgeObjectName);
#else
        Log("Editor mode: Init CIDI SDK would call window.CiDiSDK.init().");
#endif
    }

    private void Login()
    {
        ConfigureBridge();
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_Login(BridgeObjectName);
#else
        Log("Editor mode: Login would call CidiProxySDK auth.login().");
#endif
    }

    private void ShowRewardedAd()
    {
        ConfigureBridge();
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_ShowRewardedAd(BridgeObjectName, 30000);
#else
        Log("Editor mode: Show Rewarded Ad would call window.CiDiSDK.showRewardedAd().");
#endif
    }

    private void ReportMedal()
    {
        ConfigureBridge();
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_ReportMedal(BridgeObjectName);
#else
        Log("Editor mode: Report Medal would call proxy report.medal().");
#endif
    }

    private void QueryMedalOwnership()
    {
        ConfigureBridge();
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_QueryMedalOwnership(BridgeObjectName);
#else
        Log("Editor mode: Query Medal Ownership would call proxy report.medalOwnership().");
#endif
    }

    private void ReportTournamentScore()
    {
        ConfigureBridge();
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_ReportTournamentScore(BridgeObjectName, tournamentScore);
#else
        Log("Editor mode: Report Tournament Score would send score " + tournamentScore + ".");
#endif
    }

    private void ReportGameTask()
    {
        ConfigureBridge();
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_ReportGameTask(BridgeObjectName, gameTaskMetadata);
#else
        Log("Editor mode: Report Game Task would send metadata " + gameTaskMetadata + ".");
#endif
    }

    private void QueryGameTaskResult()
    {
        ConfigureBridge();
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_QueryGameTaskResult(BridgeObjectName, gameTaskBizDate);
#else
        Log("Editor mode: Query Game Task Result would send bizDate " + gameTaskBizDate + ".");
#endif
    }

    private void BuildUi()
    {
        EnsureEventSystem();

        var canvasNode = new GameObject("CIDI Offline Demo Canvas");
        canvasNode.transform.SetParent(transform, false);

        var canvas = canvasNode.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;

        var scaler = canvasNode.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(960, 640);
        scaler.matchWidthOrHeight = 0.5f;

        canvasNode.AddComponent<GraphicRaycaster>();

        var panel = CreatePanel(canvasNode.transform);
        var layout = panel.AddComponent<VerticalLayoutGroup>();
        layout.padding = new RectOffset(24, 24, 20, 20);
        layout.spacing = 10;
        layout.childControlHeight = true;
        layout.childControlWidth = true;
        layout.childForceExpandHeight = false;
        layout.childForceExpandWidth = true;

        CreateText(panel.transform, "CIDI Unity Offline SDK Demo", 26, FontStyle.Bold, TextAnchor.MiddleCenter, 44);
        _apiKeyInput = CreateInput(panel.transform, "Proxy API Key", proxyApiKey, false);
        _scoreInput = CreateInput(panel.transform, "Tournament Score", tournamentScore, false);
        _metadataInput = CreateInput(panel.transform, "Game Task Metadata", gameTaskMetadata, false);
        _bizDateInput = CreateInput(panel.transform, "Game Task Biz Date", gameTaskBizDate, false);

        var grid = CreateButtonGrid(panel.transform);
        CreateButton(grid.transform, "Init CIDI SDK", InitCidiSdk);
        CreateButton(grid.transform, "Login", Login);
        CreateButton(grid.transform, "Show Rewarded Ad", ShowRewardedAd);
        CreateButton(grid.transform, "Report Medal", ReportMedal);
        CreateButton(grid.transform, "Query Medal Ownership", QueryMedalOwnership);
        CreateButton(grid.transform, "Report Tournament Score", ReportTournamentScore);
        CreateButton(grid.transform, "Report Game Task", ReportGameTask);
        CreateButton(grid.transform, "Query Game Task Result", QueryGameTaskResult);

        CreateLog(panel.transform);
    }

    private static void EnsureEventSystem()
    {
        if (FindObjectOfType<EventSystem>() != null)
        {
            return;
        }

        var eventSystem = new GameObject("EventSystem");
        eventSystem.AddComponent<EventSystem>();
        eventSystem.AddComponent<StandaloneInputModule>();
    }

    private static GameObject CreatePanel(Transform parent)
    {
        var panel = new GameObject("Panel");
        panel.transform.SetParent(parent, false);

        var rect = panel.AddComponent<RectTransform>();
        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.pivot = new Vector2(0.5f, 0.5f);
        rect.sizeDelta = new Vector2(720, 600);

        var image = panel.AddComponent<Image>();
        image.color = new Color(0.09f, 0.1f, 0.12f, 0.95f);

        return panel;
    }

    private InputField CreateInput(Transform parent, string label, string value, bool multiline)
    {
        var row = new GameObject(label + " Row");
        row.transform.SetParent(parent, false);
        row.AddComponent<LayoutElement>().preferredHeight = multiline ? 76 : 48;

        var horizontal = row.AddComponent<HorizontalLayoutGroup>();
        horizontal.spacing = 10;
        horizontal.childControlHeight = true;
        horizontal.childControlWidth = true;
        horizontal.childForceExpandHeight = true;
        horizontal.childForceExpandWidth = false;

        CreateText(row.transform, label, 16, FontStyle.Normal, TextAnchor.MiddleLeft, 140);

        var inputNode = new GameObject(label + " Input");
        inputNode.transform.SetParent(row.transform, false);
        inputNode.AddComponent<LayoutElement>().flexibleWidth = 1;

        var inputImage = inputNode.AddComponent<Image>();
        inputImage.color = new Color(0.16f, 0.18f, 0.22f, 1f);

        var input = inputNode.AddComponent<InputField>();
        input.text = value;
        input.lineType = multiline ? InputField.LineType.MultiLineNewline : InputField.LineType.SingleLine;
        input.textComponent = CreateInputText(inputNode.transform, "Text", value);
        input.placeholder = CreateInputText(inputNode.transform, "Placeholder", "Enter " + label);
        input.placeholder.color = new Color(0.55f, 0.58f, 0.62f, 1f);

        return input;
    }

    private static Text CreateInputText(Transform parent, string name, string text)
    {
        var node = new GameObject(name);
        node.transform.SetParent(parent, false);

        var rect = node.AddComponent<RectTransform>();
        rect.anchorMin = Vector2.zero;
        rect.anchorMax = Vector2.one;
        rect.offsetMin = new Vector2(10, 6);
        rect.offsetMax = new Vector2(-10, -6);

        var label = node.AddComponent<Text>();
        label.text = text;
        label.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        label.fontSize = 16;
        label.color = Color.white;
        label.alignment = TextAnchor.MiddleLeft;
        label.horizontalOverflow = HorizontalWrapMode.Wrap;
        label.verticalOverflow = VerticalWrapMode.Truncate;

        return label;
    }

    private static GameObject CreateButtonGrid(Transform parent)
    {
        var gridNode = new GameObject("Button Grid");
        gridNode.transform.SetParent(parent, false);
        gridNode.AddComponent<LayoutElement>().preferredHeight = 146;

        var grid = gridNode.AddComponent<GridLayoutGroup>();
        grid.cellSize = new Vector2(320, 32);
        grid.spacing = new Vector2(12, 8);
        grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
        grid.constraintCount = 2;
        grid.childAlignment = TextAnchor.MiddleCenter;

        return gridNode;
    }

    private static Button CreateButton(Transform parent, string label, Action action)
    {
        var node = new GameObject(label);
        node.transform.SetParent(parent, false);

        var image = node.AddComponent<Image>();
        image.color = new Color(0.14f, 0.45f, 0.86f, 1f);

        var button = node.AddComponent<Button>();
        button.targetGraphic = image;
        button.onClick.AddListener(() => action());

        var text = CreateText(node.transform, label, 15, FontStyle.Bold, TextAnchor.MiddleCenter, 0);
        var textRect = text.GetComponent<RectTransform>();
        textRect.anchorMin = Vector2.zero;
        textRect.anchorMax = Vector2.one;
        textRect.offsetMin = Vector2.zero;
        textRect.offsetMax = Vector2.zero;

        return button;
    }

    private void CreateLog(Transform parent)
    {
        var scrollNode = new GameObject("Log Scroll");
        scrollNode.transform.SetParent(parent, false);
        scrollNode.AddComponent<LayoutElement>().preferredHeight = 175;

        var scrollImage = scrollNode.AddComponent<Image>();
        scrollImage.color = new Color(0.05f, 0.06f, 0.07f, 1f);

        _logScroll = scrollNode.AddComponent<ScrollRect>();

        var viewport = new GameObject("Viewport");
        viewport.transform.SetParent(scrollNode.transform, false);
        var viewportRect = viewport.AddComponent<RectTransform>();
        viewportRect.anchorMin = Vector2.zero;
        viewportRect.anchorMax = Vector2.one;
        viewportRect.offsetMin = new Vector2(8, 8);
        viewportRect.offsetMax = new Vector2(-8, -8);
        viewport.AddComponent<Mask>().showMaskGraphic = false;
        viewport.AddComponent<Image>().color = Color.clear;

        var content = new GameObject("Content");
        content.transform.SetParent(viewport.transform, false);
        var contentRect = content.AddComponent<RectTransform>();
        contentRect.anchorMin = new Vector2(0, 1);
        contentRect.anchorMax = new Vector2(1, 1);
        contentRect.pivot = new Vector2(0.5f, 1);
        contentRect.offsetMin = Vector2.zero;
        contentRect.offsetMax = Vector2.zero;

        _logText = content.AddComponent<Text>();
        _logText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        _logText.fontSize = 14;
        _logText.color = new Color(0.86f, 0.9f, 0.94f, 1f);
        _logText.alignment = TextAnchor.UpperLeft;
        _logText.horizontalOverflow = HorizontalWrapMode.Wrap;
        _logText.verticalOverflow = VerticalWrapMode.Overflow;

        var fitter = content.AddComponent<ContentSizeFitter>();
        fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

        _logScroll.viewport = viewportRect;
        _logScroll.content = contentRect;
        _logScroll.horizontal = false;
        _logScroll.vertical = true;
    }

    private static Text CreateText(Transform parent, string text, int size, FontStyle style, TextAnchor anchor, float preferredWidth)
    {
        var node = new GameObject(text);
        node.transform.SetParent(parent, false);

        var label = node.AddComponent<Text>();
        label.text = text;
        label.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
        label.fontSize = size;
        label.fontStyle = style;
        label.alignment = anchor;
        label.color = Color.white;

        var element = node.AddComponent<LayoutElement>();
        if (preferredWidth > 0)
        {
            element.preferredWidth = preferredWidth;
        }

        if (anchor == TextAnchor.MiddleCenter)
        {
            element.preferredHeight = 36;
        }

        return label;
    }

    private void Log(string message)
    {
        Debug.Log("[CIDI Demo] " + message);
        if (_logText == null)
        {
            return;
        }

        _logText.text += "[" + DateTime.Now.ToString("HH:mm:ss") + "] " + message + "\n";
        Canvas.ForceUpdateCanvases();
        if (_logScroll != null)
        {
            _logScroll.verticalNormalizedPosition = 0f;
        }
    }
}
