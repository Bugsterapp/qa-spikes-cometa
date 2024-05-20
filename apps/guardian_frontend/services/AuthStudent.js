import ApiClient from '~/services/ApiClient';

const handleError = (error, errorHook) => {
  if (!error.response) {
    errorHook(502); // No response
  } else {
    errorHook(error.response.status);
  }
};

export default async function AuthStudent(studentHash, callback, errorHook) {
  let studentId;
  // auth student
  await ApiClient.authStudent(studentHash)
    .then((res) => {
      studentId = res.data.id;
    })
    .catch((error) => {
      handleError(error, errorHook);
    });
  if (!studentId) {
    return;
  }
  // get student info
  await ApiClient.getStudent(studentId, studentHash)
    .then((res) => {
      callback(res);
    })
    .catch((error) => {
      handleError(error, errorHook);
    });
}
