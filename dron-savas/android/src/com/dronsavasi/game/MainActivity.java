package com.dronsavasi.game;

import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.InputStream;

/** Yerel kabuk: oyunu https://appassets.androidplatform.net/ kökeninden sunar (IndexedDB ve CompressionStream için güvenli köken). */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private WebView web;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) w.getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.addJavascriptInterface(new Bridge(), "AndroidHost");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                if (!HOST.equals(r.getUrl().getHost())) return null;
                String p = r.getUrl().getPath();
                if (p == null || p.equals("/") || p.isEmpty()) p = "/index.html";
                try {
                    InputStream in = getAssets().open("www" + p);
                    String mime = p.endsWith(".html") ? "text/html" : p.endsWith(".js") ? "application/javascript" : p.endsWith(".png") ? "image/png" : "application/octet-stream";
                    return new WebResourceResponse(mime, "utf-8", in);
                } catch (Exception e) { return null; }
            }
        });
        setContentView(web);
        hideBars();
        web.loadUrl("https://" + HOST + "/index.html");
    }

    private void hideBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) hideBars(); }
    @Override protected void onPause() { super.onPause(); web.evaluateJavascript("window.__onHostPause&&window.__onHostPause()", null); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
    @Override public void onBackPressed() { web.evaluateJavascript("window.__onBack?window.__onBack():false", v -> { if (!"true".equals(v)) moveTaskToBack(true); }); }

    class Bridge {
        @JavascriptInterface public void vibrate(int ms) {
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) v.vibrate(VibrationEffect.createOneShot(Math.max(5, Math.min(ms, 400)), VibrationEffect.DEFAULT_AMPLITUDE));
        }
        @JavascriptInterface public String platform() { return "android"; }
    }
}
