/*
  binder.js — маленький движок привязки данных для лендинга heartfix.
  Разметка в index.html содержит:
    data-text="path"          — текст элемента берётся из данных
    data-bt-<attr>="..[[path]].." — атрибут (style, class, href, aria-*) собирается из данных
    data-bt-onclick="[[path]]"    — обработчик клика
    <template data-for="list" data-as="item"> — повтор блока для каждого элемента списка
    <template data-if="flag">                  — блок показывается, только если flag истинный
*/
(function () {
  'use strict';

  function get(ctx, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, ctx);
  }
  function single(t) {
    var m = /^\[\[([\w.$]+)\]\]$/.exec(t);
    return m ? m[1] : null;
  }
  function fillTemplate(t, ctx) {
    return t.replace(/\[\[([\w.$]+)\]\]/g, function (_, p) {
      var v = get(ctx, p);
      return v == null ? '' : String(v);
    });
  }

  function applyEl(el, ctx) {
    var attrs = Array.prototype.slice.call(el.attributes);
    for (var i = 0; i < attrs.length; i++) {
      var at = attrs[i];
      if (at.name.indexOf('data-bt-') !== 0) continue;
      var name = at.name.slice(8);
      var tpl = at.value;
      var p = single(tpl);
      if (name.indexOf('on') === 0) {
        var fn = p ? get(ctx, p) : null;
        el['on' + name.slice(2)] = typeof fn === 'function' ? function (f) { return function (e) { f(e); }; }(fn) : null;
        continue;
      }
      var v = p ? get(ctx, p) : fillTemplate(tpl, ctx);
      if (name === 'class') {
        var cls = v == null ? '' : String(v);
        if (el.getAttribute('class') !== cls) el.setAttribute('class', cls);
      } else if (typeof v === 'boolean') {
        if (name.indexOf('aria-') === 0) el.setAttribute(name, String(v));
        else if (v) el.setAttribute(name, '');
        else el.removeAttribute(name);
      } else if (v == null) {
        el.removeAttribute(name);
      } else if (el.getAttribute(name) !== String(v)) {
        el.setAttribute(name, String(v));
      }
    }
    if (el.hasAttribute('data-text')) {
      var tv = get(ctx, el.getAttribute('data-text'));
      var tx = tv == null ? '' : String(tv);
      if (el.textContent !== tx) el.textContent = tx;
    }
  }

  function bindTree(nodes) {
    var items = [];
    function walk(n) {
      if (n.nodeType !== 1) return;
      if (n.tagName === 'TEMPLATE') {
        if (n.hasAttribute('data-for')) items.push({ t: 'for', tpl: n, path: n.getAttribute('data-for'), as: n.getAttribute('data-as'), gen: [], kids: [], sig: null });
        else if (n.hasAttribute('data-if')) items.push({ t: 'if', tpl: n, path: n.getAttribute('data-if'), gen: [], kid: null, on: null });
        return;
      }
      var has = n.hasAttribute('data-text');
      if (!has) {
        for (var i = 0; i < n.attributes.length; i++) {
          if (n.attributes[i].name.indexOf('data-bt-') === 0) { has = true; break; }
        }
      }
      if (has) items.push({ t: 'el', el: n });
      var ch = n.children ? Array.prototype.slice.call(n.children) : [];
      for (var j = 0; j < ch.length; j++) walk(ch[j]);
    }
    nodes.forEach(walk);
    return items;
  }

  function clearGen(item) {
    item.gen.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    item.gen = [];
  }
  function stamp(item) {
    var frag = item.tpl.content.cloneNode(true);
    var nodes = Array.prototype.slice.call(frag.childNodes);
    var ref = item.tpl.nextSibling;
    var last = item.gen.length ? item.gen[item.gen.length - 1].nextSibling : ref;
    nodes.forEach(function (n) { item.tpl.parentNode.insertBefore(n, last); });
    item.gen = item.gen.concat(nodes);
    return bindTree(nodes);
  }
  function signature(list) {
    try {
      return JSON.stringify(list, function (k, v) { return typeof v === 'function' ? undefined : v; });
    } catch (e) { return String(Math.random()); }
  }

  function update(items, ctx) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.t === 'el') { applyEl(it.el, ctx); continue; }
      if (it.t === 'if') {
        var on = !!get(ctx, it.path);
        if (on !== it.on) {
          clearGen(it); it.kid = null;
          if (on) it.kid = stamp(it);
          it.on = on;
        }
        if (it.kid) update(it.kid, ctx);
        continue;
      }
      if (it.t === 'for') {
        var list = get(ctx, it.path) || [];
        var sig = signature(list);
        if (sig !== it.sig) {
          if (!(it.kids.length && it.kids.length === list.length)) {
            clearGen(it); it.kids = [];
            for (var k = 0; k < list.length; k++) it.kids.push(stamp(it));
          }
          it.sig = sig;
        }
        for (var q = 0; q < it.kids.length; q++) {
          var c = Object.create(ctx);
          c[it.as] = list[q];
          c.$index = q;
          update(it.kids[q], c);
        }
      }
    }
  }

  window.HFBinder = { bindTree: bindTree, update: update };
})();
