import { useState, useMemo, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

// ── Initial Data ──────────────────────────────────────────────
const INITIAL_INVENTORY = [
  { code: "018-1021", name: "ダイナロックⅢ ムエンエローⅡ", category: "ダイナロックⅢ", stock: 21900, minStock: 5000, unit: "g" },
  { code: "018-1024", name: "ダイナロックⅢ ムエンファインエローⅡ", category: "ダイナロックⅢ", stock: 13500, minStock: 5000, unit: "g" },
  { code: "018-1025", name: "ダイナロックⅢ ムエンメジアムエローⅡ", category: "ダイナロックⅢ", stock: 25800, minStock: 5000, unit: "g" },
  { code: "018-1029", name: "ダイナロックⅢ ムエンオレンジⅢ", category: "ダイナロックⅢ", stock: 25100, minStock: 5000, unit: "g" },
  { code: "018-1036", name: "ダイナロックⅢ バイオレッドⅡ", category: "ダイナロックⅢ", stock: 29900, minStock: 5000, unit: "g" },
  { code: "018-1040", name: "ダイナロックⅢ シンレッドⅡ", category: "ダイナロックⅢ", stock: 6200, minStock: 5000, unit: "g" },
  { code: "018-1075", name: "ダイナロックⅢ シアニングリーンⅡ", category: "ダイナロックⅢ", stock: 7000, minStock: 5000, unit: "g" },
  { code: "018-1080", name: "ダイナロックⅢ ロイヤルブルーⅡ", category: "ダイナロックⅢ", stock: 6000, minStock: 5000, unit: "g" },
  { code: "018-1095", name: "ダイナロックⅢ フラットベースⅡ", category: "ダイナロックⅢ", stock: 12720, minStock: 5000, unit: "g" },
  { code: "018-1204", name: "ダイナロックⅢ ハイホワイトⅡ", category: "ダイナロックⅢ", stock: 12100, minStock: 5000, unit: "g" },
  { code: "018-1210", name: "ダイナロックⅢ レッドⅡ", category: "ダイナロックⅢ", stock: 4000, minStock: 5000, unit: "g" },
  { code: "018-1225", name: "ダイナロックⅢ オキサイドレッドⅡ", category: "ダイナロックⅢ", stock: 42300, minStock: 5000, unit: "g" },
  { code: "018-1233", name: "ダイナロックⅢ オーカーⅡ", category: "ダイナロックⅢ", stock: 36700, minStock: 5000, unit: "g" },
  { code: "018-1234", name: "ダイナロックⅢ ブラック", category: "ダイナロックⅢ", stock: 22200, minStock: 5000, unit: "g" },
  { code: "051-4103", name: "ユニバーサルベース フレッシュメタリック", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4303", name: "パールベース R", category: "パールベース", stock: 830, minStock: 100, unit: "g" },
  { code: "051-4304", name: "パールベース B", category: "パールベース", stock: 965, minStock: 100, unit: "g" },
  { code: "051-4305", name: "パールベース C", category: "パールベース", stock: 300, minStock: 100, unit: "g" },
  { code: "051-4306", name: "パールベース P", category: "パールベース", stock: 460, minStock: 100, unit: "g" },
  { code: "051-4308", name: "パールベース 2B", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4310", name: "パールベース 3B", category: "パールベース", stock: 685, minStock: 100, unit: "g" },
  { code: "051-4313", name: "パールベース 2C", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4314", name: "パールベース 2R", category: "パールベース", stock: 219, minStock: 100, unit: "g" },
  { code: "051-4315", name: "パールベース V", category: "パールベース", stock: 260, minStock: 100, unit: "g" },
  { code: "051-4316", name: "パールベース G", category: "パールベース", stock: 170, minStock: 100, unit: "g" },
  { code: "051-4317", name: "パールベース 2G", category: "パールベース", stock: 170, minStock: 100, unit: "g" },
  { code: "051-4320", name: "パールベース 5W", category: "パールベース", stock: 600, minStock: 100, unit: "g" },
  { code: "051-4321", name: "パールベース 4B", category: "パールベース", stock: 440, minStock: 100, unit: "g" },
  { code: "051-4325", name: "パールベース 3Y", category: "パールベース", stock: 680, minStock: 100, unit: "g" },
  { code: "051-4326", name: "パールベース 6W", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4327", name: "パールベース 3G", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4328", name: "パールベース 7W", category: "パールベース", stock: 310, minStock: 100, unit: "g" },
  { code: "051-4330", name: "パールベース 8W", category: "パールベース", stock: 600, minStock: 100, unit: "g" },
  { code: "051-4331", name: "パールベース 5G", category: "パールベース", stock: 225, minStock: 100, unit: "g" },
  { code: "051-4332", name: "パールベース 3C", category: "パールベース", stock: 468, minStock: 100, unit: "g" },
  { code: "051-4333", name: "パールベース 5R", category: "パールベース", stock: 90, minStock: 100, unit: "g" },
  { code: "051-4334", name: "パールベース 5Y", category: "パールベース", stock: 102, minStock: 100, unit: "g" },
  { code: "051-4335", name: "パールベース YC", category: "パールベース", stock: 600, minStock: 100, unit: "g" },
  { code: "051-4336", name: "パールベース 5B", category: "パールベース", stock: 740, minStock: 100, unit: "g" },
  { code: "051-4337", name: "パールベース 2V", category: "パールベース", stock: 300, minStock: 100, unit: "g" },
  { code: "051-4338", name: "パールベース 6G", category: "パールベース", stock: 280, minStock: 100, unit: "g" },
  { code: "051-4339", name: "パールベース 2P", category: "パールベース", stock: 390, minStock: 100, unit: "g" },
  { code: "051-4340", name: "パールベース GV", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4341", name: "パールベース GL", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4342", name: "パールベース 3V", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4343", name: "パールベース 9W", category: "パールベース", stock: 321, minStock: 100, unit: "g" },
  { code: "051-4344", name: "パールベース PS", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4345", name: "パールベース 2BG", category: "パールベース", stock: 300, minStock: 100, unit: "g" },
  { code: "051-4346", name: "パールベース OG", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4351", name: "パールベース W", category: "パールベース", stock: 470, minStock: 100, unit: "g" },
  { code: "051-4359", name: "パールベース 3W", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4361", name: "パールベース 4W", category: "パールベース", stock: 210, minStock: 100, unit: "g" },
  { code: "051-4363", name: "パールベース 10W", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4402", name: "グラファイトベース メジアム", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4408", name: "パールベース 6G(B)", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4410", name: "クリスタルフレークファイン", category: "パールベース", stock: 635, minStock: 100, unit: "g" },
  { code: "051-4454", name: "メタリックベース ゴールド", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4455", name: "メタリックベース オレンジ", category: "パールベース", stock: 0, minStock: 100, unit: "g" },
  { code: "051-4470", name: "ロッククロマ グリーンパープル", category: "パールベース", stock: 0, minStock: 0, unit: "g" },
  { code: "051-4471", name: "ロッククロマ シルバーグリーン", category: "パールベース", stock: 0, minStock: 0, unit: "g" },
  { code: "051-4472", name: "ロッククロマ ブルーレッド", category: "パールベース", stock: 82, minStock: 0, unit: "g" },
  { code: "051-4473", name: "ロッククロマ マゼンタゴールド", category: "パールベース", stock: 0, minStock: 0, unit: "g" },
  { code: "051-4474", name: "ロッククロマ レッドゴールド", category: "パールベース", stock: 0, minStock: 0, unit: "g" },
  { code: "051-4475", name: "ロッククロマ ゴールドシルバー", category: "パールベース", stock: 0, minStock: 0, unit: "g" },
  { code: "051-4476", name: "ロッククロマ シアンパープル", category: "パールベース", stock: 0, minStock: 0, unit: "g" },
  { code: "051-4479", name: "ロッククロマ レインボーファイン", category: "パールベース", stock: 0, minStock: 0, unit: "g" },
  { code: "073-5001", name: "ハイロックECO スタビライザー", category: "ハイロックECO", stock: 0, minStock: 1000, unit: "g" },
  { code: "073-5010", name: "ハイロックECO ブライトレッド", category: "ハイロックECO", stock: 1980, minStock: 1000, unit: "g" },
  { code: "073-5011", name: "ハイロックECO ビビッドレッド", category: "ハイロックECO", stock: 13900, minStock: 8000, unit: "g" },
  { code: "073-5017", name: "ハイロックECO ディープマルーン", category: "ハイロックECO", stock: 5240, minStock: 1000, unit: "g" },
  { code: "073-5030", name: "ハイロックECO チンチングブラック", category: "ハイロックECO", stock: 24900, minStock: 8000, unit: "g" },
  { code: "073-5036", name: "ハイロックECO ファーストバイオレット", category: "ハイロックECO", stock: 4370, minStock: 1000, unit: "g" },
  { code: "073-5039", name: "ハイロックECO スーパーレッド", category: "ハイロックECO", stock: 4770, minStock: 1000, unit: "g" },
  { code: "073-5047", name: "ハイロックECO ガーネットレッド", category: "ハイロックECO", stock: 3600, minStock: 1000, unit: "g" },
  { code: "073-5048", name: "ハイロックECO マゼンタ", category: "ハイロックECO", stock: 5060, minStock: 1000, unit: "g" },
  { code: "073-5053", name: "ハイロックECO オーガニックオレンジ", category: "ハイロックECO", stock: 4320, minStock: 1000, unit: "g" },
  { code: "073-5054", name: "ハイロックECO サニーエロー", category: "ハイロックECO", stock: 9610, minStock: 1000, unit: "g" },
  { code: "073-5056", name: "ハイロックECO ブライトエロー", category: "ハイロックECO", stock: 5580, minStock: 1000, unit: "g" },
  { code: "073-5057", name: "ハイロックECO インドオレンジ", category: "ハイロックECO", stock: 3600, minStock: 1000, unit: "g" },
  { code: "073-5062", name: "ハイロックECO ビビッドエロー", category: "ハイロックECO", stock: 3614, minStock: 8000, unit: "g" },
  { code: "073-5064", name: "ハイロックECO トランスエロー", category: "ハイロックECO", stock: 3600, minStock: 1000, unit: "g" },
  { code: "073-5069", name: "ハイロックECO マホガニー", category: "ハイロックECO", stock: 3600, minStock: 1000, unit: "g" },
  { code: "073-5070", name: "ハイロックECO フェリックレッド", category: "ハイロックECO", stock: 3470, minStock: 1000, unit: "g" },
  { code: "073-5071", name: "ハイロックECO フレッシュブルー", category: "ハイロックECO", stock: 6320, minStock: 1000, unit: "g" },
  { code: "073-5072", name: "ハイロックECO レイクブルー", category: "ハイロックECO", stock: 3600, minStock: 1000, unit: "g" },
  { code: "073-5076", name: "ハイロックECO シアニングリーン", category: "ハイロックECO", stock: 13100, minStock: 8000, unit: "g" },
  { code: "073-5077", name: "ハイロックECO Y.S.グリーン", category: "ハイロックECO", stock: 3370, minStock: 1000, unit: "g" },
  { code: "073-5078", name: "ハイロックECO ディープブルー", category: "ハイロックECO", stock: 21700, minStock: 8000, unit: "g" },
  { code: "073-5079", name: "ハイロックECO シアニンブルー", category: "ハイロックECO", stock: 4730, minStock: 1000, unit: "g" },
  { code: "073-5080", name: "ハイロックECO ロイヤルブルー", category: "ハイロックECO", stock: 3590, minStock: 1000, unit: "g" },
  { code: "073-5082", name: "ハイロックECO オリエントブルー", category: "ハイロックECO", stock: 6460, minStock: 1000, unit: "g" },
  { code: "073-5083", name: "ハイロックECO インダスレンブルー", category: "ハイロックECO", stock: 6400, minStock: 1000, unit: "g" },
  { code: "073-5085", name: "ハイロックECO メジアムメタリック", category: "ハイロックECO", stock: 3600, minStock: 2000, unit: "g" },
  { code: "073-5086", name: "ハイロックECO ファインメタリック", category: "ハイロックECO", stock: 11460, minStock: 1000, unit: "g" },
  { code: "073-5087", name: "ハイロックECO コースメタリック", category: "ハイロックECO", stock: 5620, minStock: 1000, unit: "g" },
  { code: "073-5088", name: "ハイロックECO ブライトメタリック", category: "ハイロックECO", stock: 4570, minStock: 1000, unit: "g" },
  { code: "073-5094", name: "ハイロックECO ホワイトメタリック", category: "ハイロックECO", stock: 11630, minStock: 1000, unit: "g" },
  { code: "073-5095", name: "ハイロックECO フラットベース", category: "ハイロックECO", stock: 15100, minStock: 3000, unit: "g" },
  { code: "073-5098", name: "ハイロックECO ハイホワイトメタリック", category: "ハイロックECO", stock: 5550, minStock: 1000, unit: "g" },
  { code: "073-5110", name: "ハイロックECO 硬化剤", category: "ハイロックECO", stock: 5000, minStock: 2000, unit: "g" },
  { code: "073-5130", name: "ハイロックECO 硬化剤 遅乾型", category: "ハイロックECO", stock: 4000, minStock: 500, unit: "g" },
  { code: "073-5150", name: "ハイロックECO クリヤー", category: "ハイロックECO", stock: 12000, minStock: 8000, unit: "g" },
  { code: "073-5201", name: "ハイロックECO オパールホワイト", category: "ハイロックECO", stock: 3540, minStock: 1000, unit: "g" },
  { code: "073-5204", name: "ハイロックECO ホワイト", category: "ハイロックECO", stock: 19900, minStock: 8000, unit: "g" },
  { code: "073-5210", name: "ハイロックECO レッド", category: "ハイロックECO", stock: 14500, minStock: 8000, unit: "g" },
  { code: "073-5223", name: "ハイロックECO オーカー", category: "ハイロックECO", stock: 15100, minStock: 1000, unit: "g" },
  { code: "073-5225", name: "ハイロックECO オキサイドレッド", category: "ハイロックECO", stock: 5930, minStock: 1000, unit: "g" },
  { code: "073-5234", name: "ハイロックECO ブラック", category: "ハイロックECO", stock: 23000, minStock: 8000, unit: "g" },
  { code: "073-5250", name: "ハイロックECO ゼットブラック", category: "ハイロックECO", stock: 3220, minStock: 1000, unit: "g" },
  { code: "073-5404", name: "ハイロックECO スターサンドメタリック", category: "ハイロックECO", stock: 3600, minStock: 1000, unit: "g" },
  { code: "073-5405", name: "ハイロックECO スノーファインメタリック", category: "ハイロックECO", stock: 2450, minStock: 1000, unit: "g" },
  { code: "073-5406", name: "ハイロックECO スノーメジアムメタリック", category: "ハイロックECO", stock: 7880, minStock: 1000, unit: "g" },
  { code: "073-5407", name: "ハイロックECO スノーコースメタリック", category: "ハイロックECO", stock: 7320, minStock: 1000, unit: "g" },
  { code: "073-5409", name: "ハイロックECO スターメタリックコース", category: "ハイロックECO", stock: 11060, minStock: 1000, unit: "g" },
  { code: "073-5550", name: "ハイロックECO HGサンライズオレンジ", category: "ハイロックECO", stock: 5960, minStock: 1000, unit: "g" },
  { code: "073-5551", name: "ハイロックECO HGストロングエロー", category: "ハイロックECO", stock: 4180, minStock: 1000, unit: "g" },
  { code: "073-5557", name: "ハイロックECO HGインドオレンジ", category: "ハイロックECO", stock: 6120, minStock: 1000, unit: "g" },
  { code: "073-5561", name: "ハイロックECO HGパッションエロー", category: "ハイロックECO", stock: 4980, minStock: 1000, unit: "g" },
  { code: "077-0010", name: "プロタッチ ブライトレッド", category: "プロタッチ", stock: 257, minStock: 500, unit: "g" },
  { code: "077-0011", name: "プロタッチ ビビッドレッド", category: "プロタッチ", stock: 837, minStock: 500, unit: "g" },
  { code: "077-0016", name: "プロタッチ リッチマルーン", category: "プロタッチ", stock: 220, minStock: 500, unit: "g" },
  { code: "077-0017", name: "プロタッチ ディープマルーン", category: "プロタッチ", stock: 1420, minStock: 500, unit: "g" },
  { code: "077-0030", name: "プロタッチ チンチングブラック", category: "プロタッチ", stock: 4180, minStock: 2000, unit: "g" },
  { code: "077-0034", name: "プロタッチ フレッシュレッド", category: "プロタッチ", stock: 772, minStock: 500, unit: "g" },
  { code: "077-0036", name: "プロタッチ ファーストバイオレット", category: "プロタッチ", stock: 1950, minStock: 500, unit: "g" },
  { code: "077-0039", name: "プロタッチ スーパーレッド", category: "プロタッチ", stock: 1860, minStock: 500, unit: "g" },
  { code: "077-0047", name: "プロタッチ ガーネットレッド", category: "プロタッチ", stock: 634, minStock: 500, unit: "g" },
  { code: "077-0048", name: "プロタッチ マゼンタ", category: "プロタッチ", stock: 577, minStock: 500, unit: "g" },
  { code: "077-0049", name: "プロタッチ ローズレッド", category: "プロタッチ", stock: 1038, minStock: 500, unit: "g" },
  { code: "077-0053", name: "プロタッチ オーガニックオレンジ", category: "プロタッチ", stock: 868, minStock: 500, unit: "g" },
  { code: "077-0054", name: "プロタッチ サニーエロー", category: "プロタッチ", stock: 266, minStock: 100, unit: "g" },
  { code: "077-0056", name: "プロタッチ ブライトエロー", category: "プロタッチ", stock: 255, minStock: 500, unit: "g" },
  { code: "077-0057", name: "プロタッチ インドオレンジ", category: "プロタッチ", stock: 640, minStock: 500, unit: "g" },
  { code: "077-0059", name: "プロタッチ インドエロー", category: "プロタッチ", stock: 174, minStock: 500, unit: "g" },
  { code: "077-0062", name: "プロタッチ ビビッドエロー", category: "プロタッチ", stock: 593, minStock: 500, unit: "g" },
  { code: "077-0064", name: "プロタッチ トランスエロー", category: "プロタッチ", stock: 463, minStock: 500, unit: "g" },
  { code: "077-0067", name: "プロタッチ ベネチアンレッド", category: "プロタッチ", stock: 910, minStock: 100, unit: "g" },
  { code: "077-0069", name: "プロタッチ マホガニー", category: "プロタッチ", stock: 900, minStock: 500, unit: "g" },
  { code: "077-0070", name: "プロタッチ フェリックレッド", category: "プロタッチ", stock: 540, minStock: 500, unit: "g" },
  { code: "077-0071", name: "プロタッチ フレッシュブルー", category: "プロタッチ", stock: 1400, minStock: 500, unit: "g" },
  { code: "077-0072", name: "プロタッチ レイクブルー", category: "プロタッチ", stock: 340, minStock: 500, unit: "g" },
  { code: "077-0073", name: "プロタッチ ライムグリーン", category: "プロタッチ", stock: 1090, minStock: 100, unit: "g" },
  { code: "077-0076", name: "プロタッチ シアニングリーン", category: "プロタッチ", stock: 430, minStock: 500, unit: "g" },
  { code: "077-0077", name: "プロタッチ Y.S.グリーン", category: "プロタッチ", stock: 720, minStock: 500, unit: "g" },
  { code: "077-0078", name: "プロタッチ ディープブルー", category: "プロタッチ", stock: 1035, minStock: 500, unit: "g" },
  { code: "077-0079", name: "プロタッチ シアニンブルー", category: "プロタッチ", stock: 1080, minStock: 500, unit: "g" },
  { code: "077-0082", name: "プロタッチ オリエントブルー", category: "プロタッチ", stock: 1420, minStock: 500, unit: "g" },
  { code: "077-0083", name: "プロタッチ インダンスレンブルー", category: "プロタッチ", stock: 2200, minStock: 500, unit: "g" },
  { code: "077-0085", name: "プロタッチ メジアムメタリック", category: "プロタッチ", stock: 0, minStock: 500, unit: "g" },
  { code: "077-0086", name: "プロタッチ ファインメタリック", category: "プロタッチ", stock: 4500, minStock: 2000, unit: "g" },
  { code: "077-0087", name: "プロタッチ コースメタリック", category: "プロタッチ", stock: 0, minStock: 2000, unit: "g" },
  { code: "077-0088", name: "プロタッチ ブライトメタリック", category: "プロタッチ", stock: 3280, minStock: 2000, unit: "g" },
  { code: "077-0093", name: "プロタッチ スパークルメタリック", category: "プロタッチ", stock: 0, minStock: 2000, unit: "g" },
  { code: "077-0094", name: "プロタッチ ホワイトメタリック", category: "プロタッチ", stock: 2250, minStock: 2000, unit: "g" },
  { code: "077-0095", name: "プロタッチ フラットベース", category: "プロタッチ", stock: 4147, minStock: 2000, unit: "g" },
  { code: "077-0096", name: "プロタッチ スターファインメタリック", category: "プロタッチ", stock: 790, minStock: 500, unit: "g" },
  { code: "077-0099", name: "プロタッチ シャイニーメタリック", category: "プロタッチ", stock: 2948, minStock: 2000, unit: "g" },
  { code: "077-0201", name: "プロタッチ オパールホワイト", category: "プロタッチ", stock: 530, minStock: 500, unit: "g" },
  { code: "077-0204", name: "プロタッチ ホワイト", category: "プロタッチ", stock: 15000, minStock: 8000, unit: "g" },
  { code: "077-0225", name: "プロタッチ オキサイドレッド", category: "プロタッチ", stock: 1208, minStock: 500, unit: "g" },
  { code: "077-0233", name: "プロタッチ オーカー", category: "プロタッチ", stock: 1920, minStock: 500, unit: "g" },
  { code: "077-0234", name: "プロタッチ ブラック", category: "プロタッチ", stock: 6140, minStock: 2000, unit: "g" },
  { code: "077-0250", name: "プロタッチ ゼットブラック", category: "プロタッチ", stock: 3370, minStock: 2000, unit: "g" },
  { code: "077-0452", name: "プロタッチ ゴールドメジアムメタリック", category: "プロタッチ", stock: 0, minStock: 500, unit: "g" },
  { code: "077-0453", name: "プロタッチ オレンジファインM", category: "プロタッチ", stock: 732, minStock: 500, unit: "g" },
  { code: "077-1011", name: "HGビビッドレッド", category: "プロタッチ", stock: 694, minStock: 300, unit: "g" },
  { code: "077-4003", name: "プロタッチ スターホワイトメタリック", category: "プロタッチ", stock: 268, minStock: 500, unit: "g" },
  { code: "077-4004", name: "プロタッチ スターサンドメタリック", category: "プロタッチ", stock: 1100, minStock: 500, unit: "g" },
  { code: "077-4005", name: "プロタッチ スノーファインメタリック", category: "プロタッチ", stock: 1189, minStock: 500, unit: "g" },
  { code: "077-4006", name: "プロタッチ スノーメジアムメタリック", category: "プロタッチ", stock: 6600, minStock: 2000, unit: "g" },
  { code: "077-4007", name: "プロタッチ スノーコースメタリック", category: "プロタッチ", stock: 1860, minStock: 2000, unit: "g" },
  { code: "077-4008", name: "プロタッチ サニーメタリック", category: "プロタッチ", stock: 1410, minStock: 2000, unit: "g" },
  { code: "077-4009", name: "プロタッチ スターメタリックコース", category: "プロタッチ", stock: 2940, minStock: 2000, unit: "g" },
  { code: "077-4051", name: "プロタッチ シルキーメタリック", category: "プロタッチ", stock: 800, minStock: 500, unit: "g" },
  { code: "077-4053", name: "プロタッチ ブリリアンメタリック", category: "プロタッチ", stock: 0, minStock: 500, unit: "g" },
  { code: "077-P150", name: "プロタッチ ニゴリクリヤーP", category: "プロタッチ", stock: 5270, minStock: 2000, unit: "g" },
  { code: "077-T030", name: "プロタッチ チンチングブラック 1/10", category: "プロタッチ", stock: 366, minStock: 100, unit: "g" },
  { code: "077-T077", name: "プロタッチ Y.S.グリーン 1/10", category: "プロタッチ", stock: 208, minStock: 100, unit: "g" },
  { code: "077-T080", name: "プロタッチ ロイヤルブルー 1/10", category: "プロタッチ", stock: 237, minStock: 100, unit: "g" },
  { code: "077-T225", name: "プロタッチ オキサイドレッド 1/10", category: "プロタッチ", stock: 260, minStock: 100, unit: "g" },
];

// ── Helpers ───────────────────────────────────────────────────
const fmtG = (n) => n.toLocaleString() + "g";
const today = new Date().toISOString().slice(0, 10);

function StockBar({ stock, minStock }) {
  if (minStock === 0) return null;
  const pct = Math.min(100, Math.round((stock / (minStock * 4)) * 100));
  const low  = stock < minStock;
  const warn = !low && stock < minStock * 1.5;
  const color = low ? "#ef4444" : warn ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#1e293b", borderRadius: 99 }}>
        <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 99, transition: "width .4s" }} />
      </div>
      <span style={{ fontSize: 11, color, minWidth: 36, textAlign: "right", fontWeight: 700 }}>
        {low ? "要発注" : warn ? "注意" : "OK"}
      </span>
    </div>
  );
}

// ── Page 1: 在庫一覧 ──────────────────────────────────────────
function InventoryPage({ inventory, setInventory, canEdit }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("すべて");
  const [showLow, setShowLow] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ code: "", name: "", category: "", stock: "", minStock: "" });
  const [addError, setAddError] = useState("");

  const categories = ["すべて", ...Array.from(new Set(inventory.map(i => i.category)))];

  const filtered = useMemo(() => inventory.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
    const matchCat = catFilter === "すべて" || item.category === catFilter;
    const matchLow = !showLow || item.stock < item.minStock * 1.5;
    return matchSearch && matchCat && matchLow;
  }), [inventory, search, catFilter, showLow]);

  const lowCount  = inventory.filter(i => i.minStock > 0 && i.stock < i.minStock).length;
  const warnCount = inventory.filter(i => i.minStock > 0 && i.stock >= i.minStock && i.stock < i.minStock * 1.5).length;
  const okCount   = inventory.filter(i => i.minStock === 0 || i.stock >= i.minStock * 1.5).length;

  const handleAddItem = () => {
    setAddError("");
    if (!newItem.code.trim() || !newItem.name.trim()) {
      setAddError("品目コードと品目名は必須です");
      return;
    }
    if (inventory.some(i => i.code === newItem.code.trim())) {
      setAddError("その品目コードはすでに存在します");
      return;
    }
    const item = {
      code: newItem.code.trim(),
      name: newItem.name.trim(),
      category: newItem.category.trim() || "その他",
      stock: parseFloat(newItem.stock) || 0,
      minStock: parseFloat(newItem.minStock) || 0,
      unit: "g",
    };
    setInventory(prev => [...prev, item]);
    setNewItem({ code: "", name: "", category: "", stock: "", minStock: "" });
    setShowAddForm(false);
  };

  const inputStyle = { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "要発注", value: lowCount,  color: "#ef4444", bg: "rgba(239,68,68,.12)" },
          { label: "在庫注意", value: warnCount, color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
          { label: "在庫OK",  value: okCount,   color: "#22c55e", bg: "rgba(34,197,94,.12)" },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, fontFamily: "'DM Mono', monospace" }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 品目名 / 品目コードで検索..."
          style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none" }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ padding: "5px 12px", borderRadius: 99, border: "1px solid", fontSize: 12, cursor: "pointer",
                  borderColor: catFilter === c ? "#38bdf8" : "#334155",
                  background: catFilter === c ? "rgba(56,189,248,.2)" : "transparent",
                  color: catFilter === c ? "#38bdf8" : "#64748b" }}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => setShowLow(v => !v)}
            style={{ padding: "5px 14px", borderRadius: 99, border: "1px solid", fontSize: 12, cursor: "pointer",
              borderColor: showLow ? "#f59e0b" : "#334155",
              background: showLow ? "rgba(245,158,11,.2)" : "transparent",
              color: showLow ? "#f59e0b" : "#64748b" }}>
            ⚠ 要注意のみ
          </button>
        </div>
      </div>

      {/* Add item button (admin only) */}
      {canEdit && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setShowAddForm(v => !v)}
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ＋ 品目を追加
          </button>
        </div>
      )}

      {/* Add item form */}
      {showAddForm && canEdit && (
        <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>新しい品目を追加</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>品目コード *</div>
              <input placeholder="例：018-1099" value={newItem.code} onChange={e => setNewItem(f=>({...f, code: e.target.value}))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>品目名 *</div>
              <input placeholder="例：ダイナロックⅢ ○○" value={newItem.name} onChange={e => setNewItem(f=>({...f, name: e.target.value}))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>カテゴリ</div>
              <input placeholder="例：ダイナロックⅢ" value={newItem.category} onChange={e => setNewItem(f=>({...f, category: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>現在庫（g）</div>
              <input type="number" placeholder="0" value={newItem.stock} onChange={e => setNewItem(f=>({...f, stock: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>最低在庫（g）</div>
              <input type="number" placeholder="0" value={newItem.minStock} onChange={e => setNewItem(f=>({...f, minStock: e.target.value}))} style={inputStyle} />
            </div>
          </div>
          {addError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>⚠ {addError}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handleAddItem} style={{ flex: 1, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>追加する</button>
            <button onClick={() => { setShowAddForm(false); setAddError(""); }} style={{ flex: 1, background: "#1e293b", color: "#94a3b8", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, cursor: "pointer" }}>キャンセル</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{filtered.length} 件表示</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(item => {
          const low = item.minStock > 0 && item.stock < item.minStock;
          const warn = item.minStock > 0 && !low && item.stock < item.minStock * 1.5;
          return (
            <div key={item.code} style={{
              background: "#0f172a", border: `1px solid ${low ? "#ef444440" : warn ? "#f59e0b30" : "#1e293b"}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{item.code}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: low ? "#ef4444" : warn ? "#f59e0b" : "#e2e8f0", fontFamily: "'DM Mono', monospace" }}>
                    {fmtG(item.stock)}
                  </div>
                  {item.minStock > 0 && <div style={{ fontSize: 10, color: "#475569" }}>最低 {fmtG(item.minStock)}</div>}
                </div>
              </div>
              <StockBar stock={item.stock} minStock={item.minStock} />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#475569" }}>該当する品目がありません</div>
        )}
      </div>
    </div>
  );
}

// ── Page 2: 製造指示 ──────────────────────────────────────────
function OrdersPage({ orders, setOrders, canEdit }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: today, paintType: "", color: "", volume: "", cans: "", deadline: "", memo: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggleStatus = (id) => {
    if (!canEdit) return;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: o.status === "完了" ? "未完了" : "完了" } : o));
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    setConfirmDelete(null);
  };

  const addOrder = () => {
    if (!form.paintType || !form.color || !form.cans || !form.deadline) return;
    setOrders(prev => [...prev, { ...form, id: Date.now(), volume: parseFloat(form.volume) || 0, cans: parseInt(form.cans) || 1, status: "未完了" }]);
    setForm({ date: today, paintType: "", color: "", volume: "", cans: "", deadline: "", memo: "" });
    setShowForm(false);
  };

  const grouped = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const d = o.date;
      if (!map[d]) map[d] = [];
      map[d].push(o);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [orders]);

  const inputStyle = { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 13, color: "#64748b" }}>
            未完了 <span style={{ color: "#f59e0b", fontWeight: 700 }}>{orders.filter(o => o.status === "未完了").length}</span> 件
          </span>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(v => !v)}
            style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            ＋ 仕事を追加
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>新しい製造指示</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>日付</div><input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} style={inputStyle} /></div>
            <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>塗料種</div><input placeholder="例：ハイロックECO" value={form.paintType} onChange={e => setForm(f=>({...f,paintType:e.target.value}))} style={inputStyle} /></div>
            <div style={{ gridColumn: "1/-1" }}><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>色名</div><input placeholder="例：ライトグレー系" value={form.color} onChange={e => setForm(f=>({...f,color:e.target.value}))} style={inputStyle} /></div>
            <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>缶数</div><input type="number" placeholder="例：3" value={form.cans} onChange={e => setForm(f=>({...f,cans:e.target.value}))} style={inputStyle} /></div>
            <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>容量(L)</div><input type="number" step="0.1" placeholder="例：3.5" value={form.volume} onChange={e => setForm(f=>({...f,volume:e.target.value}))} style={inputStyle} /></div>
            <div style={{ gridColumn: "1/-1" }}><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>納期</div><input type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} style={inputStyle} /></div>
            <div style={{ gridColumn: "1/-1" }}><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>メモ</div><input placeholder="顧客名など" value={form.memo} onChange={e => setForm(f=>({...f,memo:e.target.value}))} style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={addOrder} style={{ flex: 1, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>追加する</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "#1e293b", color: "#94a3b8", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, cursor: "pointer" }}>キャンセル</button>
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 14 }}>製造指示はありません</div>
          {canEdit && <div style={{ fontSize: 12, marginTop: 6, color: "#334155" }}>「＋ 仕事を追加」から登録してください</div>}
        </div>
      )}

      {grouped.map(([date, items]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#38bdf8", fontWeight: 700, letterSpacing: 1, marginBottom: 8, borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
            {date === today ? "📅 今日 " : ""}{date}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map(order => {
              const done = order.status === "完了";
              const overdue = !done && order.deadline < today;
              const isConfirming = confirmDelete === order.id;
              return (
                <div key={order.id} style={{
                  background: done ? "#0a1628" : "#0f172a",
                  border: `1px solid ${done ? "#1e293b" : overdue ? "#ef444440" : "#1e293b"}`,
                  borderRadius: 10, padding: "12px 14px", opacity: done ? 0.6 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: done ? "#475569" : "#e2e8f0", textDecoration: done ? "line-through" : "none" }}>
                          {order.color}
                        </span>
                        <span style={{ fontSize: 11, background: "#1e293b", color: "#94a3b8", borderRadius: 4, padding: "1px 6px" }}>{order.paintType}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748b" }}>
                        <span>🥫 {order.cans}缶</span>
                        {order.volume > 0 && <span>📦 {order.volume}L</span>}
                        <span style={{ color: overdue ? "#ef4444" : "#64748b" }}>🗓 {order.deadline}{overdue ? " ⚠過" : ""}</span>
                      </div>
                      {order.memo && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>📝 {order.memo}</div>}
                    </div>
                    {canEdit && (
                      <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                        <button onClick={() => toggleStatus(order.id)}
                          style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                            background: done ? "#1e293b" : "linear-gradient(135deg,#22c55e,#16a34a)",
                            color: done ? "#475569" : "#fff" }}>
                          {done ? "取消" : "完了"}
                        </button>
                        {isConfirming ? (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => deleteOrder(order.id)}
                              style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#ef4444", color: "#fff" }}>
                              削除
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, background: "#1e293b", color: "#64748b" }}>
                              戻る
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(order.id)}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #334155", cursor: "pointer", fontSize: 12, background: "transparent", color: "#64748b" }}>
                            🗑
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page 3: 在庫編集 ─────────────────────────────────────────
function EditPage({ inventory, setInventory, canEdit }) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("使用");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [log, setLog] = useState([]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q));
  }, [inventory, search]);

  const [saving, setSaving] = useState(false);

  const apply = async () => {
    if (!selected || !amount || isNaN(parseFloat(amount))) return;
    const g = parseFloat(amount);
    setInventory(prev => prev.map(i => {
      if (i.code !== selected.code) return i;
      const newStock = mode === "入荷" ? i.stock + g : Math.max(0, i.stock - g);
      return { ...i, stock: newStock };
    }));
    const entry = { time: new Date().toLocaleTimeString("ja-JP"), mode, code: selected.code, name: selected.name, amount: g };
    setLog(prev => [entry, ...prev].slice(0, 20));

    if (mode === "使用") {
      setSaving(true);
      try {
        await addDoc(collection(db, "usageLogs"), {
          code: selected.code,
          name: selected.name,
          category: selected.category,
          amount: g,
          date: today,
          timestamp: Timestamp.now(),
        });
      } catch (e) { console.error("保存エラー:", e); }
      setSaving(false);
    }
    setAmount("");
    setSelected(null);
  };

  const inputStyle = { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };

  if (!canEdit) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ color: "#64748b", fontSize: 15 }}>在庫編集には管理者権限が必要です</div>
        <div style={{ color: "#475569", fontSize: 13, marginTop: 8 }}>右上の鍵アイコンからログインしてください</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: 4, marginBottom: 16 }}>
        {["入荷", "使用"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "9px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all .2s",
            background: mode === m ? (m === "入荷" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)") : "transparent",
            color: mode === m ? "#fff" : "#475569",
          }}>
            {m === "入荷" ? "📥 入荷" : "📤 使用"}
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ background: "rgba(56,189,248,.1)", border: "1px solid rgba(56,189,248,.3)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#38bdf8", fontWeight: 700, marginBottom: 4 }}>選択中：{selected.name}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>現在庫：{fmtG(selected.stock)}</div>
        </div>
      )}

      {selected && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{mode}量（g）</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="例：500" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={apply} disabled={saving} style={{
              background: mode === "入荷" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)",
              color: "#fff", border: "none", borderRadius: 8, padding: "0 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1
            }}>{saving ? "保存中..." : "記録"}</button>
          </div>
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 品目を検索して選択..." style={{ ...inputStyle, marginBottom: 12 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
        {filtered.map(item => (
          <button key={item.code} onClick={() => setSelected(item)}
            style={{
              background: selected?.code === item.code ? "rgba(56,189,248,.1)" : "#0f172a",
              border: `1px solid ${selected?.code === item.code ? "rgba(56,189,248,.4)" : "#1e293b"}`,
              borderRadius: 8, padding: "10px 14px", cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
            <span style={{ fontSize: 13, color: "#e2e8f0" }}>{item.name}</span>
            <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: item.minStock > 0 && item.stock < item.minStock ? "#ef4444" : "#94a3b8" }}>
              {fmtG(item.stock)}
            </span>
          </button>
        ))}
      </div>

      {log.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, color: "#475569", fontWeight: 700, marginBottom: 8 }}>📋 本日の入出庫履歴</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {log.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 10px", background: "#0f172a", borderRadius: 6 }}>
                <span style={{ color: "#475569" }}>{e.time}</span>
                <span style={{ color: "#94a3b8", flex: 1, margin: "0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                <span style={{ color: e.mode === "入荷" ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
                  {e.mode === "入荷" ? "+" : "-"}{fmtG(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page 4: 使用量集計 ────────────────────────────────────────
function StatsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState(today);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "usageLogs"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    let from;
    if (period === "month") from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    else if (period === "3month") from = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10);
    else if (period === "year") from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
    else from = customFrom;
    const to = period === "custom" ? customTo : today;
    return logs.filter(l => l.date >= (from || "0000") && l.date <= to);
  }, [logs, period, customFrom, customTo]);

  const ranking = useMemo(() => {
    const map = {};
    filtered.forEach(l => {
      if (!map[l.code]) map[l.code] = { code: l.code, name: l.name, category: l.category, total: 0 };
      map[l.code].total += l.amount;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const inputStyle = { background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", marginBottom: 16 }}>📊 使用量集計</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {[{ key: "month", label: "今月" }, { key: "3month", label: "3ヶ月" }, { key: "year", label: "今年" }, { key: "custom", label: "期間指定" }].map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} style={{ padding: "6px 14px", borderRadius: 99, border: "1px solid", fontSize: 12, cursor: "pointer", borderColor: period === p.key ? "#38bdf8" : "#334155", background: period === p.key ? "rgba(56,189,248,.2)" : "transparent", color: period === p.key ? "#38bdf8" : "#64748b" }}>{p.label}</button>
        ))}
      </div>
      {period === "custom" && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <span style={{ color: "#64748b" }}>〜</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#475569" }}>読み込み中...</div>
      ) : ranking.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div>この期間の使用記録がありません</div>
          <div style={{ fontSize: 12, marginTop: 8, color: "#334155" }}>在庫編集で「使用」を記録すると集計に反映されます</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{ranking.length}品目 合計 {fmtG(ranking.reduce((s, r) => s + r.total, 0))}</div>
          {ranking.map((item, i) => {
            const maxTotal = ranking[0].total;
            const pct = Math.round((item.total / maxTotal) * 100);
            const medal = ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;
            return (
              <div key={item.code} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: i < 3 ? 18 : 13, minWidth: 28, textAlign: "center", color: "#64748b", fontWeight: 700 }}>{medal}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{item.code} · {item.category}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#38bdf8", fontFamily: "'DM Mono', monospace" }}>{fmtG(item.total)}</div>
                </div>
                <div style={{ height: 4, background: "#1e293b", borderRadius: 99 }}>
                  <div style={{ width: pct + "%", height: "100%", background: "linear-gradient(90deg,#38bdf8,#818cf8)", borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(0);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [orders, setOrders] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const ADMIN_PIN = "1234";

  const tryLogin = () => {
    if (pin === ADMIN_PIN) { setIsAdmin(true); setShowAuth(false); setPin(""); setPinError(false); }
    else { setPinError(true); setPin(""); }
  };

  const tabs = [
    { label: "在庫一覧", icon: "📦" },
    { label: "製造指示", icon: "🏭" },
    { label: "在庫編集", icon: "✏️" },
    { label: "集計", icon: "📊" },
  ];

  const lowCount = inventory.filter(i => i.minStock > 0 && i.stock < i.minStock).length;

  return (
    <div style={{
      minHeight: "100vh", background: "#020817",
      fontFamily: "'Noto Sans JP', 'DM Sans', system-ui, sans-serif",
      color: "#e2e8f0", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ background: "#0a1628", borderBottom: "1px solid #1e293b", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.5, background: "linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            調色 在庫管理
          </div>
          <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>PAINT STOCK MANAGER</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lowCount > 0 && (
            <div style={{ background: "rgba(239,68,68,.2)", border: "1px solid rgba(239,68,68,.4)", borderRadius: 99, padding: "3px 10px", fontSize: 12, color: "#ef4444", fontWeight: 700 }}>
              ⚠ {lowCount}件
            </div>
          )}
          <button onClick={() => isAdmin ? setIsAdmin(false) : setShowAuth(true)}
            style={{ background: isAdmin ? "rgba(34,197,94,.2)" : "#1e293b", border: `1px solid ${isAdmin ? "rgba(34,197,94,.4)" : "#334155"}`, borderRadius: 99, padding: "6px 12px", color: isAdmin ? "#22c55e" : "#64748b", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
            {isAdmin ? "🔓 管理者" : "🔒"}
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => { setShowAuth(false); setPin(""); setPinError(false); }}>
          <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 16, padding: 28, width: 280 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>🔐 管理者ログイン</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>PINコードを入力してください</div>
            <input type="password" maxLength={8} value={pin} onChange={e => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={e => e.key === "Enter" && tryLogin()}
              placeholder="PIN"
              style={{ background: "#020817", border: `1px solid ${pinError ? "#ef4444" : "#334155"}`, borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 18, letterSpacing: 8, width: "100%", boxSizing: "border-box", textAlign: "center", outline: "none" }} />
            {pinError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6, textAlign: "center" }}>PINコードが違います</div>}
            <button onClick={tryLogin} style={{ marginTop: 14, width: "100%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              ログイン
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: "16px 14px 80px", overflowY: "auto" }}>
        {page === 0 && <InventoryPage inventory={inventory} setInventory={setInventory} canEdit={isAdmin} />}
        {page === 1 && <OrdersPage orders={orders} setOrders={setOrders} canEdit={isAdmin} />}
        {page === 2 && <EditPage inventory={inventory} setInventory={setInventory} canEdit={isAdmin} />}
        {page === 3 && <StatsPage />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0a1628", borderTop: "1px solid #1e293b", display: "flex" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setPage(i)} style={{
            flex: 1, padding: "12px 0", border: "none", background: "transparent", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .2s",
            borderTop: `2px solid ${page === i ? "#38bdf8" : "transparent"}`,
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: page === i ? "#38bdf8" : "#334155", fontWeight: page === i ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
