import { showAlert } from './alerts.js';
export const updateData = async (data, type) => {
  try {
    // console.log(email, name);
    console.log(data);
    const url = `/api/v1/users/update${
      type === 'password' ? 'MyPassword' : 'Me'
    }`;
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (res.data.status.startsWith('suc')) {
      showAlert('success', 'Updated successfully');
      // window.setTimeout(() => window.location.reload(true), 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', err.response.data.message);
  }
};
