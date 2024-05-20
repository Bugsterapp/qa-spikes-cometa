import axios from 'axios';
import { LoginMethods } from '~/pages';
import type { AxiosRequestConfig } from 'axios';
import { GuardianStudent } from '@cometa/trpc/src/types';
const isServer = typeof window === 'undefined';
const BASE_URL = isServer ? process.env.NEXT_PUBLIC_SERVER_API_BASE_URL : process.env.NEXT_PUBLIC_CLIENT_API_BASE_URL;
const SECRET = process.env.NEXT_PUBLIC_API_SECRET ?? '';

const _axios = axios.create({
  baseURL: BASE_URL,
});

const ApiClient = {
  validateUser({ method, value }: { method: LoginMethods; value: string }) {
    return _axios.post(`/api/v1/guardians/login/send_code/`, { method, value }, { headers: { secret: SECRET } });
  },
  authGuardian(authToken: string | null) {
    return _axios.post('/api/v1/guardians/auth/', { auth_token: authToken }, { headers: { secret: SECRET } });
  },
  authExternal(external_id: string) {
    return _axios.post('/api/v1/guardians/external_auth/', { external_id }, { headers: { secret: SECRET } });
  },

  loginGuardian(guardianHash: string) {
    return _axios.post('/api/v1/guardians/login/', { hash: guardianHash }, { headers: { secret: SECRET } });
  },

  loginByEmail(email: string, schoolId: string) {
    return _axios.post('/api/v1/guardians/school_login/', { email, school: schoolId }, { headers: { secret: SECRET } });
  },

  getSchoolBySlugName(slugName: string) {
    return _axios.get(`/api/v1/schools/${slugName}/`, {
      headers: { secret: SECRET },
    });
  },
  getGuardian(guardianId: string, token: string) {
    return _axios.get(`/api/v1/guardians/${guardianId}/`, {
      headers: { token },
    });
  },

  getGuardianMe(token: string) {
    return _axios.get(`/api/v1/guardians/me/`, {
      headers: { token },
    });
  },

  patchGuardian(values: any, guardianId: string, token: string, force = false) {
    return _axios.patch(`api/v1/guardians/${guardianId}/`, values, {
      headers: { token },
      params: { force },
    });
  },

  // READY - apply changes payins
  getGuardianDependentsOrders(guardianId: string, token: string) {
    return _axios.get(`/api/v1/guardians/${guardianId}/orders/`, {
      headers: { token },
    });
  },

  // READY - apply changes payins
  getSchoolPayments(schoolId: string, token: string, statuses: string[] = []) {
    return _axios.get(`/api/v1/schools/${schoolId}/payins/`, {
      params: {
        fulfillment_statuses: statuses,
      },
      headers: { token },
    });
  },

  // READY - apply changes payins
  getSchoolFulfillments(schoolId: string, token: string, statuses: string[] = []) {
    return _axios.get(`/api/v1/schools/${schoolId}/fulfillments/`, {
      params: {
        statuses,
      },
      headers: { token },
    });
  },

  createMerPagoPreference(studentId: string, guardianId: string, orderIds: string, backUrlsBase: string) {
    return _axios.post(
      `/api/v1/mpcp/preferences/`,
      {
        student: studentId,
        guardian: guardianId,
        orders: orderIds,
        back_urls: {
          failure: `${backUrlsBase}/`,
          pending: `${backUrlsBase}/`,
          success: `${backUrlsBase}/success/`,
        },
      },
      { headers: { secret: SECRET } }
    );
  },

  createMerPagoPreferenceMultiOrders(
    guardianId: string,
    items: { student: string; order: string }[],
    backUrlsBase: string,
    token: string
  ) {
    return _axios.post(
      `/api/v1/mpcp/preferences/`,
      {
        guardian: guardianId,
        items,
        back_urls: {
          failure: `${backUrlsBase}/`,
          pending: `${backUrlsBase}/`,
          success: `${backUrlsBase}/success`,
        },
        preference_type: 'CARD',
      },
      { headers: { token } }
    );
  },
  // TODO - apply changes payins? check serializer
  getInvoicePDF(studentId: string, orderId: string, token: string) {
    return _axios.get(`/api/v1/students/${studentId}/orders/${orderId}/invoice_urls/`, {
      headers: { token },
    });
  },

  openNotification(notificationId: string) {
    return _axios.put(`/api/v1/guardian_notification/${notificationId}/opened/`, { headers: { secret: SECRET } });
  },

  shortToLongUrl(shortUrlHash: string) {
    return _axios.get(`api/v1/guardians/short_urls/`, {
      params: {
        hash: shortUrlHash,
      },
      headers: { secret: SECRET ?? '' },
    });
  },

  getFeatures(token: string | null = null) {
    return _axios.get('/api/v1/portal/features/', {
      headers: token ? { token } : {},
    });
  },

  deletePendingPayment(token: string, schoolId: string, payinId: string) {
    const url = `api/v1/schools/${schoolId}/payins/${payinId}/`;
    return _axios.delete(url, {
      headers: { token },
    });
  },
  postKushkiTransfer(guardian: string, items: { order: string; student: string }[], token: string) {
    return _axios.post(
      '/api/v1/kushki_checkout/preferences/',
      {
        items,
        guardian,
        preference_type: 'TRANSFER_IN',
      },
      {
        headers: {
          token,
        },
      }
    );
  },
  postKushkiCard(
    guardian: string,
    items: Record<string, unknown>[],
    cardType: 'CREDIT' | 'DEBIT' | 'AMEX',
    kushkiToken: string,
    token: string
  ) {
    return _axios.post<{ field: string; code: string; message: string }>(
      '/api/v1/kushki_checkout/preferences/',
      {
        items,
        guardian,
        preference_type: 'CARD',
        token: kushkiToken,
        card_type: cardType,
      },
      {
        headers: {
          token,
        },
      }
    );
  },

  postKushkiCashIn(token: string, items: { student: string; order: string }[], guardianId: string) {
    return _axios.post(
      `/api/v1/kushki_checkout/preferences/`,
      {
        items,
        guardian: guardianId,
        preference_type: 'CASH_IN',
      },
      {
        headers: { token },
      }
    );
  },

  getValuesWithCommission({
    orders,
    guardian,
    preference_type,
    token,
  }: {
    orders: { order: string; student: string }[];
    guardian: string;
    preference_type: 'CASH_IN' | 'TRANSFER_IN' | 'CARD';
    token: string;
  }) {
    return _axios.post(
      `/api/v1/validate/preferences/`,
      { items: orders, guardian, preference_type },
      { headers: { token } }
    );
  },

  verifyGuardianIds(token: string, guardianIds: string[]) {
    return _axios.post(`/api/v1/guardians/verify_guardians/`, { guardian_ids: guardianIds }, { headers: { token } });
  },

  assignBilling(token: string, studentId: string, guardianId?: string | null) {
    return _axios.patch(
      `/api/v1/guardians/assign_billing/`,
      { guardian_id: guardianId ?? null, student_id: studentId },
      { headers: { token } }
    );
  },
  createStudents(data: Partial<GuardianStudent>[], params: AxiosRequestConfig) {
    return _axios.post(`/api/v1/students/`, data, params);
  },
};

export default ApiClient;
