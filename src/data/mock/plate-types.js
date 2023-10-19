const types = [
  "A Nyloprint WS83",
  "A Nyloprint WS94",
  "A Printight KM152",
  "Agfa_Thermostar",
  "AGFA_WS95",
  "Asahi_BFTH",
  "Asahi_DEF",
  "Asahi_DEP",
  "Asahi_DSF",
  "Asahi_DSH",
  "Asahi_SH",
  "Asahi_STG",
  "Asahi_TOP",
  "AV_KM58",
  "AV_KM73",
  "AV_QM58",
  "CTP +",
  "D Nyloprint WS83 WD",
  "D Printight QM58",
  "Dupont EPR2",
  "DuPont LSH Lightening",
  "DuPont_Classic",
  "DuPont_DEC",
  "DuPont_DFM",
  "DuPont_DFP",
  "DuPont_DFQ",
  "Dupont_DFR",
  "Dupont_DLC",
  "DuPont_DPC",
  "DuPont_DPH",
  "DuPont_DPI",
  "DuPont_DPL",
  "DuPont_DPN",
  "DuPont_DPR",
  "Dupont_DPR / DPL",
  "DuPont_DPS",
  "DuPont_DRC",
  "Dupont_DS",
  "DuPont_DS2",
  "DuPont_DSF",
  "DuPont_DSP",
  "Dupont_DSR",
  "Dupont_DVS",
  "Dupont_EFX",
  "Dupont_EFXR",
  "DuPont_EPC",
  "Dupont_EPR",
  "DuPont_EPS",
  "DuPont_ESE",
  "Dupont_ESM",
  "Dupont_ESP",
  "Dupont_ESP_2",
  "DuPont_ESX",
  "DuPont_EXL",
  "DuPont_NOWS",
  "Dupont_TDR",
  "DuPont_Thin",
  "Elastomer",
  "Flexo_CC_PRP",
  "Flint FTH XPS HD Crystal",
  "Flint FTM",
  "Flint Gold A",
  "Flint_ACE",
  "Flint_ACE_Up",
  "Flint_ACT",
  "Flint_ART",
  "Flint_Classic",
  "Flint_D_FSC",
  "Flint_D_FSC_XPS_HD",
  "Flint_FAC",
  "Flint_FAH",
  "Flint_FAR",
  "Flint_FCC",
  "Flint_FRC",
  "Flint_FTF",
  "Flint_NEF",
  "Flint_Thin",
  "Flint_WF80HD",
  "Flint_WS83",
  "Flint_WS83D",
  "Flint_WS94",
  "Fuji_LHPJ",
  "Fuji_LHPL",
  "JET_JetUSA",
  "KF43",
  "Kodak_DITR4401Matte",
  "Kodak_Flexcel_NXH",
  "Kodak_Flexcell_NXC",
  "MacDermid ITP 60",
  "MacDermid ITP 60 LAVA",
  "MacDermid ITP MELO",
  "MacDermid MCP LAVA",
  "MacDermid_D_EPIC",
  "MacDermid_D_MAF",
  "MacDermid_D_Max",
  "MacDermid_D_MCH",
  "MacDermid_D_MVP",
  "MacDermid_D50",
  "MACDERMID_ITP_EPIC",
  "MacDermid_ITP_M",
  "MacDermid_LTL",
  "MacDermid_LUX100",
  "MacDermid_LUX200",
  "MacDermid_M155",
  "MacDermid_RAVE",
  "MacDermid_RAVE_ITP",
  "MacDermid_RAVE_LUX",
  "MacDermid_RAVE_LUX_HD",
  "MacDermid_RAVE_LUX_HD_PixelPlus",
  "Macdermid_RAVE_XPS_HD",
  "Macdermid_RAVE_XPS_HD_PixelPlus",
  "Macdermid_RAVE_XPS_HDCrystal",
  "MacDermid_UVR",
  "MacDermid_XTPC",
  "Macdermoid_ITP60_XPS_HDCrystal",
  "McDermid_MVP_LUX_HD",
  "NBR",
  "SGSSleeve",
  "Toray CTP + Vera",
  "Toray - CTP",
  "Toray - DLE",
];

const plateTypes = types.map((value) => {
  return {
    label: value,
    value,
  };
});

export { plateTypes };
