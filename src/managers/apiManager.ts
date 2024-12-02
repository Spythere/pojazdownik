import http from '../http';
import { API } from '../types/api.types';

export class ApiManager {
  static async fetchActiveData() {
    try {
      const responseData = (await http.get<API.ActiveData>('/api/getActiveData')).data;

      return responseData;
    } catch (error) {
      console.error('Nie udało się pobrać zdalnej zawartości', error);
    }

    return null;
  }
}
