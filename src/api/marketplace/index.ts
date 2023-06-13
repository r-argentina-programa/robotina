import replyApi from './reply/replyApi';
import studentApi from './student/studentApi';
import submissionApi from './submission/submissionApi';
import taskApi from './task/TaskApi';
import threadApi from './thread/threadApi';
import userApi from './user/userApi';

const marketplace = {
  replyApi,
  studentApi,
  submissionApi,
  taskApi,
  threadApi,
  userApi,
};

export default marketplace;
