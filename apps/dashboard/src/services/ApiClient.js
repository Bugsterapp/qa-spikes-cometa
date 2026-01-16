import * as Sentry from '@sentry/nextjs';
import axios from 'axios';
import { getSession } from 'next-auth/react';

const isServer = typeof window === 'undefined';
const BASE_URL = isServer ? process.env.NEXT_PUBLIC_SERVER_API_BASE_URL : process.env.NEXT_PUBLIC_CLIENT_API_BASE_URL;
const PATH_API = '/api/v1';

const _axios = axios.create({
  baseURL: BASE_URL + PATH_API,
});

const headerWithAuthorization = (token) => ({ headers: { Authorization: `Token ${token}` } });

const getCurrentToken = async () => {
  try {
    const session = await getSession();
    return session?.token || session?.access_token;
  } catch (error) {
    return null;
  }
};

const withAuthAndMiddleware = async (axiosCall) => {
  const token = await getCurrentToken();
  if (!token) throw new Error('No authentication token available');
  return middleware(axiosCall(token));
};

const withAuthMiddlewareAndData = async (axiosCall) => withAuthAndMiddleware(axiosCall).then((res) => res.data);

const paramNotEmpty = (param) => param !== null && param !== undefined && param.toString().trim() !== '';

const formatParams = (params) => {
  const result = [];
  Object.keys(params).forEach((key) => {
    const param = params[key];
    if (Array.isArray(param)) {
      param.forEach((item) => {
        result.push(`${key}=${item}`);
      });
    } else if (paramNotEmpty(param)) {
      result.push(`${key}=${param}`);
    }
  });
  return result.length ? '?' + result.join('&') : '';
};

const middleware = (response) => {
  response.catch(async (error) => {
    if (error?.response?.status && error.response.statusText) {
      Sentry.captureException(`${error.response.status} - ${error.response.statusText}`);
    } else {
      Sentry.captureException(error);
    }
  });
  return response;
};

const ApiClient = {
  async getPayinFilters(schoolId) {
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/schools/${schoolId}/payins/filters/`, headerWithAuthorization(token))
    );
  },

  async getReportById(reportId, typeFile) {
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/reports/${typeFile}/${reportId}/`, headerWithAuthorization(token))
    );
  },

  async generatePayinsFulfillmentsReport(schoolId, { guardians, students, startDate, endDate, config, ...filters }) {
    const params = {
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.post(
        `dashboard/schools/${schoolId}/payins_fulfillments/xls_v2/${formatParams(params)}`,
        config && config.length > 0 ? { config } : {},
        headerWithAuthorization(token)
      )
    );
  },

  async generateInvoicesReport(schoolId, { guardians, students, startDate, endDate, config, ...filters }) {
    const params = {
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.post(
        `dashboard/schools/${schoolId}/invoices/xls_v2/${formatParams(params)}`,
        config && config.length > 0 ? { config } : {},
        headerWithAuthorization(token)
      )
    );
  },

  async generateStudentStatementsReport(schoolId, { school_cycle, student }) {
    return withAuthMiddlewareAndData((token) =>
      _axios.post(
        `dashboard/schools/${schoolId}/fulfillments/xls_v2/?student=${student}`,
        { school_cycle: school_cycle, student: student },
        headerWithAuthorization(token)
      )
    );
  },

  async generatePayinsReport(schoolId, { startDate, endDate, guardians, ids, filters }) {
    const params = {
      guardians,
      start_date: startDate,
      end_date: endDate,
      ids,
      ...filters,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.post(
        `dashboard/schools/${schoolId}/payins/excel/xls_v2/${formatParams(params)}`,
        {},
        headerWithAuthorization(token)
      )
    );
  },

  async generatePayoutsReport(schoolId, { startDate, endDate, ids, ...filters }) {
    const params = {
      start_date: startDate,
      end_date: endDate,
      ids,
      status: 'PROCESSING_STATUS,APPROVED_STATUS,DECLINED_STATUS',
      ...filters,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.post(
        `dashboard/schools/${schoolId}/payouts/xls_v2/${formatParams(params)}`,
        {},
        headerWithAuthorization(token)
      )
    );
  },

  async getOrderPayinFulfillmentReport(schoolId, extension, { startDate, endDate, students, guardians, ...filters }) {
    const params = {
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/schools/${schoolId}/payins_fulfillments/${extension}/${formatParams(params)}`, {
        ...headerWithAuthorization(token),
      })
    );
  },

  async getInvoicesZip(schoolId, extension, { startDate, endDate, students, guardians, ...filters }) {
    const params = {
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/schools/${schoolId}/invoices/${extension}/${formatParams(params)}`, {
        ...headerWithAuthorization(token),
      })
    );
  },

  async getSchoolRegisteredPaymentsInvoices(schoolId, extension, { startDate, endDate, guardians, ids }, filters) {
    const params = {
      guardians,
      start_date: startDate,
      end_date: endDate,
      ids,
      ...filters,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/schools/${schoolId}/payins/${extension}/${formatParams(params)}`, {
        ...headerWithAuthorization(token),
      })
    );
  },

  async getSchoolPayoutsInvoices(schoolId, extension, { startDate, endDate, ids, school_cycles }) {
    const params = {
      start_date: startDate,
      end_date: endDate,
      ids,
      school_cycles,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/schools/${schoolId}/payouts/${extension}/${formatParams(params)}`, {
        ...headerWithAuthorization(token),
      })
    );
  },

  async getInvoicesByStudent(studentId, extension) {
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/students/${studentId}/fulfillments/${extension}/`, {
        ...headerWithAuthorization(token),
      })
    );
  },

  async deleteIncomePayin(schoolId, payinId) {
    return withAuthMiddlewareAndData((token) =>
      _axios.delete(`/dashboard/schools/${schoolId}/payins/${payinId}/`, headerWithAuthorization(token))
    );
  },

  async getIncomePayout(schoolId, payoutId) {
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/schools/${schoolId}/payouts/${payoutId}/`, headerWithAuthorization(token))
    );
  },

  async getGuardiansOnSchool(schoolId, search, phone, email) {
    if (search || (phone && email)) {
      const params = { search, phone, email };
      return withAuthMiddlewareAndData((token) =>
        _axios.get(`/dashboard/schools/${schoolId}/guardians/${formatParams(params)}`, headerWithAuthorization(token))
      );
    } else {
      return withAuthMiddlewareAndData((token) =>
        _axios.get(`/dashboard/schools/${schoolId}/guardians/`, headerWithAuthorization(token))
      );
    }
  },

  async getGuardian(schoolId, guardianId) {
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/schools/${schoolId}/guardians/${guardianId}/`, headerWithAuthorization(token))
    );
  },

  async getStudentsOnSchool(schoolId, search, identifier) {
    if (search) {
      const params = { search };
      return withAuthMiddlewareAndData((token) =>
        _axios.get(`/dashboard/schools/${schoolId}/students/${formatParams(params)}`, headerWithAuthorization(token))
      );
    } else if (identifier) {
      const params = { identifier };
      return withAuthMiddlewareAndData((token) =>
        _axios.get(`/dashboard/schools/${schoolId}/students/${formatParams(params)}`, headerWithAuthorization(token))
      );
    } else {
      return withAuthMiddlewareAndData((token) =>
        _axios.get(`/dashboard/schools/${schoolId}/students/`, headerWithAuthorization(token))
      );
    }
  },

  async saveManualPay(
    schoolId,
    guardian,
    paid_date,
    type,
    fulfillments,
    optional_orders,
    manual_payment_account,
    generate_invoice,
    comment,
    show_comment,
    transaction_reference,
    sender_account_number,
    card_last_digits,
    bank_name,
    is_partial,
    total
  ) {
    const data = {
      guardian,
      paid_date,
      type,
      fulfillments,
      optional_orders,
      manual_payment_account,
      generate_invoice,
      comment: comment || null,
      show_comment: show_comment || null,
      transaction_reference: transaction_reference || null,
      sender_account_number: sender_account_number || null,
      card_last_digits: card_last_digits || null,
      bank_name: bank_name || null,
      is_partial: is_partial,
      total,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.post(`/dashboard/schools/${schoolId}/payins/`, data, headerWithAuthorization(token))
    );
  },

  async createSpecialDiscount(schoolId, discountName, discountValue, studentId, orderId, typeDiscount = 'FIXED') {
    const data = {
      name: discountName,
      student: studentId,
      order: orderId,
      type: typeDiscount,
    };
    if (discountValue) data.value = parseFloat(discountValue);
    return withAuthMiddlewareAndData((token) =>
      _axios.post(`dashboard/schools/${schoolId}/special_discounts/`, data, headerWithAuthorization(token))
    );
  },

  async getMe(schoolId) {
    return withAuthMiddlewareAndData((token) =>
      _axios.get(`/dashboard/schools/${schoolId}/admins/me/`, headerWithAuthorization(token))
    );
  },

  async postConceptAssignment(studentId, conceptId, ordersToSkip, isOptional = false, start_date, end_date) {
    let params = {
      concept: conceptId,
      orders_to_skip: ordersToSkip,
      start_date,
      end_date,
    };

    // If isOptional is true, modify the params object accordingly
    if (isOptional) {
      params = {
        concept: conceptId,
        orders_ids: ordersToSkip,
        is_optional: isOptional,
      };
    }

    return withAuthMiddlewareAndData((token) =>
      _axios.post(`/dashboard/students/${studentId}/assignments/`, params, headerWithAuthorization(token))
    );
  },

  async patchConceptAssignment(
    studentId,
    assignmentId,
    conceptId,
    ordersToSkip,
    start_date,
    end_date,
    isOptional = false
  ) {
    let params = {
      orders_to_skip: ordersToSkip,
      start_date,
      end_date,
    };

    // If isOptional is true, modify the params object accordingly
    if (isOptional) {
      params = {
        concept: conceptId,
        orders_ids: ordersToSkip,
        is_optional: isOptional,
      };
    }

    return withAuthMiddlewareAndData((token) =>
      _axios.patch(
        `/dashboard/students/${studentId}/assignments/${assignmentId}/`,
        params,
        headerWithAuthorization(token)
      )
    );
  },

  async deleteConceptAssignment(studentId, assignmentId, flagOptional) {
    return withAuthMiddlewareAndData((token) =>
      _axios.delete(
        `/dashboard/students/${studentId}/assignments/${assignmentId}/${
          flagOptional ? 'destroy_optional_assignment/' : ''
        }`,
        headerWithAuthorization(token)
      )
    );
  },

  async postScholarshipAssignment(studentId, scholarshipId, orders_to_skip) {
    const params = {
      scholarship: scholarshipId,
      orders_to_skip,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.post(`/dashboard/students/${studentId}/available_scholarships/`, params, headerWithAuthorization(token))
    );
  },

  async deleteScholarshipAssignment(studentId, scholarshipId) {
    return withAuthMiddlewareAndData((token) =>
      _axios.delete(`/dashboard/students/${studentId}/scholarships/${scholarshipId}/`, headerWithAuthorization(token))
    );
  },

  async assignGuardianToStudent(studentId, guardian, relationship = null) {
    return withAuthMiddlewareAndData((token) =>
      _axios.post(
        `/dashboard/students/${studentId}/guardians/`,
        { guardian, relationship },
        headerWithAuthorization(token)
      )
    );
  },

  async patchStudentViewMoreInfo(studentId, data) {
    return withAuthMiddlewareAndData((token) =>
      _axios.patch(`/dashboard/students/${studentId}/`, data, headerWithAuthorization(token))
    );
  },

  async createStudent(schoolId, data) {
    return withAuthMiddlewareAndData((token) =>
      _axios.post(`/dashboard/schools/${schoolId}/students/`, data, headerWithAuthorization(token))
    );
  },

  async patchGuardianDetail(guardianId, data) {
    return withAuthMiddlewareAndData((token) =>
      _axios.patch(`/dashboard/guardians/${guardianId}/`, data, headerWithAuthorization(token))
    );
  },

  async generateCollectionsReport(schoolId, { schoolCycle, concepts }) {
    const params = {
      school_cycle: schoolCycle,
      concepts,
    };
    return withAuthMiddlewareAndData((token) =>
      _axios.post(
        `dashboard/schools/${schoolId}/collection_efficiency/xls_v2/`,
        {
          ...params,
        },
        headerWithAuthorization(token)
      )
    );
  },
};

export default ApiClient;
