package com.mywishlist.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        String action = intent.getAction();
        String type = intent.getType();
        Uri data = intent.getData();

        // Gérer le Deep Link d'authentification Supabase
        if (Intent.ACTION_VIEW.equals(action) && data != null) {
            String scheme = data.getScheme();
            String host = data.getHost();

            if ("com.mywishlist.app".equals(scheme) && "login-callback".equals(host)) {
                handleAuthCallback(data);
                return;
            }
        }

        // Gérer le partage depuis d'autres apps (ex: Nike, Amazon, etc.)
        if (Intent.ACTION_SEND.equals(action) && type != null) {
            if ("text/plain".equals(type)) {
                handleSendText(intent);
            }
        }
    }

    private void handleAuthCallback(Uri data) {
        // Construire l'URL complète avec tous les paramètres (access_token, etc.)
        String fullUrl = data.toString();

        // Rediriger la WebView vers cette URL pour que Supabase puisse la traiter
        bridge.getWebView().post(() -> {
            String js = "window.location.href = '" + fullUrl.replace("com.mywishlist.app://", "https://mywishlist-ruddy.vercel.app/") + "';";
            bridge.getWebView().evaluateJavascript(js, null);
        });
    }

    private void handleSendText(Intent intent) {
        String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        String sharedTitle = intent.getStringExtra(Intent.EXTRA_SUBJECT);

        if (sharedText != null) {
            // Construire l'URL de redirection avec les paramètres
            StringBuilder urlBuilder = new StringBuilder("/add-product?shared=true");

            // Encoder l'URL partagée
            urlBuilder.append("&url=").append(Uri.encode(sharedText));

            // Ajouter le titre si présent
            if (sharedTitle != null && !sharedTitle.isEmpty()) {
                urlBuilder.append("&title=").append(Uri.encode(sharedTitle));
            }

            String targetUrl = urlBuilder.toString();

            // Utiliser JavaScript pour naviguer vers la bonne page
            String js = "window.location.href = '" + targetUrl + "';";

            // Attendre que le bridge soit prêt
            bridge.getWebView().post(() -> {
                bridge.getWebView().evaluateJavascript(js, null);
            });
        }
    }
}
