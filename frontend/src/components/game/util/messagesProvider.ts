export const messagesProvider = (message: string, userList: string[]) => {
  //メッセージはユーザ名:メッセージという形式
  const parsedMessage = message.split("@");
  const userName = parsedMessage[0];
  const userMessage = parsedMessage[1];
  //ユーザ名がuserListに含まれているか確認
  //含まれている場合はインデックスも返す
  if (userList.includes(userName)) {
    return { msg: userMessage, index: userList.indexOf(userName) };
  }
  return { msg: userMessage, index: -1 };
};
