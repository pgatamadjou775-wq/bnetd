/*  Contact BNETD → QR code (carte de visite numérique, format vCard)
    Utilisé par la tablette (écran « Merci ») et par le back-office (aperçu).
    Nécessite assets/qrcode.js (qrcode-generator, licence MIT), chargé avant ce fichier. */
(function (g) {
  'use strict';

  // Les accents (Koné, Aka…) doivent partir en UTF-8, comme le lisent les téléphones.
  if (g.qrcode && g.qrcode.stringToBytesFuncs && g.qrcode.stringToBytesFuncs['UTF-8']) {
    g.qrcode.stringToBytes = g.qrcode.stringToBytesFuncs['UTF-8'];
  }

  var ORGANISATION = 'BNETD';

  // Échappement des valeurs vCard (RFC 2426)
  function echapper(s) {
    return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }

  // « 07 07 07 07 07 » → « +2250707070707 » : le numéro fonctionne quel que soit le pays du visiteur.
  function telInternational(v) {
    var brut = String(v || '').replace(/[^\d+]/g, '');
    if (brut.indexOf('00') === 0) brut = '+' + brut.slice(2);
    var chiffres = brut.replace(/\+/g, '');
    if (chiffres.length < 8) return '';
    if (brut.charAt(0) === '+') return '+' + chiffres;
    if (chiffres.indexOf('225') === 0 && chiffres.length === 13) return '+' + chiffres;
    if (chiffres.length === 10 && chiffres.charAt(0) === '0') return '+225' + chiffres;
    return chiffres;
  }

  // Un contact est « prêt » s'il a un nom et un numéro exploitable
  function pret(c) {
    return !!(c && String(c.nom || '').trim() && telInternational(c.telephone));
  }

  function vcard(c) {
    var nom = String(c.nom || '').trim().replace(/\s+/g, ' ');
    var l = ['BEGIN:VCARD', 'VERSION:3.0', 'N:' + echapper(nom) + ';;;;', 'FN:' + echapper(nom), 'ORG:' + ORGANISATION];
    if (c.fonction) l.push('TITLE:' + echapper(String(c.fonction).trim()));
    var tel = telInternational(c.telephone);
    if (tel) l.push('TEL;TYPE=WORK,VOICE:' + tel);
    if (c.email) l.push('EMAIL;TYPE=WORK,INTERNET:' + echapper(String(c.email).trim()));
    l.push('END:VCARD');
    return l.join('\r\n');
  }

  // Dessin du QR en SVG : sombre sur blanc, marge de 4 modules (norme), net à toutes les tailles
  function svg(texte, libelle) {
    // Niveau M (plus robuste) ; si le code devient trop dense pour un scan confortable, niveau L.
    function fabriquer(niveau) { var q = g.qrcode(0, niveau); q.addData(texte, 'Byte'); q.make(); return q; }
    var qr = fabriquer('M');
    if (qr.getModuleCount() > 53) qr = fabriquer('L');
    var n = qr.getModuleCount(), marge = 4, t = n + marge * 2, d = '';
    for (var r = 0; r < n; r++) {
      var c = 0;
      while (c < n) {
        if (qr.isDark(r, c)) {
          var debut = c;
          while (c < n && qr.isDark(r, c)) c++;
          d += 'M' + (debut + marge) + ' ' + (r + marge) + 'h' + (c - debut) + 'v1h-' + (c - debut) + 'z';
        } else c++;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges" role="img"' +
      ' aria-label="' + String(libelle || 'QR code').replace(/[&<>"]/g, '') + '">' +
      '<rect width="' + t + '" height="' + t + '" fill="#fff"/><path fill="#061F4A" d="' + d + '"/></svg>';
  }

  g.BNETD_CONTACT = { vcard: vcard, svg: svg, pret: pret, telInternational: telInternational };
})(window);
