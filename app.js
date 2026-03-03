const STORAGE_KEY = "popToolSimple_v1";

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
    font: "gothic",
    name: "",
    ribbon: "",
    feats: "",
    points: "",
    price: "",
    offAmt: "",
    offPct: "",
    photoData: "",
    generatedCatch: [],
    generatedDesc: [],
    generatedChecks: [],
    selectedCatchIndex: 0,
    selectedDescIndex: 0,
    selectedChecksIndex: 0,
    previewHeadline: "",
    previewDescTitle: "",
    previewDesc: "",
    previewProduct: "",
    previewCheck1: "",
    previewCheck2: "",
    previewCheck3: "",
    previewCta: "ご興味のある方はスタッフまで♪"
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

/* ===== 候補生成 ===== */
function genCatch(name, feats) {
  const n = name || "新メニュー";
  const ks = splitWords(feats);
  const k1 = ks[0] || "ツヤ";
  const k2 = ks[1] || "まとまり";

  return [
    `${n}で、${k1}と${k2}を同時に実感。`,
    `今こそ試したい、${n}の新習慣。`,
    `${n}――“なんかいい”を、きちんと実感。`
  ];
}

function genDescTitle(name, feats) {
  const n = name || "このメニュー";
  const ks = splitWords(feats);
  if (ks.length >= 2) return `「${ks[0]}」×「${ks[1]}」が気になる方へ`;
  if (ks.length === 1) return `「${ks[0]}」が気になる方へ`;
  return `${n}の魅力をわかりやすく`;
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

/* ===== 入力画面 ===== */
function initIndexPage() {
  const data = loadData();

  const els = {
    font: $("#font"),
    f_name: $("#f_name"),
    f_ribbon: $("#f_ribbon"),
    f_feats: $("#f_feats"),
    f_points: $("#f_points"),
    f_price: $("#f_price"),
    f_offAmt: $("#f_offAmt"),
    f_offPct: $("#f_offPct"),
    f_photo: $("#f_photo"),
    generateText: $("#generateText"),
    apply: $("#apply"),
    openPreview: $("#openPreview"),
    aiArea: $("#aiArea"),

    v_headline: $("#v_headline"),
    v_ribbon: $("#v_ribbon"),
    v_descTitle: $("#v_descTitle"),
    v_desc: $("#v_desc"),
    v_product: $("#v_product"),
    v_before: $("#v_before"),
    v_discountLine: $("#v_discountLine"),
    v_now: $("#v_now"),
    v_check1: $("#v_check1"),
    v_check2: $("#v_check2"),
    v_check3: $("#v_check3"),
    v_cta: $("#v_cta"),
    photoImg: $("#photoImg"),
    stage: $("#stage")
  };

  function applyFontPreview(font) {
    if (!els.stage) return;
    const fam = {
      gothic: "'Noto Sans JP', sans-serif",
      mincho: "'Shippori Mincho','Noto Sans JP',serif",
      round: "'Kosugi Maru','Noto Sans JP',sans-serif"
    }[font] || "'Noto Sans JP', sans-serif";
    els.stage.style.fontFamily = fam;
  }

  function getFormData() {
    return {
      ...data,
      font: els.font?.value || "gothic",
      name: els.f_name?.value.trim() || "",
      ribbon: els.f_ribbon?.value.trim() || "",
      feats: els.f_feats?.value.trim() || "",
      points: els.f_points?.value.trim() || "",
      price: els.f_price?.value || "",
      offAmt: els.f_offAmt?.value || "",
      offPct: els.f_offPct?.value || ""
    };
  }

  function fillForm() {
    if (els.font) els.font.value = data.font || "gothic";
    if (els.f_name) els.f_name.value = data.name || "";
    if (els.f_ribbon) els.f_ribbon.value = data.ribbon || "";
    if (els.f_feats) els.f_feats.value = data.feats || "";
    if (els.f_points) els.f_points.value = data.points || "";
    if (els.f_price) els.f_price.value = data.price || "";
    if (els.f_offAmt) els.f_offAmt.value = data.offAmt || "";
    if (els.f_offPct) els.f_offPct.value = data.offPct || "";

    if (data.photoData && els.photoImg) {
      els.photoImg.src = data.photoData;
      els.photoImg.style.display = "block";
    }

    applyFontPreview(data.font);
    renderAiArea();
    renderPreview();
  }

  function renderAiArea() {
    if (!els.aiArea) return;

    const catchList = data.generatedCatch || [];
    const descList = data.generatedDesc || [];
    const checksList = data.generatedChecks || [];

    if (!catchList.length && !descList.length && !checksList.length) {
      els.aiArea.innerHTML = "※ 「文章候補を作る」を押すと、ここに候補が表示されます";
      return;
    }

    let html = "";

    if (catchList.length) {
      html += `<div style="margin:8px 0 6px;font-weight:800;">【キャッチコピー候補】</div>`;
      catchList.forEach((t, i) => {
        html += `<label>
          <input type="radio" name="optCatch" value="${i}" ${i === (data.selectedCatchIndex || 0) ? "checked" : ""}>
          ${t}
        </label>`;
      });
    }

    if (descList.length) {
      html += `<div style="margin:10px 0 6px;font-weight:800;">【説明文候補】</div>`;
      descList.forEach((t, i) => {
        html += `<label>
          <input type="radio" name="optDesc" value="${i}" ${i === (data.selectedDescIndex || 0) ? "checked" : ""}>
          ${t}
        </label>`;
      });
    }

    if (checksList.length) {
      html += `<div style="margin:10px 0 6px;font-weight:800;">【おすすめポイント候補】</div>`;
      checksList.forEach((arr, i) => {
        html += `<label>
          <input type="radio" name="optChecks" value="${i}" ${i === (data.selectedChecksIndex || 0) ? "checked" : ""}>
          ${arr.join(" ／ ")}
        </label>`;
      });
    }

    els.aiArea.innerHTML = html;

    $all('input[name="optCatch"]', els.aiArea).forEach(r => {
      r.addEventListener("change", () => {
        data.selectedCatchIndex = Number(r.value);
        data.previewHeadline = data.generatedCatch[data.selectedCatchIndex] || "";
        saveData(data);
        renderPreview();
      });
    });

    $all('input[name="optDesc"]', els.aiArea).forEach(r => {
      r.addEventListener("change", () => {
        data.selectedDescIndex = Number(r.value);
        data.previewDesc = data.generatedDesc[data.selectedDescIndex] || "";
        saveData(data);
        renderPreview();
      });
    });

    $all('input[name="optChecks"]', els.aiArea).forEach(r => {
      r.addEventListener("change", () => {
        data.selectedChecksIndex = Number(r.value);
        const checks = data.generatedChecks[data.selectedChecksIndex] || [];
        data.previewCheck1 = checks[0] || "";
        data.previewCheck2 = checks[1] || "";
        data.previewCheck3 = checks[2] || "";
        saveData(data);
        renderPreview();
      });
    });
  }

  function renderPreview() {
    const formData = getFormData();
    Object.assign(data, formData);
    saveData(data);

    const autoHeadline =
      data.generatedCatch[data.selectedCatchIndex || 0] ||
      "キャッチコピーをここに表示";

    const autoDescTitle = genDescTitle(data.name, data.feats);
    const autoDesc =
      data.generatedDesc[data.selectedDescIndex || 0] ||
      "ここに説明文が入ります。";

    const autoChecks =
      data.generatedChecks[data.selectedChecksIndex || 0] ||
      ["おすすめポイント1", "おすすめポイント2", "おすすめポイント3"];

    if (!data.previewHeadline) data.previewHeadline = autoHeadline;
    if (!data.previewDescTitle) data.previewDescTitle = autoDescTitle;
    if (!data.previewDesc) data.previewDesc = autoDesc;
    if (!data.previewProduct) data.previewProduct = data.name || "メニュー名・商品名がここに入ります";
    if (!data.previewCheck1) data.previewCheck1 = autoChecks[0];
    if (!data.previewCheck2) data.previewCheck2 = autoChecks[1];
    if (!data.previewCheck3) data.previewCheck3 = autoChecks[2];
    if (!data.previewCta) data.previewCta = "ご興味のある方はスタッフまで♪";

    if (els.v_headline) els.v_headline.textContent = data.previewHeadline;
    if (els.v_ribbon) els.v_ribbon.textContent = data.ribbon || "おすすめポイントを入力してください";
    if (els.v_descTitle) els.v_descTitle.textContent = data.previewDescTitle;
    if (els.v_desc) els.v_desc.textContent = data.previewDesc;
    if (els.v_product) els.v_product.textContent = data.previewProduct;
    if (els.v_cta) els.v_cta.textContent = data.previewCta;

    if (els.v_check1) els.v_check1.textContent = data.previewCheck1;
    if (els.v_check2) els.v_check2.textContent = data.previewCheck2;
    if (els.v_check3) els.v_check3.textContent = data.previewCheck3;

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

    saveData(data);
  }

  function generateTextOptions() {
    const current = getFormData();
    Object.assign(data, current);

    data.generatedCatch = genCatch(data.name, data.feats);
    data.generatedDesc = genDesc(data.name, data.points);
    data.generatedChecks = genChecks(data.name, data.feats, data.points);
    data.selectedCatchIndex = 0;
    data.selectedDescIndex = 0;
    data.selectedChecksIndex = 0;

    data.previewHeadline = data.generatedCatch[0] || "";
    data.previewDescTitle = genDescTitle(data.name, data.feats);
    data.previewDesc = data.generatedDesc[0] || "";

    const checks = data.generatedChecks[0] || [];
    data.previewCheck1 = checks[0] || "";
    data.previewCheck2 = checks[1] || "";
    data.previewCheck3 = checks[2] || "";

    if (!data.previewProduct) {
      data.previewProduct = data.name || "メニュー名・商品名がここに入ります";
    }

    saveData(data);
    renderAiArea();
    renderPreview();
  }

  function bindEditable(el, key) {
    if (!el) return;
    el.addEventListener("input", () => {
      data[key] = el.textContent.trim();
      saveData(data);
    });
  }

  [
    els.font, els.f_name, els.f_ribbon, els.f_feats,
    els.f_points, els.f_price, els.f_offAmt, els.f_offPct
  ].forEach(el => {
    if (!el) return;
    el.addEventListener("input", renderPreview);
    el.addEventListener("change", renderPreview);
  });

  if (els.generateText) els.generateText.addEventListener("click", generateTextOptions);
  if (els.apply) els.apply.addEventListener("click", renderPreview);

  if (els.openPreview) {
    els.openPreview.addEventListener("click", () => {
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

  bindEditable(els.v_headline, "previewHeadline");
  bindEditable(els.v_descTitle, "previewDescTitle");
  bindEditable(els.v_desc, "previewDesc");
  bindEditable(els.v_product, "previewProduct");
  bindEditable(els.v_check1, "previewCheck1");
  bindEditable(els.v_check2, "previewCheck2");
  bindEditable(els.v_check3, "previewCheck3");
  bindEditable(els.v_cta, "previewCta");

  fillForm();
}

/* ===== 印刷画面 ===== */
function initPreviewPage() {
  const data = loadData();

  function fontClass(font) {
    if (font === "mincho") return "font-mincho";
    if (font === "round") return "font-round";
    return "font-gothic";
  }

  function applyToPop(popEl) {
    if (!popEl) return;

    popEl.classList.remove("font-gothic", "font-mincho", "font-round");
    popEl.classList.add(fontClass(data.font));

    const autoHeadline =
      data.generatedCatch?.[data.selectedCatchIndex || 0] ||
      "キャッチコピーがここに入ります";

    const autoDescTitle = genDescTitle(data.name, data.feats);
    const autoDesc =
      data.generatedDesc?.[data.selectedDescIndex || 0] ||
      "説明文がここに入ります。";

    const autoChecks =
      data.generatedChecks?.[data.selectedChecksIndex || 0] ||
      ["おすすめポイント1", "おすすめポイント2", "おすすめポイント3"];

    $(".js-headline", popEl).textContent = data.previewHeadline || autoHeadline;
    $(".js-ribbon", popEl).textContent = data.ribbon || "おすすめポイント";
    $(".js-descTitle", popEl).textContent = data.previewDescTitle || autoDescTitle;
    $(".js-desc", popEl).textContent = data.previewDesc || autoDesc;
    $(".js-product", popEl).textContent = data.previewProduct || data.name || "商品名・メニュー名";
    $(".js-cta", popEl).textContent = data.previewCta || "ご興味のある方はスタッフまで♪";

    $(".js-check1", popEl).textContent = data.previewCheck1 || autoChecks[0];
    $(".js-check2", popEl).textContent = data.previewCheck2 || autoChecks[1];
    $(".js-check3", popEl).textContent = data.previewCheck3 || autoChecks[2];

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

    const photo = $(".js-photo", popEl);
    if (data.photoData) {
      photo.src = data.photoData;
      photo.style.display = "block";
    } else {
      photo.removeAttribute("src");
      photo.style.display = "none";
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
