// Typing for the CryptoJs parts:
// + md5-min.js
// + sha512-min.js

interface CryptoJS { 
    MD5 (value:string): string;
}
declare var CryptoJS: CryptoJS;
