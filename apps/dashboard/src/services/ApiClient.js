import axios from 'axios';
import { signOut } from 'next-auth/react';
import { PATH_AUTH } from '../routes/paths';
import { PageSize } from '../utils/general';
import * as Sentry from '@sentry/nextjs';

const isServer = typeof window === 'undefined';
const BASE_URL = isServer ? process.env.NEXT_PUBLIC_SERVER_API_BASE_URL : process.env.NEXT_PUBLIC_CLIENT_API_BASE_URL;
const SECRET = process.env.NEXT_PUBLIC_API_SECRET;
const PATH_API = '/api/v1';

const _axios = axios.create({
  baseURL: BASE_URL + PATH_API,
});

const headerWithSecret = () => ({ headers: { secret: SECRET } });

const headerWithAuthorization = (token) => ({ headers: { Authorization: `Token ${token}` } });

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

const formatParamsWithComma = (params) => {
  const result = [];
  Object.keys(params).forEach((key) => {
    const param = params[key];
    if (Array.isArray(param)) {
      result.push(`${key}=${param.join(',')}`);
    } else if (paramNotEmpty(param)) {
      result.push(`${key}=${param}`);
    }
  });
  return result.length ? '?' + result.join('&') : '';
};

const formatParamsForDelinquencyStudents = (params) => {
  const result = [];
  Object.keys(params).forEach((key) => {
    const param = params[key];
    if (paramNotEmpty(param)) {
      if (key === 'concepts' && Array.isArray(param)) {
        // handle 'concepts' key when it's an array
        param.forEach((value) => {
          if (paramNotEmpty(value)) {
            result.push(`${key}=${value}`);
          }
        });
      } else {
        // handle all other params and keys as string
        result.push(`${key}=${param}`);
      }
    }
  });
  return result.length ? '?' + result.join('&') : '';
};
const middleware401 = (response) => {
  if (response?.status === 401) {
    localStorage.clear();
    signOut({ redirect: true, callbackUrl: PATH_AUTH.login });
    return;
  }
};

const middleware = (response, middlewares) => {
  response.catch((error) => {
    if (middlewares?.length) {
      middlewares.forEach((_middleware) => {
        _middleware(error.response);
      });
    }
    if (error?.response?.status && error.response.statusText) {
      Sentry.captureException(`${error.response.status} - ${error.response.statusText}`);
    } else {
      Sentry.captureException(error);
    }
  });
  return response;
};

const ApiClient = {
  authDashboard(username, password) {
    return middleware(_axios.post(`/users/auth/`, { username, password }, headerWithSecret()));
  },
  getSchools(token) {
    return middleware(_axios.get(`/dashboard/schools/`, headerWithAuthorization(token)), [middleware401]).then(
      (res) => res.data
    );
  },
  unassignTutorsAndStudents(token, student_id, guardian_id) {
    return middleware(
      _axios.delete(`dashboard/students/${student_id}/guardians/${guardian_id}/`, headerWithAuthorization(token)),
      [middleware401]
    ).then((res) => res.data);
  },

  getSchoolFulfillments(token, schoolId, page, guardians, students, startDate, endDate, concepts, parameters) {
    const params = {
      page_size: PageSize,
      page,
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      concepts,
      ...parameters,
    };
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/fulfillments/${formatParams(params)}`, headerWithAuthorization(token)),
      [middleware401]
    ).then((res) => res.data);
  },
  getSchoolFullfilmentFilters(token, schoolId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/resume/`, headerWithAuthorization(token)), [
      middleware401,
    ]).then((res) => res.data);
  },
  getTaxUnits() {
    return _axios.get(`/dashboard/concepts/tax_units/`).then((res) => res.data);
  },
  getProductKeys() {
    return _axios.get(`/dashboard/concepts/product_keys/`).then((res) => res.data);
  },
  getPayoutFilters(token, schoolId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/payouts/filters/`, headerWithAuthorization(token)), [
      middleware401,
    ]).then((res) => res.data);
  },
  getPayinFilters(token, schoolId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/payins/filters/`, headerWithAuthorization(token)), [
      middleware401,
    ]).then((res) => res.data);
  },
  getIncomesPayouts(token, schoolId, page, startDate, endDate, paramsFilter = {}) {
    const params = {
      page_size: PageSize,
      page,
      start_date: startDate,
      end_date: endDate,
      status: ['PROCESSING_STATUS', 'APPROVED_STATUS', 'SCHEDULED_STATUS'],
      ...paramsFilter,
    };
    const url = `/dashboard/schools/${schoolId}/payouts/${formatParams(params)}`;
    return middleware(_axios.get(url, headerWithAuthorization(token)), [middleware401]).then((res) => res.data);
  },
  //aqui
  getReportById(token, reportId, typeFile) {
    return middleware(_axios.get(`/dashboard/reports/${typeFile}/${reportId}/`, headerWithAuthorization(token)), [
      middleware401,
    ]).then((res) => res.data);
  },
  generateDelicuencyReport(token, schoolId, filters) {
    const params = { start_date: filters.startDate, end_date: filters.endDate, concepts: filters.conceptId };

    return middleware(
      _axios.post(
        `dashboard/schools/${schoolId}/delinquency/students/excel/${formatParams(params)}`,
        {},
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
  /**
   *
   * @param {string} token
   * @param {string} schoolId
   * @param {Record<string,unknown>} param2
   * @returns
   */
  generateFulfillmentsReport(token, schoolId, { guardians, students, startDate, endDate, ...filters }) {
    const params = {
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
    return middleware(
      _axios.post(
        `dashboard/schools/${schoolId}/fulfillments/xls/${formatParams(params)}`,
        {},
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
  generatePayinsFulfillmentsReport(
    token,
    schoolId,
    { guardians, students, startDate, endDate, config, v2, ...filters }
  ) {
    const params = {
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
    return middleware(
      _axios.post(
        `dashboard/schools/${schoolId}/payins_fulfillments/${v2 ? 'xls_v2' : 'xls'}/${formatParams(params)}`,
        config && config.length > 0 ? { config } : {},
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
  generateStudentsReport(token, studentId) {
    return middleware(
      _axios.post(
        `dashboard/students/${studentId}/orders/excel/?status=DUE,PENDING,OUTSTANDING`,
        {},
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
  //aqui
  generatePayinsReport(token, schoolId, { startDate, endDate, guardians, ids }) {
    const params = {
      guardians,
      start_date: startDate,
      end_date: endDate,
      ids,
    };
    return middleware(
      _axios.post(
        `dashboard/schools/${schoolId}/payins/excel/${formatParams(params)}`,
        {},
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
  generatePayoutsReport(token, schoolId, { startDate, endDate, ids, ...filters }) {
    const params = {
      start_date: startDate,
      end_date: endDate,
      ids,
      status: 'PROCESSING_STATUS,APPROVED_STATUS',
      ...filters,
    };
    return middleware(
      _axios.post(
        `dashboard/schools/${schoolId}/payouts/excel/${formatParams(params)}`,
        {},
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
  getStudentsReport(token, studentId) {
    return middleware(
      _axios.post(`dashboard/students/${studentId}/orders/excel/`, {}, headerWithAuthorization(token)),
      [middleware401]
    ).then((res) => res.data);
  },
  getIncomesPayins(token, schoolId, page, guardians, startDate, endDate, paramsFilter = {}) {
    const params = {
      is_manual: 1,
      page_size: PageSize,
      page,
      guardians,
      start_date: startDate,
      end_date: endDate,
      ...paramsFilter,
    };
    const url = `/dashboard/schools/${schoolId}/payins/${formatParams(params)}`;
    return middleware(_axios.get(url, headerWithAuthorization(token)), [middleware401]).then((res) => res.data);
  },
  getIncomesPayinsExcel(token, schoolId, guardians, startDate, endDate) {
    const params = { is_manual: 1, guardians, start_date: startDate, end_date: endDate };
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/payins/xlsx/${formatParams(params)}`, {
        ...headerWithAuthorization(token),
        responseType: 'blob',
      }),
      [middleware401]
    );
  },
  getSchoolPayedOrdersInvoices(token, schoolId, extension, { startDate, endDate, students, guardians, ...filters }) {
    const params = {
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
    return middleware(
      _axios
        .get(`/dashboard/schools/${schoolId}/payins_fulfillments/${extension}/${formatParams(params)}`, {
          ...headerWithAuthorization(token),
        })
        .then((res) => res.data),
      [middleware401]
    );
  },
  getOrderPayinFulfillmentReport(token, schoolId, extension, { startDate, endDate, students, guardians, ...filters }) {
    const params = {
      guardians,
      students,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    };
    return middleware(
      _axios
        .get(`/dashboard/schools/${schoolId}/payins_fulfillments/${extension}/${formatParams(params)}`, {
          ...headerWithAuthorization(token),
        })
        .then((res) => res.data),
      [middleware401]
    );
  },
  getSchoolRegisteredPaymentsInvoices(token, schoolId, extension, { startDate, endDate, guardians, ids }, filters) {
    const params = {
      guardians,
      start_date: startDate,
      end_date: endDate,
      ids,
      ...filters,
    };
    return middleware(
      _axios
        .get(`/dashboard/schools/${schoolId}/payins/${extension}/${formatParams(params)}`, {
          ...headerWithAuthorization(token),
        })
        .then((res) => res.data),
      [middleware401]
    );
  },
  getSchoolPartialPaymentsInvoices(token, schoolId, extension, { startDate, endDate, guardians, ids }) {
    const params = {
      guardians,
      start_date: startDate,
      end_date: endDate,
      ids,
    };
    return middleware(
      _axios
        .get(`/dashboard/schools/${schoolId}/partial_payins/${extension}/${formatParams(params)}`, {
          ...headerWithAuthorization(token),
        })
        .then((res) => res.data),
      [middleware401]
    );
  },
  getSchoolPayoutsInvoices(token, schoolId, extension, { startDate, endDate, ids }) {
    const params = {
      start_date: startDate,
      end_date: endDate,
      ids,
    };
    return middleware(
      _axios
        .get(`/dashboard/schools/${schoolId}/payouts/${extension}/${formatParams(params)}`, {
          ...headerWithAuthorization(token),
        })
        .then((res) => res.data),
      [middleware401]
    );
  },
  getInvoicesByStudent(token, studentId, extension) {
    return middleware(
      _axios
        .get(`/dashboard/students/${studentId}/fulfillments/${extension}/`, {
          ...headerWithAuthorization(token),
        })
        .then((res) => res.data),
      [middleware401]
    );
  },
  getStudentsDueOrders(token, schoolId, page, guardian, search, levels, sections, delinquency, school_cycle) {
    const params = { page_size: PageSize, page, guardian, search, levels, sections, delinquency, school_cycle };
    const url = `/dashboard/schools/${schoolId}/due_orders/students/${formatParams(params)}`;
    return middleware(_axios.get(url, headerWithAuthorization(token)), [middleware401]);
  },
  getLevels(token, schoolId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/levels/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  getSections(token, schoolId) {
    const params = { join_by_pipe: true };
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/sections/${formatParams(params)}`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getStudentsHeaderDueOrders(token, schoolId, school_cycle) {
    if (!school_cycle)
      return middleware(
        _axios.get(`/dashboard/schools/${schoolId}/due_orders/resume/`, headerWithAuthorization(token)),
        [middleware401]
      );
    const params = { school_cycle: school_cycle };
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/due_orders/resume/${formatParams(params)}`, {
        ...headerWithAuthorization(token),
      }),
      [middleware401]
    );
  },
  getIncomePayin(token, schoolId, payinId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/payins/${payinId}/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  deleteIncomePayin(token, schoolId, payinId) {
    return middleware(
      _axios.delete(`/dashboard/schools/${schoolId}/payins/${payinId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  deleteIncomePartialPayin(token, schoolId, payinId) {
    return middleware(
      _axios.delete(`/dashboard/schools/${schoolId}/partial_payins/${payinId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getIncomePartialPayin(token, schoolId, payinId) {
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/partial_payins/${payinId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getIncomePayout(token, schoolId, payoutId) {
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/payouts/${payoutId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getSchoolFulfillment(token, schoolId, fultillmentId) {
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/fulfillments/${fultillmentId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getConcepts(token, schoolId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/concepts/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  getGuardiansOnSchool(token, schoolId, search, phone, email) {
    if (search || (phone && email)) {
      const params = { search, phone, email };
      return middleware(
        _axios.get(`/dashboard/schools/${schoolId}/guardians/${formatParams(params)}`, headerWithAuthorization(token)),
        [middleware401]
      );
    } else {
      return middleware(_axios.get(`/dashboard/schools/${schoolId}/guardians/`, headerWithAuthorization(token)), [
        middleware401,
      ]);
    }
  },
  getGuardian(token, schoolId, guardianId) {
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/guardians/${guardianId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getGuardianDetail(token, guardianId) {
    return middleware(_axios.get(`/dashboard/guardians/${guardianId}/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  getStudentsOnSchool(token, schoolId, search, identifier) {
    if (search) {
      const params = { search };
      return middleware(
        _axios.get(`/dashboard/schools/${schoolId}/students/${formatParams(params)}`, headerWithAuthorization(token)),
        [middleware401]
      );
    } else if (identifier) {
      const params = { identifier };
      return middleware(
        _axios.get(`/dashboard/schools/${schoolId}/students/${formatParams(params)}`, headerWithAuthorization(token)),
        [middleware401]
      );
    } else {
      return middleware(_axios.get(`/dashboard/schools/${schoolId}/students/`, headerWithAuthorization(token)), [
        middleware401,
      ]);
    }
  },
  getStudentsOfTheGuardian(token, schoolId, guardianId) {
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/guardians/${guardianId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getOrdersOfTheGuardian(token, guardianId) {
    const params = { status: 'DUE,OUTSTANDING' };
    return middleware(
      _axios.get(`/dashboard/guardians/${guardianId}/orders/${formatParams(params)}`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  saveManualPay(
    token,
    schoolId,
    guardian,
    paid_date,
    type,
    fulfillments,
    optional_orders,
    manual_payment_account,
    generate_invoice,
    comment,
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
      transaction_reference: transaction_reference || null,
      sender_account_number: sender_account_number || null,
      card_last_digits: card_last_digits || null,
      bank_name: bank_name || null,
      is_partial: is_partial,
      total,
    };
    return middleware(_axios.post(`/dashboard/schools/${schoolId}/payins/`, data, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  getManualPayDetail(token, studentId, orderId) {
    return middleware(
      _axios.get(`/dashboard/students/${studentId}/orders/${orderId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getDelinquencyHistoric(token, schoolId, conceptId) {
    const formatConceptsParams = (concepts) => (concepts.length ? '?concepts=' + concepts.join(',') : '');

    return middleware(
      _axios.get(
        `/dashboard/schools/${schoolId}/delinquency/historic/${formatConceptsParams(conceptId)}`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    );
  },
  getDelinquencyStats(token, schoolId, conceptId) {
    const params = { concepts: conceptId };
    return middleware(
      _axios.get(
        `/dashboard/schools/${schoolId}/delinquency/stats/${formatParams(params)}`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    );
  },

  getStudentsDelinquency(token, schoolId, conceptId, startDate, endDate, page) {
    const params = { concepts: conceptId, start_date: startDate, end_date: endDate, page };
    return middleware(
      _axios
        .get(
          `/dashboard/schools/${schoolId}/delinquency/students/${formatParamsForDelinquencyStudents(params)}`,
          headerWithAuthorization(token),
          [middleware401]
        )
        .then((res) => res.data)
    );
  },
  getStudentsDelinquencyExcel(token, schoolId, conceptId, startDate, endDate) {
    const params = { concepts: conceptId, start_date: startDate, end_date: endDate };
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/delinquency/students/xlsx/${formatParams(params)}`, {
        ...headerWithAuthorization(token),
        responseType: 'blob',
      }),
      [middleware401]
    );
  },
  getNextPage(token, link) {
    return middleware(axios.get(link, headerWithAuthorization(token)), [middleware401]);
  },
  fetchIncomes(token, schoolId, startDate, endDate, isManual) {
    const params = { is_manual: isManual, start_date: startDate, end_date: endDate };
    return middleware(
      _axios.get(
        `/dashboard/schools/${schoolId}/fulfillments/historic/${formatParams(params)}`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    );
  },
  getBankAccounts(token, schoolId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/bank_accounts/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  createSpecialDiscount(token, schoolId, discountName, discountValue, studentId, orderId, typeDiscount = 'FIXED') {
    const data = {
      name: discountName,
      student: studentId,
      order: orderId,
      type: typeDiscount,
    };
    if (discountValue) data.value = parseFloat(discountValue);
    return middleware(
      _axios.post(`dashboard/schools/${schoolId}/special_discounts/`, data, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  deleteSpecialDiscount(token, schoolId, discountId) {
    return middleware(
      _axios.delete(`dashboard/schools/${schoolId}/special_discounts/${discountId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  fetchIncomesResume(token, schoolId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/payouts/resume/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  getStudentDetail(token, schoolId, studentId) {
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/due_orders/students/${studentId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getAssignmentsForStudent(token, studentId, ended) {
    const params = {
      ended: ended,
    };
    return middleware(
      _axios.get(
        `/dashboard/students/${studentId}/assignments/${formatParams(params)}`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    );
  },
  getAssignmentDetail(token, studentId, assignmentId) {
    return middleware(
      _axios.get(`/dashboard/students/${studentId}/assignments/${assignmentId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getScholarshipsForStudent(token, studentId) {
    return middleware(_axios.get(`/dashboard/students/${studentId}/scholarships/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  getScholarshipsOldForStudent(token, studentId) {
    return middleware(
      _axios.get(`/dashboard/students/${studentId}/expired_scholarships/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getDueOrdersForStudent(token, studentId, concepts) {
    const params = { concepts };
    const formattedParams = formatParams(params);
    const statusParams = formattedParams
      ? '&status=DUE&status=PENDING&status=OUTSTANDING'
      : '?status=DUE&status=PENDING&status=OUTSTANDING';
    return middleware(
      _axios.get(
        `/dashboard/students/${studentId}/orders/${formattedParams}${statusParams}`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    );
  },
  getMe(token, schoolId) {
    return middleware(_axios.get(`/dashboard/schools/${schoolId}/admins/me/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  fetchConceptAssignments(token, studentId) {
    return middleware(_axios.get(`/dashboard/students/${studentId}/concepts/`, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  getConceptAssignmentDetail(token, studentId, conceptId) {
    return middleware(
      _axios.get(`/dashboard/students/${studentId}/concepts/${conceptId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  postConceptAssignment(token, studentId, conceptId, ordersToSkip, isOptional = false, start_date, end_date) {
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

    return middleware(
      _axios.post(`/dashboard/students/${studentId}/assignments/`, params, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  patchConceptAssignment(
    token,
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

    return middleware(
      _axios.patch(
        `/dashboard/students/${studentId}/assignments/${assignmentId}/`,
        params,
        headerWithAuthorization(token)
      ),
      [middleware401]
    );
  },
  deleteConceptAssignment(token, studentId, assignmentId, flagOptional) {
    return middleware(
      _axios.delete(
        `/dashboard/students/${studentId}/assignments/${assignmentId}/${
          flagOptional ? 'destroy_optional_assignment/' : ''
        }`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    );
  },
  fetchScholarshipAssignments(token, studentId) {
    return middleware(
      _axios.get(`/dashboard/students/${studentId}/available_scholarships/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getScholarshipAssignmentDetail(token, studentId, scholarshipId) {
    return middleware(
      _axios.get(
        `/dashboard/students/${studentId}/available_scholarships/${scholarshipId}/`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    );
  },
  postScholarshipAssignment(token, studentId, scholarshipId, orders_to_skip) {
    const params = {
      scholarship: scholarshipId,
      orders_to_skip,
    };
    return middleware(
      _axios.post(`/dashboard/students/${studentId}/available_scholarships/`, params, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  deleteScholarshipAssignment(token, studentId, scholarshipId) {
    return middleware(
      _axios.delete(`/dashboard/students/${studentId}/scholarships/${scholarshipId}/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  pacthMe(token, schoolId, data) {
    return middleware(_axios.patch(`/dashboard/schools/${schoolId}/admins/me/`, data, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  assignGuardianToStudent(token, studentId, guardian) {
    return middleware(
      _axios.post(`/dashboard/students/${studentId}/guardians/`, { guardian }, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getStudentViewMoreInfo(token, studentId) {
    return middleware(_axios.get(`/dashboard/students/${studentId}/`, headerWithAuthorization(token)), [middleware401]);
  },
  patchStudentViewMoreInfo(token, studentId, data) {
    return middleware(_axios.patch(`/dashboard/students/${studentId}/`, data, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  createStudent(token, schoolId, data) {
    return middleware(_axios.post(`/dashboard/schools/${schoolId}/students/`, data, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  patchGuardianDetail(token, guardianId, data) {
    return middleware(_axios.patch(`/dashboard/guardians/${guardianId}/`, data, headerWithAuthorization(token)), [
      middleware401,
    ]);
  },
  sendWhatsappInvite(token, guardianId, action) {
    const data = { action };
    return middleware(
      _axios.post(`/dashboard/guardians/${guardianId}/outbound/`, data, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getIncriptionsDetail(token, schoolId) {
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/students/inscriptions/summary/`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  getAttributesGroupByType(token, schoolId) {
    return middleware(
      _axios.get(`/dashboard/schools/${schoolId}/attributes?group_by_type="true"`, headerWithAuthorization(token)),
      [middleware401]
    );
  },
  generateCollectionsReport(token, schoolId, { schoolCycle, concepts }) {
    const params = {
      school_cycle: schoolCycle,
      concepts,
    };
    return middleware(
      _axios.post(
        `dashboard/schools/${schoolId}/collection_efficiency/xls_v2/${formatParams(params)}`,
        {
          ...params,
        },
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
  getCollectionTable(token, schoolId, { schoolCycle, concepts, cycleInfo }) {
    const params = {
      school_cycle: schoolCycle,
      concepts,
      month: cycleInfo?.month,
      year: cycleInfo?.year,
    };

    return middleware(
      _axios.get(
        `dashboard/schools/${schoolId}/collections/table/${formatParamsWithComma(params)}`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
  getCollectionGraphic(token, schoolId, { schoolCycle, concepts }) {
    const params = {
      school_cycle: schoolCycle,
      concepts,
    };

    return middleware(
      _axios.get(
        `dashboard/schools/${schoolId}/collections/graphic/${formatParamsWithComma(params)}`,
        headerWithAuthorization(token)
      ),
      [middleware401]
    ).then((res) => res.data);
  },
};

export default ApiClient;
