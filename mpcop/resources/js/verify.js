
var ec = new elliptic.ec('p256')


function verifySchnorrSignature(plaintext, pubKeyString, s, e) {

    // Message * G
    var encoder = new TextEncoder();
    var encodedPlain = encoder.encode(plaintext);

    var message_bi = new BN(encodedPlain);


    message_bi = ec.g.mul(message_bi);

    var pubKey = ec.keyFromPublic(pubKeyString, 'hex');
    
    // rv = sG+eY
    var Sg = ec.g.mul(s);
    var eY = pubKey.getPublic().mul(e);
    var rv = Sg.add(eY);
    
    // ev = H(m||rv)
    var sha256 = CryptoJS.algo.SHA256.create();
    sha256.update(CryptoJS.enc.Hex.parse(message_bi.encode('hex')));
    sha256.update(CryptoJS.enc.Hex.parse(rv.encode('hex')));
    var ev = sha256.finalize();
    
    var ev_bn = new BN(ev.toString(CryptoJS.enc.Hex), 16);
    var e_bn = new BN(e, 16);

    // ev = ev mod n
    ev_bn = ev_bn.mod(ec.n);
    // console.log(ev_bn.toString('hex'));
    // console.log(ev_bn.toString('hex'));

   return e_bn.cmp(ev_bn) == 0;
}

// plaintext = message * G
/*
var plaintext = "04CEF66D6B2A3A993E591214D1EA223FB545CA6C471C48306E4C36069404C5723F878662A229AAAE906E123CDD9D3B4C10590DED29FE751EEECA34BBAA44AF0773";
var plaintext = '0001';
var s = "0734F02E1060411D505F1E543A77CC74439F3D069A1129F2B47594138BE761C6";
var e = "DED99A6009CD75F682CC7DFEA0CC959C1B6DEF2FB9639EAB58B750C0E8393EC5";
var pubkey = "04935CC4124CB713DFED3A57AEDA6F4C626B61BF29EF9398DD78AF5A0AFF8633467B891931356BF06BE53FB4D3FED2DD8645E956F9F60046136338DCD7BED3FF0F";
console.log(verifySchnorrSignature(plaintext, pubkey, s, e));
*/
