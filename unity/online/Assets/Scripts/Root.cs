using System;
using System.Runtime.InteropServices;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class Root : MonoBehaviour
{
    private const string BridgeObjectName = "CidiOnlineDemo";
    private const int RewardedAdTimeout = 30000;

    private Text _statusText;
    private Text _logText;
    private ScrollRect _logScroll;

#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void CidiBridge_Init(string callbackObject);

    [DllImport("__Internal")]
    private static extern void CidiBridge_ShowRewardedAd(string callbackObject, int timeout);
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
        SetStatus("Ready");
        Log("Unity online SDK demo ready.");
        Log("This demo calls window.CiDiSDK directly from WebGL.");
    }

    public void OnBridgeSuccess(string payload)
    {
        SetStatus("Success");
        Log("Success: " + payload);
    }

    public void OnBridgeError(string payload)
    {
        SetStatus("Error");
        Log("Error: " + payload);
    }

    private void InitCidiSdk()
    {
        SetStatus("Initializing CIDI SDK...");
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_Init(BridgeObjectName);
#else
        Log("Editor mode: Init CIDI SDK would call window.CiDiSDK.init().");
        SetStatus("Editor mode");
#endif
    }

    private void ShowRewardedAd()
    {
        SetStatus("Opening rewarded ad...");
#if UNITY_WEBGL && !UNITY_EDITOR
        CidiBridge_ShowRewardedAd(BridgeObjectName, RewardedAdTimeout);
#else
        Log("Editor mode: Show Rewarded Ad would call window.CiDiSDK.showRewardedAd().");
        SetStatus("Editor mode");
#endif
    }

    private void BuildUi()
    {
        EnsureEventSystem();

        var canvasNode = new GameObject("CIDI Online Demo Canvas");
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
        layout.padding = new RectOffset(24, 24, 22, 22);
        layout.spacing = 14;
        layout.childControlHeight = true;
        layout.childControlWidth = true;
        layout.childForceExpandHeight = false;
        layout.childForceExpandWidth = true;

        CreateText(panel.transform, "CIDI Unity Online SDK Demo", 26, FontStyle.Bold, TextAnchor.MiddleCenter, 46);
        _statusText = CreateText(panel.transform, "Ready", 16, FontStyle.Normal, TextAnchor.MiddleCenter, 34);
        _statusText.color = new Color(0.74f, 0.82f, 0.94f, 1f);

        var grid = CreateButtonGrid(panel.transform);
        CreateButton(grid.transform, "Init CIDI SDK", InitCidiSdk);
        CreateButton(grid.transform, "Show Rewarded Ad", ShowRewardedAd);

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
        rect.sizeDelta = new Vector2(640, 430);

        var image = panel.AddComponent<Image>();
        image.color = new Color(0.09f, 0.1f, 0.12f, 0.95f);

        return panel;
    }

    private static GameObject CreateButtonGrid(Transform parent)
    {
        var gridNode = new GameObject("Button Grid");
        gridNode.transform.SetParent(parent, false);
        gridNode.AddComponent<LayoutElement>().preferredHeight = 44;

        var grid = gridNode.AddComponent<GridLayoutGroup>();
        grid.cellSize = new Vector2(280, 38);
        grid.spacing = new Vector2(14, 8);
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
        node.AddComponent<CidiButtonScaleFeedback>();

        var colors = button.colors;
        colors.highlightedColor = new Color(0.2f, 0.56f, 1f, 1f);
        colors.pressedColor = new Color(0.08f, 0.32f, 0.68f, 1f);
        button.colors = colors;

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
        scrollNode.AddComponent<LayoutElement>().preferredHeight = 250;

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

    private static Text CreateText(Transform parent, string text, int size, FontStyle style, TextAnchor anchor, float preferredHeight)
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
        if (preferredHeight > 0)
        {
            element.preferredHeight = preferredHeight;
        }

        return label;
    }

    private void SetStatus(string message)
    {
        if (_statusText != null)
        {
            _statusText.text = message;
        }
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

internal sealed class CidiButtonScaleFeedback : MonoBehaviour, IPointerDownHandler, IPointerUpHandler, IPointerExitHandler
{
    private static readonly Vector3 PressedScale = new Vector3(0.97f, 0.97f, 1f);

    public void OnPointerDown(PointerEventData eventData)
    {
        transform.localScale = PressedScale;
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        transform.localScale = Vector3.one;
    }

    public void OnPointerExit(PointerEventData eventData)
    {
        transform.localScale = Vector3.one;
    }
}
