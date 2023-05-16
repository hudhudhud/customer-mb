const CryptoJS = require("crypto-js");
function encryptUser(uid) {
  let iv = "0000000000000000";
  // 加密内容
  let word = uid + "|" + formatTime(new Date());
  // 密钥，长度必须为16
  let secret_key = "1234567890123456";
  // utf-8 转换
  // @ts-ignore
  word = CryptoJS.enc.Utf8.parse(word);
  // @ts-ignore
  secret_key = CryptoJS.enc.Utf8.parse(secret_key);
  // @ts-ignore
  iv = CryptoJS.enc.Utf8.parse(iv);
  // Encrypt
  const cipherText = CryptoJS.AES.encrypt(word, secret_key, {
    // @ts-ignore
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return cipherText.toString();
}
const formatTime = (date, type = "date") => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  if (type === "datetime") {
    return (
      [year, month, day].map(formatNumber).join("-") +
      " " +
      [hour, minute, second].map(formatNumber).join(":")
    );
  }
  return [year, month, day].map(formatNumber).join("-");
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : "0" + n;
};
export { encryptUser };

