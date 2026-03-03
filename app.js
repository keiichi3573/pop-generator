const STORAGE_KEY = "popToolData_v3";
const TEMPLATE_KEY = "popToolTemplates_v3";

function $(selector, root = document) {
  return root.querySelector(selector);
}
function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function yen(n) {
  return "¥" + Number(n).toLocaleString("ja-JP");
}

function splitWords(text = "") {
  return text.split(/[,、\n\/\s]+/).map(s => s.trim()).filter(Boolean);
}

function splitPoints(text = "") {
  return text.split(/[\n\/]+/).map(s => s.trim()).filter(Boolean);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getDefaultData() {
  return {
    theme: "lux",
    font: "gothic",
    swapped: false,
    name: "",
    ribbon: "",
    feats: "",
    points: "",
    headline: "",
    descManual: "",
    cta: "ご興味のある方はスタッフまで♪",
    price: "",
    offAmt: "",
    offPct: "",
    photoData: "",
    selectedCatchIndex: 0,
    selectedDescIndex: 0,
    selectedChecksIndex: 0,
    generatedCatch: [],
    generatedDesc: [],
    generatedChecks: []
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return { ...getDefaultData(), ...JSON.parse(raw) };
  } catch (e) {
    return getDefaultData();
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveTemplates(list) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(list));
}

/* ===== 候補生成 ===== */
function genCatch(name, feats) {
  const n = name || "新メニュー";
  const ks = splitWords(feats);
  const k1 = ks[0] || "ツヤ";
  const k2 = ks[1] || "うるおい";

  return [
    `${n}で、${k1}と${k2}を同時に実感。`,
    `今こそ試したい、${n}の新習慣。`,
    `${n}――“なんかいい”を、きちんと実感。`
  ];
}

function genDesc(name, points) {
  const n = name || "このメニュー";
  const ps = splitPoints(points);
  const p1 = ps[0] || "手触りの変化";
  const p2 = ps[1] || "まとまりやすさ";
  const p3 = ps[2] || "続けやすさ";

  return [
    `${n}は、${p1}・${p2}・${p3}を意識した、毎日に取り入れやすいケアです。`,
    `${p1}を感じながら、${p2}もしっかり。無理なく続けやすいのが特長です。`,
    `${n}は、${p1}だけでなく${p2}にも配慮。${p3}を求める方にもおすすめです。`
  ];
}

function genChecks(name, feats, points) {
  const ks = splitWords(feats);
  const ps = splitPoints(points);
  const n = name || "このメニュー";

  return [
    [
      `${ks[0] || "気になる悩み"}にアプローチ`,
      `${ks[1] || "仕上がり"}を意識した設計`,
      `${n}を初めて試す方にもおすすめ`
    ],
    [
      `${ps[0] || "使いやすさ"}を感じやすい`,
      `${ps[1] || "毎日のケア"}にも取り入れやすい`,
      `${ps[2] || "続けやすさ"}を重視したい方に`
    ],
    [
      `価格だけでなく“実感”で選びたい方へ`,
      `お店でのご案内にも使いやすい内容`,
      `まずは気軽に試してみたい方におすすめ`
    ]
  ];
}

/* ===== 入力ページ用 ===== */
function initIndexPage() {
  const data = loadData();

  const els = {
    theme: $("#theme"),
    font: $("#font"),
    swap: $("#swap"),
    gen: $("#gen"),
    apply: $("#apply"),
    pdfA4x2: $("#pdfA4x2"),
    btnGenLocal: $("#btnGenLocal"),
    aiArea: $("#aiArea"),

    f_name: $("#f_name"),
    f_ribbon: $("#f_ribbon"),
    f_feats: $("#f_feats"),
    f_points: $("#f_points"),
    f_headline: $("#f_headline"),
    f_descManual: $("#f_descManual"),
    f_cta: $("#f_cta"),
    f_price: $("#f_price"),
    f_offAmt: $("#f_offAmt"),
    f_offPct: $("#f_offPct"),
    f_photo: $("#f_photo"),

    btnSaveTemplate: $("#btnSaveTemplate"),
    btnLoadTemplate: $("#btnLoadTemplate"),
    btnDeleteTemplate: $("#btnDeleteTemplate"),
    templateSelect: $("#templateSelect"),

    v_headline: $("#v_headline"),
    v_ribbon: $("#v_ribbon"),
    v_descTitle: $("#v_descTitle"),
    v_desc: $("#v_desc"),
    v_product: $("#v_product"),
    v_before: $("#v_before"),
    v_discountLine: $("#v_discountLine"),
    v_now: $("#v_now"),
    v_checks: $("#v_checks"),
    photoImg: $("#photoImg"),
    middle: $("#middle"),
    v_ctaBox: $(".cta .box"),
    stage: $("#stage")
  };

  function applyThemePreview(theme) {
    if (!els.stage) return;
    els.stage.classList.remove("theme-normal", "theme-lux", "theme-pop");

    if (theme === "normal") els.stage.classList.add("theme-normal");
    else if (theme === "pop") els.stage.classList.add("theme-pop");
    else els.stage.classList.add("theme-lux");
  }

  function applyFontPreview(font) {
    if (!els.stage) return;
    const fam = {
      gothic: "'Noto Sans JP', sans-serif",
      mincho: "'Shippori Mincho','Noto Sans JP',serif",
      round: "'Kosugi Maru','Noto Sans JP',sans-serif",
      hand: "'Kosugi Maru','Noto Sans JP',sans-serif"
    }[font] || "'Noto Sans JP', sans-serif";
    els.stage.style.fontFamily = fam;
  }

  function getFormData() {
    return {
      ...data,
      theme: els.theme?.value || "lux",
      font: els.font?.value || "gothic",
      name: els.f_name?.value.trim() || "",
      ribbon: els.f_ribbon?.value.trim() || "",
      feats: els.f_feats?.value.trim() || "",
      points: els.f_points?.value.trim() || "",
      headline: els.f_headline?.value.trim() || "",
      descManual: els.f_descManual?.value.trim() || "",
      cta: els.f_cta?.value.trim() || "ご興味のある方はスタッフまで♪",
      price: els.f_price?.value || "",
      offAmt: els.f_offAmt?.value || "",
      offPct: els.f_offPct?.value || ""
    };
  }

  function fillForm() {
    if (els.theme) els.theme.value = data.theme || "lux";
    if (els.font) els.font.value = data.font || "gothic";
    if (els.f_name) els.f_name.value = data.name || "";
    if (els.f_ribbon) els.f_ribbon.value = data.ribbon || "";
    if (els.f_feats) els.f_feats.value = data.feats || "";
    if (els.f_points) els.f_points.value = data.points || "";
    if (els.f_headline) els.f_headline.value = data.headline || "";
    if (els.f_descManual) els.f_descManual.value = data.descManual || "";
    if (els.f_cta) els.f_cta.value = data.cta || "ご興味のある方はスタッフまで♪";
    if (els.f_price) els.f_price.value = data.price || "";
    if (els.f_offAmt) els.f_offAmt.value = data.offAmt || "";
    if (els.f_offPct) els.f_offPct.value = data.offPct || "";

    if (data.photoData && els.photoImg) {
      els.photoImg.src = data.photoData;
      els.photoImg.style.display = "block";
    }

    if (els.middle && data.swapped) {
      els.middle.classList.add("reverse");
    }

    applyThemePreview(data.theme);
    applyFontPreview(data.font);
    renderAiArea();
    renderPreview();
    renderTemplateOptions();
  }

  function renderAiArea() {
    if (!els.aiArea) return;

    const catchList = data.generatedCatch || [];
    const descList = data.generatedDesc || [];
    const checksList = data.generatedChecks || [];

    if (!catchList.length && !descList.length && !checksList.length) {
      els.aiArea.innerHTML = "※ 「キャッチコピー候補を3つ出す」でここに候補が表示されます";
      return;
    }

    let html = "";

    if (catchList.length) {
      html += `<div style="margin:8px 0 6px;font-weight:700;">【キャッチコピー候補を3つ出す】</div>`;
      catchList.forEach((t, i) => {
        html += `<label style="display:block;margin-bottom:6px;">
          <input type="radio" name="optCatch" value="${i}" ${i === (data.selectedCatchIndex || 0) ? "checked" : ""}>
          ${t}
        </label>`;
      });
    }

    if (descList.length) {
      html += `<div style="margin:10px 0 6px;font-weight:700;">【説明文を整える（3案）】</div>`;
      descList.forEach((t, i) => {
        html += `<label style="display:block;margin-bottom:6px;">
          <input type="radio" name="optDesc" value="${i}" ${i === (data.selectedDescIndex || 0) ? "checked" : ""}>
          ${t}
        </label>`;
      });
    }

    if (checksList.length) {
      html += `<div style="margin:10px 0 6px;font-weight:700;">【おすすめポイント3つ提案】</div>`;
      checksList.forEach((arr, i) => {
        html += `<label style="display:block;margin-bottom:6px;">
          <input type="radio" name="optChecks" value="${i}" ${i === (data.selectedChecksIndex || 0) ? "checked" : ""}>
          ${arr.join(" ／ ")}
        </label>`;
      });
    }

    els.aiArea.innerHTML = html;

    $all('input[name="optCatch"]', els.aiArea).forEach(r => {
      r.addEventListener("change", () => {
        data.selectedCatchIndex = Number(r.value);
        if (els.f_headline) els.f_headline.value = data.generatedCatch[data.selectedCatchIndex] || "";
        data.headline = els.f_headline.value;
        saveData(data);
        renderPreview();
      });
    });

    $all('input[name="optDesc"]', els.aiArea).forEach(r => {
      r.addEventListener("change", () => {
        data.selectedDescIndex = Number(r.value);
        saveData(data);
        renderPreview();
      });
    });

    $all('input[name="optChecks"]', els.aiArea).forEach(r => {
      r.addEventListener("change", () => {
        data.selectedChecksIndex = Number(r.value);
        saveData(data);
        renderPreview();
      });
    });
  }

  function renderPreview() {
    const formData = getFormData();
    Object.assign(data, formData);
    saveData(data);

    const catchText =
      data.headline ||
      data.generatedCatch[data.selectedCatchIndex || 0] ||
      "キャッチコピーをここに表示";

    const descText =
      data.descManual ||
      data.generatedDesc[data.selectedDescIndex || 0] ||
      data.points ||
      "ここに説明文が入ります。";

    const checks =
      data.generatedChecks[data.selectedChecksIndex || 0] ||
      ["おすすめポイント1", "おすすめポイント2", "おすすめポイント3"];

    const featWords = splitWords(data.feats);
    const descTitle = featWords.length
      ? `「${featWords.slice(0, 2).join("」×「")}」が気になる方へ`
      : "説明タイトルがここに入ります";

    if (els.v_headline) els.v_headline.textContent = catchText;
    if (els.v_ribbon) els.v_ribbon.textContent = data.ribbon || "おすすめポイントを入力してください";
    if (els.v_descTitle) els.v_descTitle.textContent = descTitle;
    if (els.v_desc) els.v_desc.textContent = descText;
    if (els.v_product) els.v_product.textContent = data.name || "メニュー名・商品名がここに入ります";
    if (els.v_ctaBox) els.v_ctaBox.textContent = data.cta || "ご興味のある方はスタッフまで♪";

    const price = Number(data.price || 0);
    let offAmt = Number(data.offAmt || 0);
    const offPct = Number(data.offPct || 0);

    if (!offAmt && offPct && price) {
      offAmt = Math.round(price * offPct / 100);
    }
    const now = Math.max(price - offAmt, 0);

    if (els.v_before) els.v_before.textContent = price ? `通常価格 ${yen(price)}` : "";
    if (els.v_discountLine) {
      els.v_discountLine.textContent = offAmt
        ? `今だけ！${yen(offAmt)}OFF`
        : offPct
        ? `今だけ！${offPct}%OFF`
        : "";
    }
    if (els.v_now) els.v_now.textContent = now ? `${yen(now)}（税込）` : "";

    if (els.v_checks) {
      els.v_checks.innerHTML = checks.map(t => `<li>${t}</li>`).join("");
    }

    applyThemePreview(data.theme);
    applyFontPreview(data.font);

    if (els.photoImg) {
      if (data.photoData) {
        els.photoImg.src = data.photoData;
        els.photoImg.style.display = "block";
      } else {
        els.photoImg.removeAttribute("src");
        els.photoImg.style.display = "none";
      }
    }
  }

  function generateAllOptions() {
    const current = getFormData();
    Object.assign(data, current);

    data.generatedCatch = genCatch(data.name, data.feats);
    data.generatedDesc = genDesc(data.name, data.points);
    data.generatedChecks = genChecks(data.name, data.feats, data.points);
    data.selectedCatchIndex = 0;
    data.selectedDescIndex = 0;
    data.selectedChecksIndex = 0;

    if (!data.headline && els.f_headline) {
      els.f_headline.value = data.generatedCatch[0];
      data.headline = data.generatedCatch[0];
    }

    saveData(data);
    renderAiArea();
    renderPreview();
  }

  function renderTemplateOptions() {
    if (!els.templateSelect) return;

    const list = loadTemplates();
    els.templateSelect.innerHTML = `<option value="">テンプレを選択</option>`;
    list.forEach((item, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = item.templateName || `テンプレ ${i + 1}`;
      els.templateSelect.appendChild(opt);
    });
  }

  function saveCurrentAsTemplate() {
    const name = prompt("テンプレ名を入力してください", data.name || "よく使うPOP");
    if (!name) return;

    const current = { ...getFormData() };
    delete current.photoData; // テンプレは軽くするため写真は除外
    current.templateName = name;

    const list = loadTemplates();
    list.push(current);
    saveTemplates(list);
    renderTemplateOptions();
    alert("テンプレ保存しました");
  }

  function loadSelectedTemplate() {
    if (!els.templateSelect || !els.templateSelect.value) {
      alert("テンプレを選択してください");
      return;
    }
    const idx = Number(els.templateSelect.value);
    const list = loadTemplates();
    const tpl = list[idx];
    if (!tpl) return;

    const keepPhoto = data.photoData;
    Object.assign(data, tpl);
    data.photoData = keepPhoto || data.photoData;

    saveData(data);
    fillForm();
    alert("テンプレを読み込みました");
  }

  function deleteSelectedTemplate() {
    if (!els.templateSelect || !els.templateSelect.value) {
      alert("削除するテンプレを選択してください");
      return;
    }
    const idx = Number(els.templateSelect.value);
    const list = loadTemplates();
    const target = list[idx];
    if (!target) return;

    if (!confirm(`「${target.templateName}」を削除しますか？`)) return;
    list.splice(idx, 1);
    saveTemplates(list);
    renderTemplateOptions();
    alert("削除しました");
  }

  /* イベント */
  [
    els.theme, els.font, els.f_name, els.f_ribbon, els.f_feats, els.f_points,
    els.f_headline, els.f_descManual, els.f_cta, els.f_price, els.f_offAmt, els.f_offPct
  ].forEach(el => {
    if (!el) return;
    el.addEventListener("input", renderPreview);
    el.addEventListener("change", renderPreview);
  });

  if (els.swap) {
    els.swap.addEventListener("click", () => {
      data.swapped = !data.swapped;
      if (els.middle) els.middle.classList.toggle("reverse", data.swapped);
      saveData(data);
    });
  }

  if (els.gen) els.gen.addEventListener("click", generateAllOptions);
  if (els.btnGenLocal) els.btnGenLocal.addEventListener("click", generateAllOptions);
  if (els.apply) els.apply.addEventListener("click", renderPreview);

  if (els.pdfA4x2) {
    els.pdfA4x2.addEventListener("click", () => {
      renderPreview();
      window.open("./preview.html", "_blank");
    });
  }

  if (els.f_photo) {
    els.f_photo.addEventListener("change", async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const base64 = await readFileAsDataURL(file);
      data.photoData = base64;
      saveData(data);
      renderPreview();
    });
  }

  if (els.btnSaveTemplate) els.btnSaveTemplate.addEventListener("click", saveCurrentAsTemplate);
  if (els.btnLoadTemplate) els.btnLoadTemplate.addEventListener("click", loadSelectedTemplate);
  if (els.btnDeleteTemplate) els.btnDeleteTemplate.addEventListener("click", deleteSelectedTemplate);

  fillForm();
}

/* ===== プレビュー画面用 ===== */
function initPreviewPage() {
  const data = loadData();

  function themeClass(theme) {
    if (theme === "normal") return "theme-normal";
    if (theme === "pop") return "theme-pop";
    return "theme-lux";
  }

  function fontClass(font) {
    if (font === "mincho") return "font-mincho";
    if (font === "round" || font === "hand") return "font-round";
    return "font-gothic";
  }

  function applyToPop(popEl) {
    if (!popEl) return;

    popEl.classList.remove("theme-normal", "theme-lux", "theme-pop", "font-gothic", "font-mincho", "font-round");
    popEl.classList.add(themeClass(data.theme), fontClass(data.font));

    const catchText =
      data.headline ||
      (data.generatedCatch?.[data.selectedCatchIndex || 0]) ||
      "キャッチコピーがここに入ります";

    const descText =
      data.descManual ||
      (data.generatedDesc?.[data.selectedDescIndex || 0]) ||
      data.points ||
      "説明文がここに入ります。";

    const checks =
      data.generatedChecks?.[data.selectedChecksIndex || 0] ||
      ["おすすめポイント1", "おすすめポイント2", "おすすめポイント3"];

    const featWords = splitWords(data.feats);
    const descTitle = featWords.length
      ? `「${featWords.slice(0, 2).join("」×「")}」が気になる方へ`
      : "説明タイトル";

    $(".js-headline", popEl).textContent = catchText;
    $(".js-ribbon", popEl).textContent = data.ribbon || "おすすめポイント";
    $(".js-descTitle", popEl).textContent = descTitle;
    $(".js-desc", popEl).textContent = descText;
    $(".js-product", popEl).textContent = data.name || "商品名・メニュー名";
    $(".js-cta", popEl).textContent = data.cta || "ご興味のある方はスタッフまで♪";

    const price = Number(data.price || 0);
    let offAmt = Number(data.offAmt || 0);
    const offPct = Number(data.offPct || 0);
    if (!offAmt && offPct && price) {
      offAmt = Math.round(price * offPct / 100);
    }
    const now = Math.max(price - offAmt, 0);

    $(".js-before", popEl).textContent = price ? `通常価格 ${yen(price)}` : "";
    $(".js-discount", popEl).textContent = offAmt
      ? `今だけ！${yen(offAmt)}OFF`
      : offPct
      ? `今だけ！${offPct}%OFF`
      : "";
    $(".js-now", popEl).textContent = now ? `${yen(now)}（税込）` : "";

    const checkWrap = $(".js-checks", popEl);
    checkWrap.innerHTML = checks.map(t => `<li>${t}</li>`).join("");

    const photo = $(".js-photo", popEl);
    if (data.photoData) {
      photo.src = data.photoData;
      photo.style.display = "block";
    } else {
      photo.removeAttribute("src");
      photo.style.display = "none";
    }

    const middle = popEl.querySelector(".middle");
    if (middle) {
      middle.classList.toggle("reverse", !!data.swapped);
    }
  }

  applyToPop($("#pop1"));
  applyToPop($("#pop2"));

  const backBtn = $("#backBtn");
  const printBtn = $("#printBtn");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "./index.html";
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
}

/* ===== 起動 ===== */
document.addEventListener("DOMContentLoaded", () => {
  if ($("#pop1") && $("#pop2")) {
    initPreviewPage();
  } else {
    initIndexPage();
  }
});
