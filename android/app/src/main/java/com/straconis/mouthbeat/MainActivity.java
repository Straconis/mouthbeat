package com.straconis.mouthbeat;

import android.app.Activity;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import org.json.JSONTokener;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
 private WebView web;
 private ValueCallback<Uri[]> fileCallback;
 private String pendingExport;
 private AudioManager audio;
 private AudioFocusRequest focus;
 private static final int IMPORT = 10, EXPORT = 11;
 private static final String HOST = "appassets.androidplatform.net";
 private boolean local(Uri uri) { return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost()) && uri.getPath()!=null && uri.getPath().startsWith("/assets/"); }
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  web = new WebView(this); web.setBackgroundColor(0xff101613); setContentView(web);
  web.setOnApplyWindowInsetsListener((view,insets)-> { view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom()); return insets; });
  WebSettings settings=web.getSettings(); settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false); settings.setAllowContentAccess(false); settings.setMediaPlaybackRequiresUserGesture(true);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  WebViewAssetLoader loader=new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
  web.setWebViewClient(new WebViewClient() {
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request) {
    WebResourceResponse response=loader.shouldInterceptRequest(request.getUrl());
    if(response!=null) {
     String path=request.getUrl().getPath();
     if(path!=null && (path.endsWith(".mjs") || path.endsWith(".js"))) response.setMimeType("text/javascript");
     return response;
    }
    return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",java.util.Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));
   }
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request) {
    Uri uri=request.getUrl();
    if("mouthbeat".equals(uri.getScheme()) && "export".equals(uri.getHost()) && request.isForMainFrame()) { exportPattern(); return true; }
    return !local(uri);
   }
  });
  web.setWebChromeClient(new WebChromeClient() {
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params) {
    if(fileCallback!=null) fileCallback.onReceiveValue(null);
    fileCallback=callback;
    Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
    startActivityForResult(intent,IMPORT); return true;
   }
  });
  audio=(AudioManager)getSystemService(AUDIO_SERVICE);
  focus=new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN).setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build()).setOnAudioFocusChangeListener(change->{if(change<0) stopAudio();}).build();
  web.loadUrl("https://"+HOST+"/assets/editor/index.html");
 }
 private void stopAudio() { if(web!=null) web.evaluateJavascript("document.getElementById('stop')?.click()",null); }
 private void exportPattern() {
  web.evaluateJavascript("document.getElementById('code').value",result->{
   try { Object value=new JSONTokener(result).nextValue(); if(!(value instanceof String)) return;
    pendingExport=(String)value; if(pendingExport.length()>100000) { pendingExport=null; return; }
    stopAudio();
    startActivityForResult(new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("text/plain").putExtra(Intent.EXTRA_TITLE,"mouthbeat-pattern.strudel"),EXPORT);
   } catch(Exception error) { Toast.makeText(this,"Could not export pattern",Toast.LENGTH_SHORT).show(); }
  });
 }
 @Override protected void onActivityResult(int request,int result,Intent data) {
  super.onActivityResult(request,result,data);
  if(request==IMPORT && fileCallback!=null) { fileCallback.onReceiveValue(result==RESULT_OK && data!=null && data.getData()!=null ? new Uri[]{data.getData()} : null); fileCallback=null; }
  if(request==EXPORT && pendingExport!=null) {
   if(result==RESULT_OK && data!=null && data.getData()!=null) {
    try(OutputStream out=getContentResolver().openOutputStream(data.getData())) { out.write(pendingExport.getBytes(StandardCharsets.UTF_8)); Toast.makeText(this,"Pattern saved",Toast.LENGTH_SHORT).show(); }
    catch(Exception error) { Toast.makeText(this,"Could not save pattern",Toast.LENGTH_LONG).show(); }
   }
   pendingExport=null;
  }
 }
 @Override protected void onPause() { stopAudio(); web.onPause(); audio.abandonAudioFocusRequest(focus); super.onPause(); }
 @Override protected void onResume() { super.onResume(); if(web!=null) { web.onResume(); audio.requestAudioFocus(focus); } }
 @Override public void onBackPressed() { if(web.canGoBack()) { stopAudio(); web.goBack(); } else super.onBackPressed(); }
 @Override protected void onDestroy() { if(fileCallback!=null) fileCallback.onReceiveValue(null); web.destroy(); super.onDestroy(); }
}
