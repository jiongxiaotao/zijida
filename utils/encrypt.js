var aesjs = require('aes-js.js')
/***
 * 
 * atob   和 btoa
 * 二进制 ASCII互转，用于编码解码base64
 */
var base64hash = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
// btoa method
//base64 编码
function _btoa(s) {
  if (/([^\u0000-\u00ff])/.test(s)) {
    throw new Error('INVALID_CHARACTER_ERR');
  }
  var i = 0,
    prev,
    ascii,
    mod,
    result = [];

  while (i < s.length) {
    ascii = s.charCodeAt(i);
    mod = i % 3;

    switch (mod) {
      // 第一個6位只需要讓8位二進制右移兩位
      case 0:
        result.push(base64hash.charAt(ascii >> 2));
        break;
      //第二個6位 = 第一個8位的後兩位 + 第二個8位的前4位
      case 1:
        result.push(base64hash.charAt((prev & 3) << 4 | (ascii >> 4)));
        break;
      //第三個6位 = 第二個8位的後4位 + 第三個8位的前2位
      //第4個6位 = 第三個8位的後6位
      case 2:
        result.push(base64hash.charAt((prev & 0x0f) << 2 | (ascii >> 6)));
        result.push(base64hash.charAt(ascii & 0x3f));
        break;
    }

    prev = ascii;
    i++;
  }

  // 循環結束後看mod, 為0 證明需補3個6位，第一個為最後一個8位的最後兩位後面補4個0。另外兩個6位對應的是異常的“=”；
  // mod為1，證明還需補兩個6位，一個是最後一個8位的後4位補兩個0，另一個對應異常的“=”
  if (mod == 0) {
    result.push(base64hash.charAt((prev & 3) << 4));
    result.push('==');
  } else if (mod == 1) {
    result.push(base64hash.charAt((prev & 0x0f) << 2));
    result.push('=');
  }

  return result.join('');
}
//解码 成 ASCII
function _atob(s) {
  s = s.replace(/\s|=/g, '');
  var cur,
    prev,
    mod,
    i = 0,
    result = [];

  while (i < s.length) {
    cur = base64hash.indexOf(s.charAt(i));
    mod = i % 4;

    switch (mod) {
      case 0:
        //TODO
        break;
      case 1:
        result.push(String.fromCharCode(prev << 2 | cur >> 4));
        break;
      case 2:
        result.push(String.fromCharCode((prev & 0x0f) << 4 | cur >> 2));
        break;
      case 3:
        result.push(String.fromCharCode((prev & 3) << 6 | cur));
        break;

    }

    prev = cur;
    i++;
  }
  return result.join('');
}
  function encryptSnyc(str) {
    var ret = _queryKey(true);
    var ep;
    if (ret.error) {
      ep = gen_err_ep(ret.textStatus, ret.errorText);
    } else {
      ep = _doEncrypt(str, ret);
    }
    return ep;
  }

  function encrypt(str, cb) {
    var ep;
    var ret = _queryKey(false, function (ret) {
      ep = _doEncrypt(str, ret);
      cb && cb(ep);
    }, function (xhr, textStatus, errorText) {
      cb && cb(gen_err_ep(textStatus, errorText))
    });
  }

  function gen_err_ep(textStatus, errorText) {
    return {
      success: false,
      error: textStatus + " " + errorText
    }
  }

  function padding(textBytes) {
    var n = 16 - textBytes.length % 16;
    // PKCS5Padding 补(16-len)个(16-len)  , 刚好16则补16个16
    var bytes = new Array(textBytes.length + n);
    for (var i = 0; i < textBytes.length; i++)
      bytes[i] = textBytes[i];
    for (var i = 0; i < n; i++)
      bytes[textBytes.length + i] = n;
    return bytes;
  }

  function _doEncryptNavie(str, key) {
    var textBytes = aesjs.utils.utf8.toBytes(str);
    textBytes = padding(textBytes);

    var iv = [90, 90, 88, 74, 111, 79, 76, 118, 111, 84, 74, 53, 117, 50, 66, 70];
    var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
    var encryptedBytes = aesCbc.encrypt(textBytes);

    var encryptedStr = String.fromCharCode.apply(null, encryptedBytes);
    // To print or store the binary data, you may convert it to hex
    // var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return _toSafeBase64(encryptedStr)
  }

  function _doEncrypt(str, obj) {
    try {
      var secStr = _fromSafeBase64(obj.secKey)
      var key = [];
      for (var i = 0; i < secStr.length; i++)
        key.push(secStr.charCodeAt(i));

      return {
        success: true,
        id: obj.id,
        encrypted: _doEncryptNavie(str, key)
      }
    } catch (e) {
      return {
        success: false,
        error: e.toString() + " - encrypt fail"
      }
    }
  }

  // {
  //     "id": 6, // 口令序号
  //     "secKey": "QVJaN3Qza0lvWVp3M0RCaA",  //口令
  // }
  function _queryKey(sync, succ, err) {
    var val;
    wx.request({
      url: 'https://www.ccbynt.cn/ynt/security/newkey',
      async: !sync,
      dataType: "json",
      success: function (ret) {
        val = ret;
        succ && succ(ret);
      },
      error: function (jqXHR, textStatus, serverErrorText) {
        val = {
          error: true,
          jqXHR: jqXHR,
          textStatus: textStatus,
          errorText: serverErrorText
        }
        err && err(jqXHR, textStatus, serverErrorText);
      }
    })

    if (sync) return val;
  }

  function _toSafeBase64(str) {
    var base64Str = _btoa(str);
    return base64Str.replace(/[+\/]/g, function (m0) {
      return m0 == '+' ? '-' : '_';
    }).replace(/=/g, '');
  }
  // 将url safe Base64编码中的"-"，"_"字符串转换成"+"，"/"，字符串长度余4倍的位补"="
  function _fromSafeBase64(base64Str) {
    base64Str = base64Str.replace(/[-_]/g, function (m0) {
      return m0 == '-' ? '+' : '/'
    });
    var mod4 = base64Str.length % 4;
    if (mod4 > 0) {
      base64Str = base64Str + "====".substring(0, mod4);
    }
    return _atob(base64Str);
  }

  function _encryptDft(str) {
    if (str.substr(0, 3) === "01!") {  // 已经是加密串了，不再二次加密
      return {
        success: true,
        duplicate: true,
        encrypted: str
      };
    }
    var ret = this.doEncrypt(str, {
      'secKey': this.staticK
    });
    if (ret.success)
      ret.encrypted = "01!" + ret.encrypted;
    return ret;
  }

  //解密函数 (´ο｀*)
  function decrypt(safe64) {
  	function safe64ToByteArr(safe64) {
  		var tmp = PJF.aesEncrypt._fromSafeBase64(safe64);
  		var encryptedBytes = [];
  		for(var i = 0; i < tmp.length; i++) {
  			encryptedBytes.push(tmp.charCodeAt(i));
  		}
  		return encryptedBytes;
  	}

  	safe64 = safe64.replace(/^01!/, "");
  	var key = safe64ToByteArr(PJF.aesEncrypt.staticK);
  	var encryptedBytes = safe64ToByteArr(safe64);

  	var iv = [90, 90, 88, 74, 111, 79, 76, 118, 111, 84, 74, 53, 117, 50, 66, 70];
  	var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  	var decryptedBytes = aesCbc.decrypt(encryptedBytes);

  	return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }


  module.exports= {
    atob:_atob,
    btoa:_btoa,
    encryptSnyc: encryptSnyc,
    encrypt: encrypt,
    queryKey: _queryKey,
    doEncrypt: _doEncrypt,
    toSafeBase64: _toSafeBase64,
    fromSafeBase64: _fromSafeBase64,
    doEncryptNavie: _doEncryptNavie,
    staticK: "VzBTTlhXbFBOSXAzNkRSMA",
    encryptDft: _encryptDft,
    decrypt: decrypt
  }



