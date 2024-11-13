const encrypt = require("./crypto.cjs");
const CryptoJS = require("crypto-js");
const { default: axios } = require("axios");
const { cookieObjToString, toBoolean } = require("./index.cjs");
const { APP_CONF } = require("./config.json");
const osMap = {
  pc: {
    os: "pc",
    appver: "3.0.18.203152",
    osver: "Microsoft-Windows-10-Professional-build-22631-64bit",
  },
  android: {
    os: "android",
    appver: "9.1.71",
    osver: "14",
    brand: "Redmi",
  },
  iphone: {
    os: "iOS",
    appver: "9.0.90",
    osver: "16.2",
  },
};

const chooseUserAgent = async (crypto, uaType = "pc") => {
  const userAgentMap = {
    weapi: {
      pc: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
    },
    api: {
      pc: "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152",
      android:
        "NeteaseMusic/9.1.65.240927161425(9001065);Dalvik/2.1.0 (Linux; U; Android 14; 23013RK75C Build/UKQ1.230804.001)",
      iphone: "NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)",
    },
  };
  return userAgentMap[crypto][uaType] || "";
};
const generateCookie = (cookie) => {
  let _ntes_nuid = CryptoJS.lib.WordArray.random(32).toString();
  let os = osMap[cookie.os] || osMap["android"];
  cookie = {
    ...cookie,
    __remember_me: "true",
    ntes_kaola_ad: "1",
    _ntes_nuid: _ntes_nuid,
    _ntes_nnid: `${_ntes_nuid},${Date.now().toString()}`,
    osver: cookie.osver || os.osver,
    deviceId: cookie.deviceId || global.deviceId,
    os: cookie.os || os.os,
    channel: cookie.channel || "netease",
    appver: cookie.appver || os.appver,
  };
  return cookie;
};

/// @param {string} options.crypto
/// @param {object} options.headers
/// @param {object} options.cookie
const createRequest = async (uri, data, options) => {
  let headers = options.headers;
  let cookie = options.cookie;
  let crypto = options.crypto;
  cookie = generateCookie(cookie);
  if (uri.indexOf("login") === -1) {
    cookie["NMTID"] = CryptoJS.lib.WordArray.random(16).toString();
  }
  headers["Cookie"] = cookieObjToString(cookie);
  headers["Content-Type"] = "application/x-www-form-urlencoded";

  let url = "",
    encryptData = "",
    csrfToken = cookie["__csrf"] || "";

  // 根据加密方式加密请求数据
  switch (crypto) {
    case "weapi":
      headers["Referer"] = APP_CONF.domain;
      headers["User-Agent"] = options.ua || chooseUserAgent("weapi");
      data.csrf_token = csrfToken;
      encryptData = encrypt.weapi(data);
      url = APP_CONF.domain + "/weapi/" + uri.substr(5);
      break;

    case "linuxapi":
      headers["User-Agent"] =
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36";
      encryptData = encrypt.linuxapi({
        method: "POST",
        url: APP_CONF.apiDomain + uri,
        params: data,
      });
      url = APP_CONF.apiDomain + "/api/linux/forward";
      break;

    case "eapi":
    case "api": { // 两种加密方式，都应生成客户端的cookie
      const header = Object.assign({}, cookie, {
        versioncode: "9001071", //版本号
        mobilename: "23113RKC6C", //设备model
        buildver: Date.now().toString().substr(0, 10),
        resolution: "2560x1600", //设备分辨率
        __csrf: csrfToken,
        requestId: `${Date.now()}_${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(4, "0")}`,
      });

      headers["Cookie"] = cookieObjToString(header);
      headers["User-Agent"] = chooseUserAgent("api");

      if (crypto === "eapi") {
        // 使用eapi加密
        data.header = header;
        data.e_r =
          options.e_r != undefined
            ? options.e_r
            : data.e_r != undefined
            ? data.e_r
            : APP_CONF.encryptResponse; // 用于加密接口返回值
        data.e_r = toBoolean(data.e_r);
        encryptData = encrypt.eapi(uri, data);
        url = APP_CONF.apiDomain + "/eapi/" + uri.substr(5);
      } else if (crypto === "api") {
        // 不使用任何加密
        url = APP_CONF.apiDomain + uri;
        encryptData = data;
      }
      break;
    }

    default:
      // 未知的加密方式
      throw new Error("Unknown Crypto: " + crypto);
  }
  const config = {
    url,
    headers,
    data: encryptData,
    method: "POST",
  };
  const res = await axios(config);
  let resData = res.data;
  let resCookie = (res.headers["set-cookie"] || []).map((x) =>
    x.replace(/\s*Domain=[^(;|$)]+;*/, "")
  );
  if (res.e_r) {
    // eapi接口返回值被加密，需要解密
    resData = encrypt.eapiResDecrypt(resData.toString("hex").toUpperCase());
  } else {
    resData =
      typeof resData == "object" ? resData : JSON.parse(resData.toString());
  }
  return {
    status: res.status,
    data: resData,
    cookie: resCookie,
  };
};

module.exports = createRequest;
