/* 个人集成包 · 同步引擎
 * 数据端到端加密后，通过 GitHub Contents API 存到你的私有仓库。
 * 只在本机浏览器里保存你的 token；token 永远不会上传到本项目之外的任何地方。
 */
(function(){
  'use strict';
  var CFGKEY = 'lifehub_sync_config';
  var API = 'https://api.github.com';

  function getConfig(){
    try{
      var c = JSON.parse(localStorage.getItem(CFGKEY));
      if(c && c.owner && c.repo && c.token) return c;
    }catch(e){}
    return null;
  }
  function setConfig(c){ localStorage.setItem(CFGKEY, JSON.stringify(c || {})); }
  function enabled(){ return !!getConfig(); }

  function b64encode(s){
    var bytes = new TextEncoder().encode(s);
    var bin = '', chunk = 0x8000;
    for(var i=0;i<bytes.length;i+=chunk){ bin += String.fromCharCode.apply(null, bytes.subarray(i, i+chunk)); }
    return btoa(bin);
  }
  function b64decode(b){
    var bin = atob(b);
    var bytes = new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function encPath(p){ return p.split('/').map(encodeURIComponent).join('/'); }

  function headersFor(token){
    return {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  function req(method, path, body){
    var c = getConfig();
    if(!c) return Promise.reject(new Error('未配置同步'));
    var h = headersFor(c.token);
    if(body) h['Content-Type'] = 'application/json';
    return fetch(API + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined })
      .then(function(res){
        return res.json().catch(function(){ return {}; }).then(function(j){
          if(res.ok) return j;
          var err = new Error((j && j.message) || ('HTTP ' + res.status));
          err.status = res.status;
          throw err;
        });
      });
  }

  function repoPath(){ var c=getConfig(); return '/repos/' + encodeURIComponent(c.owner) + '/' + encodeURIComponent(c.repo); }

  function testConnection(owner, repo, token){
    return fetch(API + '/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repo), {
      headers: headersFor(token)
    }).then(function(res){
      return res.json().catch(function(){ return {}; }).then(function(j){
        if(res.ok) return { ok:true, full_name: j.full_name, private: j.private };
        var err = new Error((j && j.message) || ('HTTP ' + res.status));
        err.status = res.status;
        throw err;
      });
    });
  }

  // 读取文件：返回 { content(字符串), sha }，文件不存在返回 null
  function getFile(path){
    return req('GET', repoPath() + '/contents/' + encPath(path))
      .then(function(j){
        if(j && j.content != null && j.sha){
          return { content: b64decode(String(j.content).replace(/\n/g,'')), sha: j.sha };
        }
        return null;
      })
      .catch(function(e){
        if(e.status === 404) return null;
        throw e;
      });
  }

  function putFile(path, contentStr, message, sha){
    var body = { message: message || ('sync ' + new Date().toISOString()), content: b64encode(contentStr) };
    if(sha) body.sha = sha;
    return req('PUT', repoPath() + '/contents/' + encPath(path), body);
  }

  // 通用：上传一个字符串文件（保留冲突检测在调用方做）
  function pushFile(path, contentStr, message){
    return getFile(path).then(function(f){ return putFile(path, contentStr, message, f && f.sha); });
  }

  // —— 记账模块专用 ——
  // 无条件上传（sha 乐观锁；内容比对由调用方完成，不依赖设备时钟）
  function pushLedger(dbObj){
    if(!enabled()) return Promise.resolve(false);
    return pushFile('ledger/v1.json', JSON.stringify(dbObj), 'sync ledger').then(function(){ return true; });
  }

  function pullLedger(){
    if(!enabled()) return Promise.resolve(null);
    return getFile('ledger/v1.json').then(function(f){
      if(!f) return null;
      try{ return JSON.parse(f.content); }catch(e){ return null; }
    });
  }

  function expiryInfo(){
    var c = getConfig();
    if(!c) return { configured:false, days:null, expired:false, expiresAt:null };
    if(!c.expiresAt) return { configured:true, days:null, expired:false, expiresAt:null, permanent:true };
    var d = new Date(c.expiresAt + 'T00:00:00');
    var now = new Date(); now.setHours(0,0,0,0);
    var days = Math.round((d.getTime() - now.getTime()) / 86400000);
    return { configured:true, days:days, expired: days < 0, expiresAt:c.expiresAt, permanent:false };
  }

  window.LifeHubSync = {
    getConfig: getConfig, setConfig: setConfig, enabled: enabled,
    testConnection: testConnection,
    getFile: getFile, pushFile: pushFile,
    pushLedger: pushLedger, pullLedger: pullLedger,
    expiryInfo: expiryInfo
  };
})();
