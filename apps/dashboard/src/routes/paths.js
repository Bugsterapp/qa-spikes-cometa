// ----------------------------------------------------------------------

function path(root, subLink) {
  return `${root}${subLink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_PORTAL = '/';

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  logout: path(ROOTS_AUTH, '/logout'),
};

export const PATH_STUDENT = (studentId) => ({
  root: `/student/detail/${studentId}`,
});

export const PATH_PORTAL = {
  root: ROOTS_PORTAL,
  schools: {
    root: path(ROOTS_PORTAL, 'schools'),
    onlyOne: (schoolId) => path(ROOTS_PORTAL, `schools/${schoolId}`),
  },
  pay: {
    root: path(ROOTS_PORTAL, 'pay'),
    manual: path(ROOTS_PORTAL, 'pay/manual'),
  },
  income: {
    root: path(ROOTS_PORTAL, 'income'),
  },
  payments: {
    root: path(ROOTS_PORTAL, 'payments'),
  },
  concepts: {
    root: path(ROOTS_PORTAL, 'concepts'),
  },
  charge: {
    root: path(ROOTS_PORTAL, 'charge'),
  },
  student: {
    root: path(ROOTS_PORTAL, 'student'),
  },
  proofOfPayment: {
    root: path(ROOTS_PORTAL, 'proof-of-payment'),
  },
};

export const PATH_PAGE = {
  about: '/about-us',
  contact: '/contact-us',
  page404: '/404',
  page500: '/500',
  components: '/components',
};
