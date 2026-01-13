// store/iframeSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ingestVisible: false,
  datastoreVisible: false,
  ingestLoaded: false,
  datastoreLoaded: false,
  collectionsVisible: false,
  collectionsLoaded: false,
  codepagesVisible: false,
  codepagesLoaded: false,
};

const iframeSlice = createSlice({
  name: "iframe",
  initialState,
  reducers: {
    showIntegration(state) {
      state.ingestVisible = true;
      state.ingestLoaded = true;
    },
    hideIntegration(state) {
      state.ingestVisible = false;
    },
    showDatastore(state) {
      state.datastoreVisible = true;
      state.datastoreLoaded = true;
    },
    hideDatastore(state) {
      state.datastoreVisible = false;
    },
    showCollections(state) {
      state.collectionsVisible = true;
      state.collectionsLoaded = true;
    },
    hideCollections(state) {
      state.collectionsVisible = false;
    },
    showCodepages(state) {
      state.codepagesVisible = true;
      state.codepagesLoaded = true;
    },
    hideCodepages(state) {
      state.codepagesVisible = false;
    },
  },
});

export const {
  showIntegration,
  hideIntegration,
  showDatastore,
  hideDatastore,
  showCollections,
  hideCollections,
  showCodepages,
  hideCodepages,
} = iframeSlice.actions;

export default iframeSlice.reducer;
