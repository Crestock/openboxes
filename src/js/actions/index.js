import { addTranslationForLanguage } from 'react-localize-redux';

import {
  SHOW_SPINNER,
  HIDE_SPINNER,
  FETCH_USERS,
  FETCH_REASONCODES,
  FETCH_SESSION_INFO,
  CHANGE_CURRENT_LOCATION,
  TRANSLATIONS_FETCHED,
  CHANGE_CURRENT_LOCALE,
  FETCH_GRAPHS,
  FETCH_NUMBERS,
  RESET_INDICATORS,
  ADD_TO_INDICATORS,
  REMOVE_FROM_INDICATORS,
  REORDER_INDICATORS,
} from './types';
import apiClient, { parseResponse } from '../utils/apiClient';

export function showSpinner() {
  return {
    type: SHOW_SPINNER,
    payload: true,
  };
}

export function hideSpinner() {
  return {
    type: HIDE_SPINNER,
    payload: false,
  };
}

export function fetchReasonCodes() {
  const url = '/openboxes/api/reasonCodes';
  const request = apiClient.get(url);

  return {
    type: FETCH_REASONCODES,
    payload: request,
  };
}

export function fetchUsers() {
  const url = '/openboxes/api/generic/person';
  const request = apiClient.get(url);

  return {
    type: FETCH_USERS,
    payload: request,
  };
}

export function fetchSessionInfo() {
  const url = '/openboxes/api/getAppContext';
  const request = apiClient.get(url);

  return {
    type: FETCH_SESSION_INFO,
    payload: request,
  };
}

export function changeCurrentLocation(location) {
  return (dispatch) => {
    const url = `/openboxes/api/chooseLocation/${location.id}`;

    apiClient.put(url).then(() => {
      dispatch({
        type: CHANGE_CURRENT_LOCATION,
        payload: location,
      });
    });
  };
}

export function fetchTranslations(lang, prefix) {
  return (dispatch) => {
    const url = `/openboxes/api/localizations?lang=${lang ||
      ''}&prefix=react.${prefix || ''}`;

    apiClient.get(url).then((response) => {
      const { messages, currentLocale } = parseResponse(response.data);

      dispatch(addTranslationForLanguage(messages, currentLocale));

      dispatch({
        type: TRANSLATIONS_FETCHED,
        payload: prefix,
      });
    });
  };
}

export function changeCurrentLocale(locale) {
  return (dispatch) => {
    const url = `/openboxes/api/chooseLocale/${locale}`;

    apiClient.put(url).then(() => {
      dispatch({
        type: CHANGE_CURRENT_LOCALE,
        payload: locale,
      });
    });
  };
}

// New Dashboard

function fetchIndicator(
  dispatch,
  indicatorMethod,
  indicatorType,
  indicatorTitle,
  link = null,
  indicatorId = null,
  params = '',
) {
  const archived = 0;
  const id = indicatorId || Math.random();

  const url = `/openboxes/apitablero/${indicatorMethod}?${params}`;

  dispatch({
    type: FETCH_GRAPHS,
    payload: {
      id,
      method: indicatorMethod,
      title: indicatorTitle,
      type: 'loading',
      data: [],
      archived,
      link,
    },
  });

  apiClient.get(url).then((res) => {
    dispatch({
      type: FETCH_GRAPHS,
      payload: {
        id,
        method: indicatorMethod,
        title: indicatorTitle,
        type: indicatorType,
        data: res.data,
        archived,
        link,
      },
    });
  }, () => {
    dispatch({
      type: FETCH_GRAPHS,
      payload: {
        id,
        method: indicatorMethod,
        title: indicatorTitle,
        type: 'error',
        data: [],
        archived,
        link,
      },
    });
  });
}

export function reloadIndicator(method, type, title, link, id, params) {
  return (dispatch) => {
    fetchIndicator(dispatch, method, type, title, link, id, params);
  };
}

export function fetchIndicators() {
  return (dispatch) => {
    fetchIndicator(dispatch, 'getExpirationSummary', 'line', 'Expiration Summary', '/openboxes/inventory/listExpiringStock');
    fetchIndicator(dispatch, 'getFillRate', 'bar', 'Fill Rate');
    fetchIndicator(dispatch, 'getInventorySummary', 'horizontalBar', 'Inventory Summary');
    fetchIndicator(dispatch, 'getSentStockMovements', 'bar', 'Stock Movements Sent by Month');
    fetchIndicator(dispatch, 'getReceivedStockMovements', 'bar', 'Incoming Stock Movements by Month');
    fetchIndicator(dispatch, 'getOutgoingStock', 'numbers', 'Outgoing Stock Movements in Progress', '/openboxes/stockMovement/list?receiptStatusCode=PENDING');
    fetchIndicator(dispatch, 'getDiscrepancy', 'table', 'Items received with a discrepancy');
    fetchIndicator(dispatch, 'getIncomingStock', 'numbers', 'Incoming Stock Movements by Status', '/openboxes/stockMovement/list?direction=INBOUND');
    fetchIndicator(dispatch, 'getDelayedShipments', 'numberTable', 'Delayed Shipments');
  };
}

export function resetIndicators() {
  return {
    type: RESET_INDICATORS,
  };
}

export function addToIndicators(index, type) {
  return {
    type: ADD_TO_INDICATORS,
    payload: { index, type },
  };
}

export function reorderIndicators({ oldIndex, newIndex }, e, type) {
  if (e.target.id === 'archive') {
    return {
      type: REMOVE_FROM_INDICATORS,
      payload: { index: oldIndex, type },
    };
  }
  return {
    type: REORDER_INDICATORS,
    payload: { oldIndex, newIndex, type },
  };
}

export function fetchNumbersData() {
  const url = '/openboxes/apitablero/getNumberData';

  return (dispatch) => {
    apiClient.get(url).then((res) => {
      const data = res.data.map(item => {
        item.archived = 0;
        return item;
      });
      dispatch({
        type: FETCH_NUMBERS,
        payload: {
          data,
        },
      });
    });
  };
}
