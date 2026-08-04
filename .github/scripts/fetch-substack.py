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
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

FEED = "https://rosariodileva.substack.com/feed"
OUT = os.path.join("assets", "substack.json")
QUANTI = 3
MAX_DESC = 140

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


def main():
    req = urllib.request.Request(FEED, headers={"User-Agent": "rosariodileva.com feed sync"})
    with urllib.request.urlopen(req, timeout=30) as r:
        xml = r.read()

    root = ET.fromstring(xml)
    voci = []
    for item in root.iter("item"):
        link = url_sicuro(testo(item.find("link")))
        if not link:
            continue
        desc = spoglia(testo(item.find("description")))
        if len(desc) > MAX_DESC:
            desc = desc[:MAX_DESC].rstrip() + "…"
        voci.append({
            "title": spoglia(testo(item.find("title"))),
            "link": link,
            "date": data_italiana(testo(item.find("pubDate"))),
            "desc": desc,
        })
        if len(voci) == QUANTI:
            break

    if not voci:
        print("Il feed non ha restituito voci utilizzabili: non tocco il JSON.")
        return 1

    os.makedirs("assets", exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"posts": voci}, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("Scritti %d post in %s" % (len(voci), OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
