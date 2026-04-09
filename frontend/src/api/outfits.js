import { apiRequest } from './client';

export const getByOccasion = async (occasion) => {
  return apiRequest('/outfits/by-occasion', {
    method: 'POST',
    body: JSON.stringify({ occasion }),
  });
};

export const getByWeather = async (temperature, condition) => {
  return apiRequest('/outfits/by-weather', {
    method: 'POST',
    body: JSON.stringify({ temperature, condition }),
  });
};

export const getByDressCode = async (dressCode) => {
  return apiRequest('/outfits/by-dress-code', {
    method: 'POST',
    body: JSON.stringify({ dress_code: dressCode }),
  });
};

export const getByColor = async (color) => {
  return apiRequest('/outfits/by-color', {
    method: 'POST',
    body: JSON.stringify({ color }),
  });
};

export const getWithItem = async (itemId) => {
  return apiRequest('/outfits/with-item', {
    method: 'POST',
    body: JSON.stringify({ item_id: itemId }),
  });
};

export const saveOutfit = async (data) => {
  return apiRequest('/outfits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getSavedOutfits = async () => {
  return apiRequest('/outfits');
};
