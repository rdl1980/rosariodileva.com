#!/usr/bin/env python3
"""Scarica il feed Substack e lo riduce al minimo che serve alla home.

Gira in CI, non nel browser: il sito legge il JSON risultante dal proprio
dominio, senza proxy di terze parti. Tutto quello che finisce nel JSON e' testo
gia' ripulito, cosi' la pagina non deve interpretare markup che non controlla.
"""

import html
import json
import os
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

BASE = "https://rosariodileva.substack.com"
FEED = BASE + "/feed"
# Substack risponde 403 agli IP dei runner se la richiesta non somiglia a un
# browser: servono User-Agent e Accept credibili, e qualche tentativo.
API = BASE + "/api/v1/archive?sort=new&limit=%d"
OUT = os.path.join("assets", "substack.json")
QUANTI = 3
MAX_DESC = 140
TENTATIVI = 4

HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"),
    "Accept": "application/rss+xml, application/xml, text/xml, application/json;q=0.9, */*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
}

MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
        "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"]


def testo(node):
    return (node.text or "").strip() if node is not None else ""


def spoglia(markup):
    """Via i tag, via le entita', via gli spazi doppi. Resta testo puro."""
    senza_tag = re.sub(r"<[^>]+>", " ", markup or "")
    return re.sub(r"\s+", " ", html.unescape(senza_tag)).strip()


def data_italiana(pub_date):
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z"):
        try:
            d = datetime.strptime(pub_date.strip(), fmt)
            return "%d %s %d" % (d.day, MESI[d.month - 1], d.year)
        except ValueError:
            continue
    return ""


def url_sicuro(link):
    return link if link.startswith(("http://", "https://")) else ""


def scarica(url):
    """Un GET con qualche tentativo: i 403 di Substack sono spesso transitori."""
    ultimo = None
    for n in range(TENTATIVI):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:
            ultimo = e
            print("  tentativo %d fallito: %s" % (n + 1, e))
            time.sleep(3 * (n + 1))
    raise ultimo


def taglia(desc):
    return desc[:MAX_DESC].rstrip() + "…" if len(desc) > MAX_DESC else desc


def da_rss():
    root = ET.fromstring(scarica(FEED))
    voci = []
    for item in root.iter("item"):
        link = url_sicuro(testo(item.find("link")))
        if not link:
            continue
        voci.append({
            "title": spoglia(testo(item.find("title"))),
            "link": link,
            "date": data_italiana(testo(item.find("pubDate"))),
            "desc": taglia(spoglia(testo(item.find("description")))),
        })
        if len(voci) == QUANTI:
            break
    return voci


def da_api():
    """Rete di scorta: l'archivio pubblico, che a volte passa quando l'RSS no."""
    dati = json.loads(scarica(API % QUANTI).decode("utf-8"))
    voci = []
    for p in dati:
        link = url_sicuro(p.get("canonical_url") or "")
        if not link:
            continue
        d = ""
        stamp = (p.get("post_date") or "")[:10]
        if len(stamp) == 10:
            a, m, g = stamp.split("-")
            d = "%d %s %s" % (int(g), MESI[int(m) - 1], a)
        voci.append({
            "title": spoglia(p.get("title") or ""),
            "link": link,
            "date": d,
            "desc": taglia(spoglia(p.get("subtitle") or p.get("description") or "")),
        })
    return voci


def main():
    voci = []
    for nome, fonte in (("RSS", da_rss), ("archivio", da_api)):
        try:
            print("Provo il feed via %s..." % nome)
            voci = fonte()
            if voci:
                break
        except Exception as e:
            print("  %s non disponibile: %s" % (nome, e))

    if not voci:
        print("Nessuna fonte raggiungibile: lascio assets/substack.json com'e'.")
        return 1

    os.makedirs("assets", exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"posts": voci}, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("Scritti %d post in %s" % (len(voci), OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
