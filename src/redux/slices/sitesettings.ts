// redux/slices/sitesettings.js
// (If your repo is TS, rename to .ts and add types accordingly)

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  site_name: "",
  email: "",
  phone: "",
  altphone: "",
  whatappnumber: "",
  address: "",
  logo_url: "",
  favicon_url: "",
  raw: null,
  loadedAt: null,
};

const slice = createSlice({
  name: "sitesettings",
  initialState,
  reducers: {
    setSiteSettings(state, action) {
      const payload = action.payload || {};
      Object.assign(state, payload);
      state.loadedAt = Date.now();
    },
    resetSiteSettings(state) {
      Object.keys(initialState).forEach((k) => (state[k] = initialState[k]));
    },
  },
});

export const { setSiteSettings, resetSiteSettings } = slice.actions;
export default slice.reducer;
