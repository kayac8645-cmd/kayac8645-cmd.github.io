/* ============================================================
   COMPUTE EMPIRE v13 — PERFORMANS YAMALARI (davranış aynı, hesap artımlı)
   ============================================================ */
// cmt10: "son kullanılan kalıplar" kümesi her yorumda baştan kuruluyordu → artımlı güncelleme
if (typeof c10Recent === 'function'){
  let P = null;
  c10Recent = function(S, within){
    const C = c10Ensure(S);
    const ok = P && P.C === C && P.day === S.day && P.w === within && P.recRef === C.rec && P.txRef === C.tx && C.rec.length >= P.n && C.tx.length >= P.t
      && (C.rec.length === P.n || C.rec[P.n - 1] === P.lastRec) && (C.tx.length === P.t || C.tx[P.t - 1] === P.lastTx);
    if (!ok){
      const set = new Set(), tx = new Set(C.tx);
      for (const r of C.rec) if (S.day - r[1] < within) set.add(r[0]);
      P = { C, day: S.day, w: within, recRef: C.rec, txRef: C.tx, n: C.rec.length, t: C.tx.length, r: { set, tx } };
    } else {
      for (let k = P.n; k < C.rec.length; k++){ const r = C.rec[k]; if (S.day - r[1] < within) P.r.set.add(r[0]); }
      for (let k = P.t; k < C.tx.length; k++) P.r.tx.add(C.tx[k]);
      P.n = C.rec.length; P.t = C.tx.length;
    }
    P.lastRec = C.rec[P.n - 1]; P.lastTx = C.tx[P.t - 1];
    return P.r;
  };
}
